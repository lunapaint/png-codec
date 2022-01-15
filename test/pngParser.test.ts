/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { deepStrictEqual, strictEqual, throws } from 'assert';
import { join } from 'path';
import { decodePng } from '../out/png.js';
import * as fs from 'fs';
import { KnownChunkTypes } from '../out/types.js';

const pngSuiteRoot = 'test/pngsuite/png';

describe('pngParser', () => {
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
});
