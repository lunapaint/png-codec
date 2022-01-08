/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkPrecedes, assertChunkSinglular, ChunkError } from '../assert.js';
import { ChunkPartByteLength, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngMetadataSignificantBits, KnownChunkTypes } from '../types.js';

/**
 * Spec: https://www.w3.org/TR/PNG/#11sBIT
 *
 * The sBIT (Significant bits) chunk defines a bit depth less than or equal to the image's bit depth
 * which allows potentially storing bit depths not equal to 1, 2, 4, 8 or 16 within pngs. Since the
 * assembled data is output as a 32-bit image or 64-bit image, this is only useful in the library
 * for handling non-standard bit depths of 9 to 15.
 */
export function parseChunk(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng): IPngMetadataSignificantBits {
  assertChunkSinglular(chunk, decodedPng);
  assertChunkPrecedes(chunk, KnownChunkTypes.PLTE, decodedPng);
  assertChunkPrecedes(chunk, KnownChunkTypes.IDAT, decodedPng);

  // Format:
  // `0` (Greyscale): number
  // `2` (Truecolor): [number, number, number]
  // `3` (Indexed): [number, number, number]
  // `4` (Greyscale and alpha): [number, number]
  // `6` (Truecolor and alpha): [number, number, number, number]
  const offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  let value: number | [number, number] | [number, number, number] | [number, number, number, number];
  let expectedLength: number;
  switch (header.colorType) {
    case 0: {
      value = dataView.getUint8(offset);
      expectedLength = 1;
      break;
    }
    case 2:
    case 3: {
      value = [
        dataView.getUint8(offset    ),
        dataView.getUint8(offset + 1),
        dataView.getUint8(offset + 2)
      ];
      expectedLength = 3;
      break;
    }
    case 4: {
      value = [
        dataView.getUint8(offset    ),
        dataView.getUint8(offset + 1)
      ];
      expectedLength = 2;
      break;
    }
    case 6: {
      value = [
        dataView.getUint8(offset    ),
        dataView.getUint8(offset + 1),
        dataView.getUint8(offset + 2),
        dataView.getUint8(offset + 3)
      ];
      expectedLength = 4;
      break;
    }
    default:
      throw new ChunkError(chunk, `Unrecognized color type "${header.colorType}"`);
  }

  // TODO: Warn instead
  assertChunkDataLengthEquals(chunk, expectedLength);

  return {
    type: 'sBIT',
    value
  };
}
