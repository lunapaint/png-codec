/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { deepStrictEqual, fail, strictEqual, throws } from 'assert';
import { join } from 'path';
import { decodePng } from '../out-dev/png.js';
import { DecodeError } from '../out-dev/decode/assert.js';
import * as fs from 'fs';
import { KnownChunkTypes } from '../out-dev/shared/types.js';

const pngSuiteRoot = 'test/pngsuite/png';

describe('decodePng', () => {
  describe('Buffer.byteOffset, Buffer.byteLength', () => {
    it('should decoded an array with byteOffset and byteLength set', async () => {
      const originalTypedArray = await fs.promises.readFile(join(pngSuiteRoot, `cs3n2c16.png`));
      const newArrayBuffer = new ArrayBuffer(originalTypedArray.length + 100);
      const newDataView = new DataView(newArrayBuffer, 50, originalTypedArray.length);
      for (let i = 0; i < originalTypedArray.length; i++) {
        newDataView.setUint8(i, originalTypedArray[i]);
      }
      const copiedTypedArray = new Uint8Array(newArrayBuffer, 50, originalTypedArray.length);
      // This would throw if the offset DataView is not read correctly
      await decodePng(copiedTypedArray);
    });
  });

  describe('optionalChunks', () => {
    it('should not load sBIT when not specified', async () => {
      const data = new Uint8Array(await fs.promises.readFile(join(pngSuiteRoot, `cs3n2c16.png`)));
      const result = await decodePng(data);
      deepStrictEqual(result.metadata, undefined);
    });
    it('should load sBIT when specified', async () => {
      const data = new Uint8Array(await fs.promises.readFile(join(pngSuiteRoot, `cs3n2c16.png`)));
      const result = await decodePng(data, { parseChunkTypes: [KnownChunkTypes.sBIT] });
      deepStrictEqual(result.metadata, [
        {
          type: 'sBIT',
          value: [13, 13, 13]
        }
      ]);
    });
  });

  describe('palette', () => {
    it('should be able to fetch all palette entries', async () => {
      const data = new Uint8Array(await fs.promises.readFile(join(pngSuiteRoot, `s05n3p02.png`)));
      const result = await decodePng(data);
      const p = result.palette!;
      strictEqual(p.size, 3);
      deepStrictEqual(Array.from(p.getRgb(0)), [0, 255, 255]);
      deepStrictEqual(Array.from(p.getRgb(1)), [119, 0, 255]);
      deepStrictEqual(Array.from(p.getRgb(2)), [255, 0, 0]);
    });
    it('should throw when accessing invalid color indexes', async () => {
      const data = new Uint8Array(await fs.promises.readFile(join(pngSuiteRoot, `s05n3p02.png`)));
      const result = await decodePng(data);
      const p = result.palette!;
      strictEqual(p.size, 3);
      throws(() => p.getRgb(-1));
      throws(() => p.getRgb(3));
    });
  });

  describe('details', () => {
    it('should decode correct values', async () => {
      const data = new Uint8Array(await fs.promises.readFile(join(pngSuiteRoot, `s05n3p02.png`)));
      const result = await decodePng(data);
      deepStrictEqual(result.details, {
        width: 5,
        height: 5,
        bitDepth: 2,
        colorType: 3,
        interlaceMethod: 0
      });
    });
  });

  describe('errors', () => {
    it('should throw a DecodeError without details when failing in header', async () => {
      const data = new Uint8Array([1, 2, 3]);
      try {
        await decodePng(data);
      } catch (e: unknown) {
        if (!(e instanceof DecodeError)) {
          fail('error not an instance of DecodeError');
        }
        strictEqual(e.message, 'Not enough bytes in file for png signature (3)');
        strictEqual(e.offset, 0);
        deepStrictEqual(e.partiallyDecodedImage, {
          details: undefined,
          info: [],
          metadata: [],
          rawChunks: undefined,
          warnings: []
        });
        return;
      }
      fail('exception expected');
    });
  });
});
