/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkPrecedes, assertChunkSinglular } from '../assert.js';
import { ChunkPartByteLength, IDecodePngOptions, IDecodeContext, IPngChunk, IPngHeaderDetails, IPngMetadataPhysicalPixelDimensions, KnownChunkTypes } from '../types.js';

/**
 * `pHYs` Physical pixel dimensions
 *
 * Spec: https://www.w3.org/TR/PNG/#11pYHs
 */
export function parseChunk(ctx: IDecodeContext, header: IPngHeaderDetails, chunk: IPngChunk): IPngMetadataPhysicalPixelDimensions {
  assertChunkSinglular(ctx, chunk);
  assertChunkPrecedes(ctx, chunk, KnownChunkTypes.IDAT);
  assertChunkDataLengthEquals(ctx, chunk, 9);

  // Format:
  // Pixels per unit, X axis: 4 bytes (PNG unsigned integer)
  // Pixels per unit, Y axis: 4 bytes (PNG unsigned integer)
  // Unit specifier:          1 byte
  let offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const x = ctx.view.getUint32(offset); offset += 4;
  const y = ctx.view.getUint32(offset); offset += 4;
  const unitType = ctx.view.getUint8(offset) === 1 ? 'meter' : 'unknown';

  return {
    type: 'pHYs',
    pixelsPerUnit: { x, y },
    unitType
  };
}
