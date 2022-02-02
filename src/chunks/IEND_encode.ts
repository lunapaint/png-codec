/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { ByteStream } from '../byteStream.js';
import { crc32 } from '../crc32.js';
import { ChunkPartByteLength } from '../types.js';
import { writeChunk, writeChunkType } from '../write.js';

const enum Constants {
  DataLength = 0
}

export function encodeChunk(): Uint8Array {
  return writeChunk('IEND', new Uint8Array(0));
}
