/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { throws } from 'assert';
import { join } from 'path';
import { verifyPngSignature } from '../out/pngDecoder.js';
import * as fs from 'fs';

const pngSuiteRoot = 'test/pngsuite/png';

function dataViewFromArray(data: number[]): DataView {
  return new DataView(new Uint8Array(data).buffer);
}

async function dataViewFromFile(file: string): Promise<DataView> {
  return new DataView(new Uint8Array(await fs.promises.readFile(file)).buffer);
}

describe('verifyPngSignature', () => {
  it('should throw when the data doesn\'t match the fixed 8-byte header', () => {
    throws(() => {
      verifyPngSignature({ view: dataViewFromArray([0x41, 0x4D]), warnings: [] });
    }, new Error('Not enough bytes in file for png signature (2)'));
    throws(() => {
      verifyPngSignature({ view: dataViewFromArray([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), warnings: [] });
    }, new Error('Png signature is not correct (0x0000000000000000 !== 0x89504e470d0a1a0a)'));
  });
  it('should verify for valid headers', () => {
    verifyPngSignature({ view: dataViewFromArray([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), warnings: [] });
  });
  it('should verify the header of valid png suite entries', async () => {
    // TODO: Create helpers for iterating over fixture files
    const testFiles = fs.readdirSync(join(pngSuiteRoot));
    for (const file of testFiles) {
      // Ignore non-png and corrupt png files
      if (file.endsWith('png') && !file.startsWith('x')) {
        verifyPngSignature({ view: await dataViewFromFile(join(pngSuiteRoot, file)), warnings: [] });
      }
    }
  });
  it('should throw for corrupt headers in png suite', async () => {
    const testFiles = [
      'xcrn0g04.png',
      'xlfn0g04.png',
      'xs1n0g01.png',
      'xs2n0g01.png',
      'xs4n0g01.png',
      'xs7n0g01.png',
    ];
    for (const file of testFiles) {
      const view = await dataViewFromFile(join(pngSuiteRoot, file));
      throws(() => verifyPngSignature({ view, warnings: [] }));
    }
  });
});
