/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkPrecedes, assertChunkSinglular } from '../assert.js';
import { ChunkPartByteLength, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngMetadataPhysicalPixelDimensions, KnownChunkTypes } from '../types.js';

/**
 * Spec: https://www.w3.org/TR/PNG/#11pYHs
 *
 * The pHYs (Physical pixel dimensions) chunk defines the intended pixel size or aspect ratio of the
 * image.
 */
export function parseChunk(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng): IPngMetadataPhysicalPixelDimensions {
  assertChunkSinglular(chunk, decodedPng);
  assertChunkPrecedes(chunk, KnownChunkTypes.IDAT, decodedPng);
  assertChunkDataLengthEquals(chunk, 9);

  // Format:
  // Pixels per unit, X axis: 4 bytes (PNG unsigned integer)
  // Pixels per unit, Y axis: 4 bytes (PNG unsigned integer)
  // Unit specifier:          1 byte
  let offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const x = dataView.getUint32(offset); offset += 4;
  const y = dataView.getUint32(offset); offset += 4;
  const unitType = dataView.getUint8(offset) === 1 ? 'meter' : 'unknown';

  return {
    type: 'pHYs',
    pixelsPerUnit: { x, y },
    unitType
  };
}
