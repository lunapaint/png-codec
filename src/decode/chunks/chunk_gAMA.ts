/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkPrecedes, assertChunkSinglular, createChunkDecodeWarning, handleWarning } from '../assert.js';
import { ChunkPartByteLength, IDecodeContext, IPngChunk, IPngHeaderDetails, IPngMetadataGamma, KnownChunkTypes } from '../../shared/types.js';

/**
 * `gAMA` Image Gamma
 *
 * Spec: https://www.w3.org/TR/PNG/#11gAMA
 */
export function parseChunk(ctx: IDecodeContext, header: IPngHeaderDetails, chunk: IPngChunk): IPngMetadataGamma {
  assertChunkSinglular(ctx, chunk);
  assertChunkPrecedes(ctx, chunk, KnownChunkTypes.PLTE);
  assertChunkPrecedes(ctx, chunk, KnownChunkTypes.IDAT);
  assertChunkDataLengthEquals(ctx, chunk, 4);

  const offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const value = ctx.view.getUint32(offset) / 100000;
  if (value === 0) {
    handleWarning(ctx, createChunkDecodeWarning(chunk, 'A value of 0 is meaningless', offset));
  }

  return {
    type: 'gAMA',
    value
  };
}
