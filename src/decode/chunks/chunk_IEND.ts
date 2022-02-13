/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkFollows } from '../assert.js';
import { IDecodeContext, IPngChunk, IPngHeaderDetails, KnownChunkTypes } from '../../types.js';

/**
 * `IEND` Image trailer
 *
 * Spec: https://www.w3.org/TR/PNG/#11IDAT
 */
export function parseChunk(ctx: IDecodeContext, header: IPngHeaderDetails, chunk: IPngChunk): void {
  assertChunkFollows(ctx, chunk, KnownChunkTypes.IDAT);
  assertChunkDataLengthEquals(ctx, chunk, 0);
}
