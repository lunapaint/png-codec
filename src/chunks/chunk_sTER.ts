/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkPrecedes, assertChunkSinglular, createChunkDecodeWarning } from '../assert.js';
import { ChunkPartByteLength, IDecodeContext, IPngChunk, IPngHeaderDetails, IPngMetadataIndicatorOfStereoImage, KnownChunkTypes } from '../types.js';

/**
 * `sTER` Indicator of stereo image
 *
 * Spec: http://www.libpng.org/pub/png/spec/register/pngext-1.4.0-pdg.html#C.sTER
 */
export function parseChunk(ctx: IDecodeContext, header: IPngHeaderDetails, chunk: IPngChunk): IPngMetadataIndicatorOfStereoImage {
  assertChunkSinglular(ctx, chunk);
  assertChunkPrecedes(ctx, chunk, KnownChunkTypes.IDAT);
  assertChunkDataLengthEquals(ctx, chunk, 1);

  // Format:
  // Mode: 1 byte
  //   0: cross-fuse layout
  //   1: diverging-fuse layout
  const offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const layoutModeByte = ctx.view.getUint8(offset);
  let layoutMode: 'cross-fuse' | 'diverging-fuse';
  switch (layoutModeByte) {
    case 0: layoutMode = 'cross-fuse'; break;
    case 1: layoutMode = 'diverging-fuse'; break;
    default: throw createChunkDecodeWarning(chunk, `Invalid layout mode "${layoutModeByte}"`, offset);
  }

  // Given two subimages with width subimage_width, encoders can calculate the inter-subimage padding and total width W using the following pseudocode:
  //
  // padding        := 7 - ((subimage_width - 1) mod 8)
  // W              := 2 * subimage_width + padding
  //
  // Given an image with width W, decoders can calculate the subimage width and inter-subimage padding using the following pseudocode:
  // padding := 15 - ((W - 1) mod 16)
  // if (padding > 7) then error
  // subimage_width := (W - padding) / 2
  const padding = 15 - ((header.width - 1) % 16);
  if (padding > 7) {
    throw createChunkDecodeWarning(chunk, `Invalid padding value "${padding}" for image width ${header.width}`, offset);
  }
  const subimageWidth = Math.floor((header.width - padding) / 2);

  return {
    type: 'sTER',
    layoutMode,
    subimageWidth,
    padding
  };
}
