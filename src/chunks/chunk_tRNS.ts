/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkPrecedes, ChunkError } from '../assert.js';
import { ChunkPartByteLength, ColorType, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngMetadataTransparency, KnownChunkTypes } from '../types.js';

/**
 * `tRNS` Transparency
 *
 * Spec: https://www.w3.org/TR/PNG/#11tRNS
 */
export function parseChunk(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng): IPngMetadataTransparency {
  // TODO: PngSuite has tRNS before PLTE?
  // assertChunkFollows(chunk, KnownChunkTypes.PLTE, decodedPng);
  assertChunkPrecedes(chunk, KnownChunkTypes.IDAT, decodedPng);

  switch (header.colorType) {
    case ColorType.Grayscale:
      assertChunkDataLengthEquals(chunk, 2);
      break;
    case ColorType.Truecolor:
      assertChunkDataLengthEquals(chunk, 6);
      break;
    case ColorType.Indexed:
      // TODO: PngSuite has tRNS before PLTE?
      if (decodedPng.palette) {
        if (chunk.dataLength > decodedPng.palette.size) {
          throw new ChunkError(chunk, `Invalid data length for color type ${header.colorType}: ${chunk.dataLength} > ${decodedPng.palette.size}`);
        }
      }
      break;
    case ColorType.GrayacaleAndAlpha:
    case ColorType.TruecolorAndAlpha:
      throw new ChunkError(chunk, `Chunk invalid when color type has alpha (${header.colorType})`);
  }

  const offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  let transparency: number | [number, number, number] | number[];
  switch (header.colorType) {
    case ColorType.Grayscale:
      transparency = dataView.getUint16(offset);
      break;
    case ColorType.Truecolor:
      transparency = [
        dataView.getUint16(offset    ),
        dataView.getUint16(offset + 2),
        dataView.getUint16(offset + 4)
      ];
      break;
    case ColorType.Indexed:
      transparency = [];
      for (let i = 0; i < chunk.dataLength; i++) {
        transparency.push(dataView.getUint8(offset + i));
      }
      break;
  }

  return {
    type: 'tRNS',
    transparency
  };
}
