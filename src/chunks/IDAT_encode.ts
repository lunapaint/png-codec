/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { ByteStream } from '../byteStream.js';
import { crc32 } from '../crc32.js';
import { BitDepth, ChunkPartByteLength, ColorType, IImage32, IImage64, InterlaceMethod } from '../types.js';
import { writeChunkType } from '../write.js';

export function encodeChunk(
  image: Readonly<IImage32> | Readonly<IImage64>,
  bitDepth: BitDepth,
  colorType: ColorType,
  interlaceMethod: InterlaceMethod
): Uint8Array {
  // Temporary assertions to throw for unsupported config
  if (bitDepth !== 8) {
    throw new Error('Only bit depth 8 is supported currently');
  }
  if (colorType !== ColorType.Truecolor) {
    throw new Error('Only color type truecolor is supported currently');
  }
  if (interlaceMethod !== InterlaceMethod.None) {
    throw new Error('Only interlace method 0 is supported currently');
  }

  const dataLength = 0;
  const streamLength = ChunkPartByteLength.Length + ChunkPartByteLength.Length + dataLength + ChunkPartByteLength.CRC;

  const stream = new ByteStream(streamLength);

  // Data length
  stream.writeUint32(dataLength);

  // Chunk type
  writeChunkType(stream, 'IDAT');

  // Data
  // TODO: ...

  // CRC
  stream.writeUint32(crc32(stream.view, ChunkPartByteLength.Length, ChunkPartByteLength.Type + dataLength));

  // Validation
  stream.assertAtEnd();

  return new Uint8Array();
}
