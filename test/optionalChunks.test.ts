/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { deepStrictEqual } from 'assert';
import { join } from 'path';
import { decodePng } from '../out/png.js';
import * as fs from 'fs';
import { KnownChunkTypes } from '../out/types.js';

const pngSuiteRoot = 'test/pngsuite/png';

describe('pngParser.optionalChunks', () => {
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
