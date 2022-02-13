/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkPrecedes, assertChunkSinglular, createChunkDecodeWarning } from '../assert.js';
import { ChunkPartByteLength, IDecodeContext, IPngChunk, IPngHeaderDetails, IPngMetadataBackgroundColor, KnownChunkTypes } from '../../shared/types.js';

/**
 * `bKGD` Background
 *
 * Spec: https://www.w3.org/TR/PNG/#11bKGD
 */
export function parseChunk(ctx: IDecodeContext, header: IPngHeaderDetails, chunk: IPngChunk): IPngMetadataBackgroundColor {
  assertChunkSinglular(ctx, chunk);
  assertChunkPrecedes(ctx, chunk, KnownChunkTypes.IDAT);

  const offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  let color: number | [number, number, number];
  let expectedLength: number;
  switch (header.colorType) {
    case 0:
    case 4: {
      color = ctx.view.getUint16(offset);
      expectedLength = 2;
      break;
    }
    case 2:
    case 6: {
      color = [
        ctx.view.getUint16(offset    ),
        ctx.view.getUint16(offset + 2),
        ctx.view.getUint16(offset + 4)
      ];
      expectedLength = 6;
      break;
    }
    case 3: {
      color = ctx.view.getUint8(offset);
      expectedLength = 1;
      break;
    }
    default:
      throw createChunkDecodeWarning(chunk, `Unrecognized color type "${header.colorType}"`, offset);
  }

  assertChunkDataLengthEquals(ctx, chunk, expectedLength);

  return { type: 'bKGD', color };
}
