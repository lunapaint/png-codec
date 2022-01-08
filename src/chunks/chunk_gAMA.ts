/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, ChunkError } from '../assert.js';
import { ChunkPartByteLength, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngMetadataGamma } from '../types.js';

/**
 * Spec: https://www.w3.org/TR/PNG/#11gAMA
 *
 * The gAMA (Image Gamma) chunk defines the relationship between the image samples and its desired
 * display output intensity.
 */
export function parseChunk(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng): IPngMetadataGamma {
  assertChunkDataLengthEquals(chunk, 4);

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
