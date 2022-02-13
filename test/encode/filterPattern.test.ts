/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import * as fs from 'fs';
import { join } from 'path';
import { decodePng } from '../../out-dev/decode/decoder.js';
import { encodePng } from '../../out-dev/encode/encoder.js';
import { IEncodePngOptionsInternal } from '../../src/shared/types.js';
import { dataArraysEqual } from '../shared/testUtil.js';

describe('filterPattern', () => {
  const pngSuiteRoot = 'test/pngsuite/png';
  const files = fs.readdirSync(pngSuiteRoot);
  for (const filterPattern of [
    // Uniform filters
    [0],
    [1],
    [2],
    [3],
    [4],
    // Alternating
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 0],
    [1, 2],
    [1, 3],
    [1, 4],
    [2, 0],
    [2, 1],
    [2, 3],
    [2, 4],
    [3, 0],
    [3, 1],
    [3, 2],
    [3, 4],
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
    // 2x alternating
    [0, 0, 1, 1],
    [0, 0, 2, 2],
    [0, 0, 3, 3],
    [0, 0, 4, 4],
    [1, 1, 0, 0],
    [1, 1, 2, 2],
    [1, 1, 3, 3],
    [1, 1, 4, 4],
    [2, 2, 0, 0],
    [2, 2, 1, 1],
    [2, 2, 3, 3],
    [2, 2, 4, 4],
    [3, 3, 0, 0],
    [3, 3, 1, 1],
    [3, 3, 2, 2],
    [3, 3, 4, 4],
    [4, 4, 0, 0],
    [4, 4, 1, 1],
    [4, 4, 2, 2],
    [4, 4, 3, 3],
    // All filters
    [0, 1, 2, 3, 4]
  ]) {
    describe(`[${filterPattern.toString()}]`, () => {
      for (const file of files) {
        // Only basic non-interlaced should provide enough coverage as the images have enough
        // diversity of colors, the main thing being tested here is that the filters behave
        // correctly when adjacent to other filters.
        if (!file.startsWith('basn')) {
          continue;
        }

        it(file, async () => {
          // Decode the file, encode it again, redecode it and check the colors are equal
          const data = new Uint8Array(await fs.promises.readFile(join(pngSuiteRoot, file)));
          const decoded = await decodePng(data);
          const encoded = await encodePng(decoded.image, { filterPattern } as IEncodePngOptionsInternal);
          await fs.promises.mkdir('out-test/images/pngsuite', { recursive: true });
          await fs.promises.writeFile(`out-test/images/pngsuite/encoded_${file}`, encoded.data);
          const decoded2 = await decodePng(encoded.data);
          dataArraysEqual(decoded2.image.data, decoded.image.data);
        });
      }
    });
  }
});
