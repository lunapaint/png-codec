/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { deepStrictEqual, fail, strictEqual } from 'assert';
import * as fs from 'fs';
import { join } from 'path';
import { EncodeError, EncodeWarning } from '../../out-dev/png.js';
import { decodePng } from '../../out-dev/pngDecoder.js';
import { encodePng } from '../../out-dev/pngEncoder.js';
import { BitDepth, ColorType, IDecodedPng, IImage32, IImage64 } from '../../typings/api.js';
import { colorTypeIdToName, dataArraysEqual } from '../testUtil.js';

const red   = [0xFF, 0x00, 0x00, 0xFF];
const green = [0x00, 0xFF, 0x00, 0xFF];
const blue  = [0x00, 0x00, 0xFF, 0xFF];
const white = [0xFF, 0xFF, 0xFF, 0xFF];
const black = [0x00, 0x00, 0x00, 0xFF];
const red16   = [0xFFFF, 0x0000, 0x0000, 0xFFFF];
const green16 = [0x0000, 0xFFFF, 0x0000, 0xFFFF];
const blue16  = [0x0000, 0x0000, 0xFFFF, 0xFFFF];
const white16 = [0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF];
const black16 = [0x0000, 0x0000, 0x0000, 0xFFFF];

describe('encode', () => {
  it('should write the fixed 8-byte signature', async () => {
    const result = (await encodePng({
      data: new Uint8Array(red),
      width: 1,
      height: 1
    })).data;
    strictEqual(result[0], 0x89);
    strictEqual(result[1], 0x50);
    strictEqual(result[2], 0x4E);
    strictEqual(result[3], 0x47);
    strictEqual(result[4], 0x0D);
    strictEqual(result[5], 0x0A);
    strictEqual(result[6], 0x1A);
    strictEqual(result[7], 0x0A);
  });
  describe('IHDR', () => {
    it('should write chunk as expected', async () => {
      const view = new DataView((await encodePng({
        data: new Uint8Array(red),
        width: 1,
        height: 1
      })).data.buffer);
      // IHDR always starts at offset 8, immediately after the signature
      strictEqual(view.getUint32(8), 13);
      strictEqual(view.getUint8(12), 73, 'I in IHDR type doesn\'t match');
      strictEqual(view.getUint8(13), 72, 'H in IHDR type doesn\'t match');
      strictEqual(view.getUint8(14), 68, 'D in IHDR type doesn\'t match');
      strictEqual(view.getUint8(15), 82, 'R in IHDR type doesn\'t match');
    });
  });
  describe('tEXt', () => {
    it('Invalid keyword length', async () => {
      try {
        await encodePng({
          data: new Uint8Array(red),
          width: 1,
          height: 1
        }, {
          ancillaryChunks: [{
            type: 'tEXt',
            keyword: 'a'.repeat(80),
            text: 'foo'
          }]
        });
      } catch (e) {
        deepStrictEqual(e, new EncodeError('tEXt: Invalid keyword length: 0 < 80 < 80', 0));
        return;
      }
      fail('exception expected');
    });
  });
  it('should throw when dimensions are 0x0', async () => {
    try {
      await encodePng({
        data: new Uint8Array([]),
        width: 0,
        height: 0
      });
    } catch {
      return;
    }
    fail('exception expected');
  });
  describe('errors', () => {
    it('should throw when image dimensions don\'t match data length', async () => {
      try {
        await encodePng({
          data: new Uint8Array(red),
          width: 2,
          height: 1
        });
      } catch {
        return;
      }
      fail('exception expected');
    });
    it('should give a warning when "upgrading" explicit color type', async () => {
      const result = await encodePng({
        data: new Uint8Array([255, 0, 0, 128, 255, 0, 0, 64]),
        width: 2,
        height: 1
      }, {
        colorType: ColorType.Truecolor
      });
      deepStrictEqual(result.warnings, [new EncodeWarning('Cannot encode image as color type Truecolor as it contains 2 transparent colors', 0)]);
    });
    it('should throw when "upgrading" explicit color type in strict mode', async () => {
      try {
        await encodePng({
          data: new Uint8Array([255, 0, 0, 128, 255, 0, 0, 64]),
          width: 2,
          height: 1
        }, {
          colorType: ColorType.Truecolor,
          strictMode: true
        });
      } catch {
        return;
      }
      fail('exception expected');
    });
  });
  describe('tRNS', () => {
    it('should encode 8-bit grayscale tRNS chunk', async () => {
      const data = new Uint8Array([255, 255, 255, 0, 128, 128, 128, 255]);
      const result = await encodePng({
        data,
        width: 2,
        height: 1
      }, {
        colorType: ColorType.Grayscale
      });
      const decoded = await decodePng(result.data, { strictMode: true });
      dataArraysEqual(decoded.image.data, data);
    });
    it('should encode 16-bit grayscale tRNS chunk', async () => {
      const data = new Uint16Array([65535, 65535, 65535, 0, 32768, 32768, 32768, 65535]);
      const result = await encodePng({
        data,
        width: 2,
        height: 1
      }, {
        colorType: ColorType.Grayscale
      });
      const decoded = await decodePng(result.data, { strictMode: true });
      dataArraysEqual(decoded.image.data, data);
    });
  });
  describe('integration', () => {
    for (const bitDepth of [undefined, 8, 16] as (BitDepth | undefined)[]) {
      for (const colorType of [
        undefined,
        ColorType.Grayscale,
        ColorType.Truecolor,
        ColorType.Indexed,
        ColorType.GrayscaleAndAlpha,
        ColorType.TruecolorAndAlpha
      ]) {
        if (colorType === ColorType.Indexed && bitDepth === 16) {
          continue;
        }
        it(`${colorTypeIdToName(colorType)} (${colorType}), bit depth ${bitDepth}`, async () => {
          const original = (bitDepth === undefined || bitDepth <= 8) ? new Uint8Array([
            ...red,  ...green,
            ...blue, ...white
          ]) : new Uint16Array([
            ...red16,  ...green16,
            ...blue16, ...white16
          ]);
          // Explicitly using a grayscale color type means only the red channel is considered
          const expected = colorType === ColorType.Grayscale || colorType === ColorType.GrayscaleAndAlpha ? (
            (bitDepth === undefined || bitDepth <= 8)
              ? new Uint8Array([
                ...white, ...black,
                ...black, ...white
              ])
              : new Uint16Array([
                ...white16, ...black16,
                ...black16, ...white16
              ])
          ) : original;
          const data = (await encodePng({
            data: original,
            width: 2,
            height: 2
          } as IImage32 | IImage64, {
            colorType,
            bitDepth
          })).data;
          const decoded = await decodePng(data, { strictMode: true });
          if (colorType === undefined) {
            strictEqual(decoded.details.colorType, bitDepth === 16 ? ColorType.Truecolor : ColorType.Indexed);
          } else {
            strictEqual(decoded.details.colorType, colorType);
          }
          if (bitDepth === undefined) {
            strictEqual(decoded.details.bitDepth, 8);
          } else {
            strictEqual(decoded.details.bitDepth, bitDepth);
          }
          dataArraysEqual(decoded.image.data, expected);
        });
      }
    }
  });
  describe('pngsuite', () => {
    const pngSuiteRoot = 'test/pngsuite/png';
    const files = fs.readdirSync(pngSuiteRoot);
    for (const file of files) {
      // Exclude broken files
      if (file.startsWith('x') && !['xcsn0g01.png', 'xhdn0g08.png'].includes(file)) {
        continue;
      }

      it(file, async () => {
        // Decode the file, encode it again, redecode it and check the colors are equal
        const data = new Uint8Array(await fs.promises.readFile(join(pngSuiteRoot, file)));
        const decoded = await decodePng(data);
        const encoded = await encodePng(decoded.image);
        await fs.promises.mkdir('out-test/images/pngsuite', { recursive: true });
        await fs.promises.writeFile(`out-test/images/pngsuite/encoded_${file}`, encoded.data);
        const decoded2 = await decodePng(encoded.data);
        dataArraysEqual(decoded2.image.data, decoded.image.data);
      });
    }
  });
  describe('imagetestsuite', () => {
    const pngSuiteRoot = 'test/imagetestsuite/png';
    const files = fs.readdirSync(pngSuiteRoot);
    for (const file of files) {
      // Exclude non-png files
      if (!file.endsWith('.png')) {
        continue;
      }

      it(file, async () => {
        // Decode the file, encode it again, redecode it and check the colors are equal
        const data = new Uint8Array(await fs.promises.readFile(join(pngSuiteRoot, file)));
        let decoded: IDecodedPng<any>;
        try {
          decoded = await decodePng(data);
        } catch {
          // Ignore files that cannot be decoded
          return;
        }
        const encoded = await encodePng(decoded.image);
        await fs.promises.mkdir('out-test/images/imagetestsuite', { recursive: true });
        await fs.promises.writeFile(`out-test/images/imagetestsuite/encoded_${file}`, encoded.data);
        const decoded2 = await decodePng(encoded.data);
        dataArraysEqual(decoded2.image.data, decoded.image.data);
      });
    }
  });
  describe('random_pngs', () => {
    const pngSuiteRoot = 'test/random_pngs';
    const files = fs.readdirSync(pngSuiteRoot);
    for (const file of files) {
      // Exclude non-png files
      if (!file.endsWith('.png')) {
        continue;
      }
      it(file, async () => {
        // Decode the file, encode it again, redecode it and check the colors are equal
        const data = new Uint8Array(await fs.promises.readFile(join(pngSuiteRoot, file)));
        const decoded = await decodePng(data);
        const encoded = await encodePng(decoded.image);
        await fs.promises.mkdir('out-test/images/random_pngs', { recursive: true });
        await fs.promises.writeFile(`out-test/images/random_pngs/encoded_${file}`, encoded.data);
        const decoded2 = await decodePng(encoded.data);
        dataArraysEqual(decoded2.image.data, decoded.image.data);
      });
    }
  });
});
