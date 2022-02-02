/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { ByteStream } from './byteStream.js';
import { crc32 } from './crc32.js';
import { ChunkPartByteLength } from './types.js';

export function writeChunkType(stream: ByteStream, type: string) {
  stream.writeUint8(type.charCodeAt(0));
  stream.writeUint8(type.charCodeAt(1));
  stream.writeUint8(type.charCodeAt(2));
  stream.writeUint8(type.charCodeAt(3));
}

export function writeChunk(type: string, data: Uint8Array): Uint8Array {
  const stream = new ByteStream(ChunkPartByteLength.Length + ChunkPartByteLength.Length + data.length + ChunkPartByteLength.CRC);
  // 4 bytes: Data length
  stream.writeUint32(data.length);
  // 4 bytes: Chunk type
  if (type.length !== 4) {
    throw new Error(`Cannot encode a chunk type of length ${type.length}`);
  }
  writeChunkType(stream, type);
  // n bytes: Data
  stream.writeArray(data);
  // 4 bytes: CRC
  stream.writeUint32(crc32(stream.view, ChunkPartByteLength.Length, ChunkPartByteLength.Type + data.length));
  // Validation
  stream.assertAtEnd();
  return stream.array;
}

export function writeChunkDataFn(type: string, dataLength: number, writeDataFn: (stream: ByteStream) => void): Uint8Array {
  const stream = new ByteStream(ChunkPartByteLength.Length + ChunkPartByteLength.Length + dataLength + ChunkPartByteLength.CRC);
  // 4 bytes: Data length
  stream.writeUint32(dataLength);
  // 4 bytes: Chunk type
  if (type.length !== 4) {
    throw new Error(`Cannot encode a chunk type of length ${type.length}`);
  }
  writeChunkType(stream, type);
  // n bytes: Data
  writeDataFn(stream);
  // 4 bytes: CRC
  stream.writeUint32(crc32(stream.view, ChunkPartByteLength.Length, ChunkPartByteLength.Type + dataLength));
  // Validation
  stream.assertAtEnd();
  return stream.array;
}
