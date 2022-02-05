/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { crc32 } from '../crc32.js';
import { ByteStream } from '../byteStream.js';
import { BitDepth, ChunkPartByteLength, ColorType, IEncodeContext, IEncodePngOptions, IImage32, IImage64, InterlaceMethod, IPngPaletteInternal } from '../types.js';
import { writeChunkDataFn, writeChunkType } from '../write.js';

const enum Constants {
  DataLength = 13
}

export function encodeChunk(
  ctx: IEncodeContext,
  image: Readonly<IImage32> | Readonly<IImage64>
): { chunkData: Uint8Array, palette: Map<number, number> } {
  if (image.width <= 0 || image.height <= 0) {
    throw new Error(`Invalid dimensions ${image.width}x${image.height}`);
  }
  // TODO: Support 16 bit -> 8 bit convertion
  if (ctx.bitDepth === 16 || image.data.BYTES_PER_ELEMENT === 2) {
    throw new Error('Cannot encode 16 bit images using indexed color type');
  }

  // TODO: Add color set on the context
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

  // Validate palette size
  if (colorSet.size > Math.pow(2, ctx.bitDepth)) {
    throw new Error(`Too many colors ${colorSet.size} to encode into indexed image (2^${ctx.bitDepth} = ${Math.pow(2, ctx.bitDepth)})`);
  }

  // Fill in array
  const chunkData = writeChunkDataFn('PLTE', colorSet.size * 3, stream => {
    for (const color of colorSet.values()) {
      stream.writeUint8(color >> 16 & 0xFF);
      stream.writeUint8(color >>  8 & 0xFF);
      stream.writeUint8(color       & 0xFF);
    }
  });
  const view = new DataView(chunkData.buffer, chunkData.byteOffset, chunkData.byteLength);

  // Create palette map color->index for O(1) access of the index color
  const palette = new Map<number, number>();
  for (const color of colorSet.values()) {
    palette.set(color, palette.size);
  }

  return {
    chunkData,
    palette
  };
}
