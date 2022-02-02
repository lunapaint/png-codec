/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { fail, strictEqual } from 'assert';
import { decodePng } from '../out-dev/pngDecoder.js';
import { encodePng } from '../out-dev/pngEncoder.js';
import { BitDepth, ColorType, IImage32, IImage64 } from '../typings/api.js';
import { colorTypeIdToName, dataArraysEqual } from './testUtil.js';

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

describe.only('encode', () => {
  it('should write the fixed 8-byte signature', async () => {
    const result = await encodePng({
      data: new Uint8Array(red),
      width: 1,
      height: 1
    });
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
      })).buffer);
      // IHDR always starts at offset 8, immediately after the signature
      strictEqual(view.getUint32(8), 13);
      strictEqual(view.getUint8(12), 73, 'I in IHDR type doesn\'t match');
      strictEqual(view.getUint8(13), 72, 'H in IHDR type doesn\'t match');
      strictEqual(view.getUint8(14), 68, 'D in IHDR type doesn\'t match');
      strictEqual(view.getUint8(15), 82, 'R in IHDR type doesn\'t match');
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
  describe('integration', () => {
    // TODO: Add test for undefined options
    // TODO: Support other bit depths
    for (const bitDepth of [8, 16] as BitDepth[]) {
      for (const colorType of [
        ColorType.Grayscale,
        ColorType.Truecolor,
        ColorType.Indexed,
        ColorType.GrayacaleAndAlpha,
        ColorType.TruecolorAndAlpha
      ]) {
        // TODO: Support all color types
        (colorType === ColorType.Indexed ? describe.skip : describe)(`${colorTypeIdToName(colorType)} (${colorType}), bit depth ${bitDepth}`, () => {
          it('should be able to decode images encoded with the library', async () => {
            const original = bitDepth <= 8 ? new Uint8Array([
              ...red,  ...green,
              ...blue, ...white
            ]) : new Uint16Array([
              ...red16,  ...green16,
              ...blue16, ...white16
            ]);
            // Explicitly using a grayscale color type means only the red channel is considered
            const expected = colorType === ColorType.Grayscale || colorType === ColorType.GrayacaleAndAlpha ? (
              bitDepth <= 8
                ? new Uint8Array([
                  ...white, ...black,
                  ...black, ...white
                ])
                : new Uint16Array([
                  ...white16, ...black16,
                  ...black16, ...white16
                ])
            ) : original;
            const data = await encodePng({
              data: original,
              width: 2,
              height: 2
            } as IImage32 | IImage64, {
              colorType,
              bitDepth
            });
            const decoded = await decodePng(data, { strictMode: true });
            strictEqual(decoded.details.colorType, colorType);
            strictEqual(decoded.details.bitDepth, bitDepth);
            dataArraysEqual(decoded.image.data, expected);
          });
        });
      }
    }
  });
});
