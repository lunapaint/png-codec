/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkPrecedes, assertChunkSinglular, ChunkError } from '../assert.js';
import { ChunkPartByteLength, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngMetadataChromaticity, KnownChunkTypes } from '../types.js';

/**
 * cHRM Primary chromacities and white point
 *
 * Spec: https://www.w3.org/TR/PNG/#11cHRM
 */
export function parseChunk(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng): IPngMetadataChromaticity {
  assertChunkSinglular(chunk, decodedPng);
  assertChunkPrecedes(chunk, KnownChunkTypes.PLTE, decodedPng);
  assertChunkDataLengthEquals(chunk, 32);

  // Format:
  // White point x: 4 bytes
  // White point y: 4 bytes
  // Red x:         4 bytes
  // Red y:         4 bytes
  // Green x:       4 bytes
  // Green y:       4 bytes
  // Blue x:        4 bytes
  // Blue y:        4 bytes
  let offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const whitePoint = {
    x: dataView.getUint32(offset) / 100000,
    y: dataView.getUint32(offset + 4) / 100000,
  };
  if (whitePoint.x > 1 || whitePoint.y > 1) {
    // TODO: This should be a warning
    throw new ChunkError(chunk, `Invalid white point (${whitePoint.x},${whitePoint.y})`);
  }
  offset += 8;
  const red = {
    x: dataView.getUint32(offset) / 100000,
    y: dataView.getUint32(offset + 4) / 100000,
  };
  if (red.x > 1 || red.y > 1) {
    // TODO: This should be a warning
    throw new ChunkError(chunk, `Invalid red (${red.x},${red.y})`);
  }
  offset += 8;
  const green = {
    x: dataView.getUint32(offset) / 100000,
    y: dataView.getUint32(offset + 4) / 100000,
  };
  if (green.x > 1 || green.y > 1) {
    // TODO: This should be a warning
    throw new ChunkError(chunk, `Invalid green (${green.x},${green.y})`);
  }
  offset += 8;
  const blue = {
    x: dataView.getUint32(offset) / 100000,
    y: dataView.getUint32(offset + 4) / 100000,
  };
  if (blue.x > 1 || blue.y > 1) {
    // TODO: This should be a warning
    throw new ChunkError(chunk, `Invalid blue (${blue.x},${blue.y})`);
  }

  return {
    type: 'cHRM',
    whitePoint,
    red,
    green,
    blue
  };
}
