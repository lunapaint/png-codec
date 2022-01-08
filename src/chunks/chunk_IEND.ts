/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkFollows } from '../assert.js';
import { IPartialDecodedPng, IPngChunk, IPngHeaderDetails, KnownChunkTypes } from '../types.js';

/**
 * Spec: https://www.w3.org/TR/PNG/#11IDAT
 *
 * The IEND (Image trailer) chunk defines the end of the png.
 */
export function parseChunk_IEND(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng): void { // eslint-disable-line @typescript-eslint/naming-convention
  assertChunkFollows(chunk, KnownChunkTypes.IDAT, decodedPng);
  assertChunkDataLengthEquals(chunk, 0);
}
