/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, ChunkError } from '../assert.js';
import { BitDepth, ChunkPartByteLength, ColorType, IPngHeaderDetails, InterlaceMethod, IPngChunk } from '../types.js';

/**
 * `IHDR` Image Header
 *
 * Spec: https://www.w3.org/TR/PNG/#11IHDR
 *
 * The IHDR (Image Header) chunk contains critical information about the image such as its
 * dimensions and bit depth, this information is used when looking at later chunks and it's required
 * that this chunk is the first chunk in the datastream.
 */
export function parseChunk_IHDR(dataView: DataView, chunk: IPngChunk): IPngHeaderDetails { // eslint-disable-line @typescript-eslint/naming-convention
  assertChunkDataLengthEquals(chunk, 13);

  let offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const width = dataView.getUint32(offset); offset += 4;
  const height = dataView.getUint32(offset); offset += 4;
  const bitDepth = dataView.getUint8(offset++);
  const colorType = dataView.getUint8(offset++);
  const compressionMethod = dataView.getUint8(offset++);
  const filterMethod = dataView.getUint8(offset++);
  const interlaceMethod = dataView.getUint8(offset++);

  if (!isValidBitDepth(bitDepth)) {
    throw new ChunkError(chunk, `Bit depth "${bitDepth}" is not valid`);
  }
  // TODO: This check doesn't apply if the image has a palette
  // if (!isValidColorType(colorType, bitDepth)) {
  //   throw new ChunkError(chunk, `Color type "${colorType}" is not valid with bit depth "${bitDepth}"`);
  // }
  if (compressionMethod !== 0) {
    // TODO: Warn instead
    throw new ChunkError(chunk, `Compression method "${compressionMethod}" is not valid`);
  }
  if (filterMethod !== 0) {
    // TODO: Warn instead
    throw new ChunkError(chunk, `Filter method "${filterMethod}" is not valid`);
  }
  if (!isValidInterlaceMethod(interlaceMethod)) {
    throw new ChunkError(chunk, `Interlace method "${interlaceMethod}" is not valid`);
  }

  return {
    width,
    height,
    bitDepth,
    colorType,
    interlaceMethod
  };
}

function isValidBitDepth(bitDepth: number): bitDepth is BitDepth {
  return (
    bitDepth === 1 ||
    bitDepth === 2 ||
    bitDepth === 4 ||
    bitDepth === 8 ||
    bitDepth === 16
  );
}

function isValidColorType(colorType: number, bitDepth: number): colorType is ColorType {
  return (
    (colorType === 0 && bitDepth >= 1 && bitDepth <= 8) ||
    (colorType === 2 && bitDepth >= 1 && bitDepth <= 16) ||
    (colorType === 3 && bitDepth >= 8 && bitDepth <= 16) ||
    (colorType === 4 && bitDepth >= 8 && bitDepth <= 16) ||
    (colorType === 6 && bitDepth >= 8 && bitDepth <= 16)
  );
}

function isValidInterlaceMethod(interlaceMethod: number): interlaceMethod is InterlaceMethod {
  return (
    interlaceMethod === 0 ||
    interlaceMethod === 1
  );
}
