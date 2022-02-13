/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkPrecedes, assertChunkSinglular, createChunkDecodeWarning } from '../assert.js';
import { ChunkPartByteLength, IDecodeContext, IPngChunk, IPngHeaderDetails, IPngMetadataSignificantBits, KnownChunkTypes } from '../../shared/types.js';

/**
 * `sBIT` Significant bits
 *
 * Spec: https://www.w3.org/TR/PNG/#11sBIT
 */
export function parseChunk(ctx: IDecodeContext, header: IPngHeaderDetails, chunk: IPngChunk): IPngMetadataSignificantBits {
  assertChunkSinglular(ctx, chunk);
  assertChunkPrecedes(ctx, chunk, KnownChunkTypes.PLTE);
  assertChunkPrecedes(ctx, chunk, KnownChunkTypes.IDAT);

  // Format:
  // `0` (Greyscale): number
  // `2` (Truecolor): [number, number, number]
  // `3` (Indexed): [number, number, number]
  // `4` (Greyscale and alpha): [number, number]
  // `6` (Truecolor and alpha): [number, number, number, number]
  const offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  let value: number | [number, number] | [number, number, number] | [number, number, number, number];
  let expectedLength: number;
  switch (header.colorType) {
    case 0: {
      value = ctx.view.getUint8(offset);
      expectedLength = 1;
      break;
    }
    case 2:
    case 3: {
      value = [
        ctx.view.getUint8(offset    ),
        ctx.view.getUint8(offset + 1),
        ctx.view.getUint8(offset + 2)
      ];
      expectedLength = 3;
      break;
    }
    case 4: {
      value = [
        ctx.view.getUint8(offset    ),
        ctx.view.getUint8(offset + 1)
      ];
      expectedLength = 2;
      break;
    }
    case 6: {
      value = [
        ctx.view.getUint8(offset    ),
        ctx.view.getUint8(offset + 1),
        ctx.view.getUint8(offset + 2),
        ctx.view.getUint8(offset + 3)
      ];
      expectedLength = 4;
      break;
    }
    default:
      throw createChunkDecodeWarning(chunk, `Unrecognized color type "${header.colorType}"`, offset);
  }

  assertChunkDataLengthEquals(ctx, chunk, expectedLength);

  return {
    type: 'sBIT',
    value
  };
}
