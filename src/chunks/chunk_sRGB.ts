/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkMutualExclusion, assertChunkPrecedes, assertChunkSinglular, ChunkError } from '../assert.js';
import { ChunkPartByteLength, IDecodePngOptions, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngMetadataStandardRgbColorSpace, KnownChunkTypes, RenderingIntent } from '../types.js';

/**
 * `sRGB` Standard RGB color space
 *
 * Spec: https://www.w3.org/TR/PNG/#11sRGB
 */
export function parseChunk(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng, options: IDecodePngOptions | undefined): IPngMetadataStandardRgbColorSpace {
  assertChunkSinglular(chunk, decodedPng, options?.strictMode);
  assertChunkMutualExclusion(chunk, KnownChunkTypes.iCCP, decodedPng, options?.strictMode);
  assertChunkPrecedes(chunk, KnownChunkTypes.PLTE, decodedPng, options?.strictMode);
  assertChunkPrecedes(chunk, KnownChunkTypes.IDAT, decodedPng, options?.strictMode);
  assertChunkDataLengthEquals(chunk, 1);

  const offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const byte = dataView.getUint8(offset);
  let renderingIntent: RenderingIntent;
  switch (byte) {
    case RenderingIntent.Perceptual:
    case RenderingIntent.RelativeColorimetric:
    case RenderingIntent.Saturation:
    case RenderingIntent.AbsoluteColorimetric:
      renderingIntent = byte;
      break;
    default:
      throw new ChunkError(chunk, `Invalid rendering intent "${byte}"`);
  }

  return {
    type: 'sRGB',
    renderingIntent
  };
}
