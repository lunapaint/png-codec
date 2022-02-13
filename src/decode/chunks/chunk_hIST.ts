/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkFollows, assertChunkPrecedes, assertChunkSinglular } from '../../assert.js';
import { ChunkPartByteLength, IDecodeContext, IPngChunk, IPngHeaderDetails, IPngMetadataHistogram, KnownChunkTypes } from '../../types.js';

/**
 * `hIST` Image histogram
 *
 * Spec: https://www.w3.org/TR/PNG/#11hIST
 */
export function parseChunk(ctx: IDecodeContext, header: IPngHeaderDetails, chunk: IPngChunk): IPngMetadataHistogram {
  assertChunkSinglular(ctx, chunk);
  assertChunkFollows(ctx, chunk, KnownChunkTypes.PLTE);
  assertChunkPrecedes(ctx, chunk, KnownChunkTypes.IDAT);
  assertChunkDataLengthEquals(ctx, chunk, ctx.palette!.size * 2);

  const offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const frequency: number[] = [];
  for (let i = 0; i < ctx.palette!.size * 2; i += 2) {
    frequency.push(ctx.view.getUint16(offset + i));
  }

  return {
    type: 'hIST',
    frequency
  };
}
