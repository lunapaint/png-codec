/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkFollows, assertChunkPrecedes, createChunkDecodeWarning } from '../assert.js';
import { ChunkPartByteLength, ColorType, IDecodeContext, IPngChunk, IPngHeaderDetails, IPngMetadataTransparency, KnownChunkTypes } from '../../types.js';

/**
 * `tRNS` Transparency
 *
 * Spec: https://www.w3.org/TR/PNG/#11tRNS
 */
export function parseChunk(ctx: IDecodeContext, header: IPngHeaderDetails, chunk: IPngChunk): IPngMetadataTransparency {
  assertChunkPrecedes(ctx, chunk, KnownChunkTypes.IDAT);

  switch (header.colorType) {
    case ColorType.Grayscale:
      assertChunkDataLengthEquals(ctx, chunk, 2);
      break;
    case ColorType.Truecolor:
      assertChunkDataLengthEquals(ctx, chunk, 6);
      break;
    case ColorType.Indexed:
      assertChunkFollows(ctx, chunk, KnownChunkTypes.PLTE);
      if (chunk.dataLength > ctx.palette!.size) {
        throw createChunkDecodeWarning(chunk, `Invalid data length for color type ${header.colorType}: ${chunk.dataLength} > ${ctx.palette!.size}`, chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type);
      }
      break;
    case ColorType.GrayscaleAndAlpha:
    case ColorType.TruecolorAndAlpha:
      throw createChunkDecodeWarning(chunk, `Chunk invalid when color type has alpha (${header.colorType})`, chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type);
  }

  const offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  let transparency: number | [number, number, number] | number[];
  switch (header.colorType) {
    case ColorType.Grayscale:
      transparency = ctx.view.getUint16(offset);
      break;
    case ColorType.Truecolor:
      transparency = [
        ctx.view.getUint16(offset    ),
        ctx.view.getUint16(offset + 2),
        ctx.view.getUint16(offset + 4)
      ];
      break;
    case ColorType.Indexed:
      transparency = [];
      for (let i = 0; i < chunk.dataLength; i++) {
        transparency.push(ctx.view.getUint8(offset + i));
      }
      break;
  }

  return {
    type: 'tRNS',
    transparency
  };
}
