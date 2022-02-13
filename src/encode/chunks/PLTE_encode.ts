/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { IEncodeContext, IImage32, IImage64 } from '../../types.js';
import { writeChunkDataFn } from '../write.js';

export function encodeChunk(
  ctx: IEncodeContext,
  image: Readonly<IImage32> | Readonly<IImage64>
): { chunkData: Uint8Array, palette: Map<number, number> } {
  /* istanbul ignore next - this error should never happen in practice */
  if (ctx.bitDepth === 16 || image.data.BYTES_PER_ELEMENT === 2) {
    throw new Error('Cannot encode 16 bit images using indexed color type');
  }

  // Validate palette size
  /* istanbul ignore next - this error should never happen in practice */
  if (ctx.colorSet.size > Math.pow(2, ctx.bitDepth)) {
    throw new Error(`Too many colors ${ctx.colorSet.size} to encode into indexed image (2^${ctx.bitDepth} = ${Math.pow(2, ctx.bitDepth)})`);
  }

  // Fill in array
  const chunkData = writeChunkDataFn('PLTE', ctx.colorSet.size * 3, stream => {
    for (const color of ctx.colorSet.values()) {
      stream.writeUint8(color >> 24 & 0xFF);
      stream.writeUint8(color >> 16 & 0xFF);
      stream.writeUint8(color >>  8 & 0xFF);
    }
  });

  // Create palette map color->index for O(1) access of the index color
  const palette = new Map<number, number>();
  for (const color of ctx.colorSet.values()) {
    palette.set(color, palette.size);
  }

  return {
    chunkData,
    palette
  };
}
