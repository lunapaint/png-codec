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
  // TODO: Support 16 bit
  if (bitDepth === 16 || image.data.BYTES_PER_ELEMENT === 2) {
    throw new Error('16 bit images not yet supported');
  }

  // Create and fill in a Set with colors in the form 0xRRGGBB
  const colorSet = new Set<number>();
  const channelCount = image.width * image.height * 4;
  for (let i = 0; i < channelCount; i += 4) {
    const color = (
      image.data[i    ] << 16 |
      image.data[i + 1] <<  8 |
      image.data[i + 2]
    );
    colorSet.add(color);
  }

  if (colorSet.size > 256) {
    throw new Error('Too many colors to encode into indexed image (256)');
  }

  // Fill in array
  return writeChunkDataFn('PLTE', colorSet.size * 3, stream => {
    for (const color of colorSet.values()) {
      stream.writeUint8(color >> 16 & 0xFF);
      stream.writeUint8(color >>  8 & 0xFF);
      stream.writeUint8(color       & 0xFF);
    }
  });
}
