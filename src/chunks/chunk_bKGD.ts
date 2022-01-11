/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkPrecedes, assertChunkSinglular, ChunkError } from '../assert.js';
import { ChunkPartByteLength, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngMetadataBackgroundColor, IPngPalette, KnownChunkTypes, PngMetadata } from '../types.js';

/**
 * Spec: https://www.w3.org/TR/PNG/#11bKGD
 *
 * The bKGD (Background) chunk contains the preferred default background color to present the image
 * against when there isn't another option. This is useful in image viewers for example but not in
 * web browsers (where an existing background color exists) or image editors (where retaining
 * transparency is important).
 *
 * An example of where this might be useful is a diagram with text all in black where everything
 * else is transparent, opening this in an image viewer with a dark background would make this
 * unreadable but not if the image viewer respected a white bKGD entry.
 */
export function parseChunk(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng): IPngMetadataBackgroundColor {
  assertChunkPrecedes(chunk, KnownChunkTypes.IDAT, decodedPng);
  assertChunkSinglular(chunk, decodedPng);

  const offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  let color: number | [number, number, number];
  let expectedLength: number;
  switch (header.colorType) {
    case 0:
    case 4: {
      color = dataView.getUint16(offset);
      expectedLength = 2;
      break;
    }
    case 2:
    case 6: {
      color = [
        dataView.getUint16(offset    ),
        dataView.getUint16(offset + 2),
        dataView.getUint16(offset + 4)
      ];
      expectedLength = 6;
      break;
    }
    case 3: {
      color = dataView.getUint8(offset);
      expectedLength = 1;
      break;
    }
    default:
      throw new ChunkError(chunk, `Unrecognized color type "${header.colorType}"`);
  }

  // TODO: Warn instead
  assertChunkDataLengthEquals(chunk, expectedLength);

  return { type: 'bKGD', color };
}
