/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkPrecedes, assertChunkSinglular, ChunkError } from '../assert.js';
import { ChunkPartByteLength, IDecodePngOptions, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngMetadataGamma, KnownChunkTypes } from '../types.js';

/**
 * `gAMA` Image Gamma
 *
 * Spec: https://www.w3.org/TR/PNG/#11gAMA
 */
export function parseChunk(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng, options: IDecodePngOptions | undefined): IPngMetadataGamma {
  assertChunkSinglular(chunk, decodedPng, options?.strictMode);
  assertChunkPrecedes(chunk, KnownChunkTypes.PLTE, decodedPng, options?.strictMode);
  assertChunkPrecedes(chunk, KnownChunkTypes.IDAT, decodedPng, options?.strictMode);
  assertChunkDataLengthEquals(chunk, 4, decodedPng.warnings, options?.strictMode);

  const offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const value = dataView.getUint32(offset) / 100000;
  if (value === 0) {
    // TODO: Report in a problem instead
    console.warn(new ChunkError(chunk, 'A value of 0 is meaningless').message);
  }

  return {
    type: 'gAMA',
    value
  };
}
