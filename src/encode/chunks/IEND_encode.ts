/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { writeChunk } from '../write.js';

export function encodeChunk(): Uint8Array {
  return writeChunk('IEND', new Uint8Array(0));
}
