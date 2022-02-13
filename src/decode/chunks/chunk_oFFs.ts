/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkPrecedes, assertChunkSinglular, createChunkDecodeWarning } from '../../assert.js';
import { ChunkPartByteLength, IDecodeContext, IPngChunk, IPngHeaderDetails, IPngMetadataOffset, KnownChunkTypes } from '../../types.js';

/**
 * `oFFs` Image offset
 *
 * Spec: http://www.libpng.org/pub/png/spec/register/pngext-1.4.0-pdg.html#C.oFFs
 */
export function parseChunk(ctx: IDecodeContext, header: IPngHeaderDetails, chunk: IPngChunk): IPngMetadataOffset {
  assertChunkSinglular(ctx, chunk);
  assertChunkPrecedes(ctx, chunk, KnownChunkTypes.IDAT);
  assertChunkDataLengthEquals(ctx, chunk, 9);

  // Format:
  // X position:     4 bytes (signed integer)
  // Y position:     4 bytes (signed integer)
  // Unit specifier: 1 byte
  let offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const x = ctx.view.getInt32(offset); offset += 4;
  const y = ctx.view.getInt32(offset); offset += 4;

  const unitTypeByte = ctx.view.getUint8(offset);
  let unitType: 'pixel' | 'micrometer';
  switch (unitTypeByte) {
    case 0: unitType = 'pixel'; break;
    case 1: unitType = 'micrometer'; break;
    default: throw createChunkDecodeWarning(chunk, `Invalid oFFs unit type ("${unitTypeByte}")`, offset);
  }

  return {
    type: 'oFFs',
    offset: { x, y },
    unitType
  };
}
