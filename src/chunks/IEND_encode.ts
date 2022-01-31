/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { ByteStream } from '../byteStream.js';
import { crc32 } from '../crc32.js';
import { ChunkPartByteLength } from '../types.js';
import { writeChunkType } from '../write.js';

const enum Constants {
  DataLength = 0
}

export function encodeChunk(): Uint8Array {
  const stream = new ByteStream(ChunkPartByteLength.Length + ChunkPartByteLength.Length + Constants.DataLength + ChunkPartByteLength.CRC);

  // Data length
  stream.writeUint32(Constants.DataLength);

  // Chunk type
  writeChunkType(stream, 'IEND');

  // Data
  // (0 bytes)

  // CRC
  stream.writeUint32(crc32(stream.view, ChunkPartByteLength.Length, ChunkPartByteLength.Type + Constants.DataLength));

  // Validation
  stream.assertAtEnd();

  return stream.array;
}
