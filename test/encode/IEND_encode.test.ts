/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { strictEqual } from 'assert';
import { encodeChunk } from '../../out-dev/encode/chunks/IEND_encode.js';

describe('IEND_encode', () => {
  it('should write the IEND chunk correctly', async () => {
    const result = encodeChunk();
    // Length
    strictEqual(result[0], 0x00);
    strictEqual(result[1], 0x00);
    strictEqual(result[2], 0x00);
    strictEqual(result[3], 0x00);
    // Type
    strictEqual(result[4], 73);
    strictEqual(result[5], 69);
    strictEqual(result[6], 78);
    strictEqual(result[7], 68);
    // Data (0 bytes)
    // CRC
    strictEqual(result[8], 0xAE);
    strictEqual(result[9], 0x42);
    strictEqual(result[10], 0x60);
    strictEqual(result[11], 0x82);
  });
});
