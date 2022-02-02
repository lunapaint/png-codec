/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { crc32 } from '../crc32.js';
import { ByteStream } from '../byteStream.js';
import { BitDepth, ChunkPartByteLength, ColorType, IEncodePngOptions, IImage32, IImage64, InterlaceMethod } from '../types.js';
import { writeChunkDataFn, writeChunkType } from '../write.js';

const enum Constants {
  DataLength = 13
}

export function encodeChunk(
  image: Readonly<IImage32> | Readonly<IImage64>,
  bitDepth: BitDepth,
  colorType: ColorType,
  interlaceMethod: InterlaceMethod
): Uint8Array {
  if (image.width <= 0 || image.height <= 0) {
    throw new Error(`Invalid dimensions ${image.width}x${image.height}`);
  }
  return writeChunkDataFn('IHDR', Constants.DataLength, stream => {
    stream.writeUint32(image.width);
    stream.writeUint32(image.height);
    // Bit depth
    stream.writeUint8(bitDepth);
    // Color type
    stream.writeUint8(colorType);
    // Compression method (only 0 is valid)
    stream.writeUint8(0);
    // Filter method (only 0 is valid)
    stream.writeUint8(0);
    // Interlace method
    stream.writeUint8(interlaceMethod);
  });
}
