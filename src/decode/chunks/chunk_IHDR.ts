/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkCompressionMethod, assertChunkDataLengthEquals, createChunkDecodeError, createChunkDecodeWarning, handleWarning } from '../../assert.js';
import { BitDepth, ChunkPartByteLength, ColorType, IDecodeContext, IInitialDecodeContext, InterlaceMethod, IPngChunk, IPngHeaderDetails } from '../../types.js';
import { isValidBitDepth, isValidColorType, isValidFilterMethod, isValidInterlaceMethod } from '../../validate.js';

/**
 * `IHDR` Image Header
 *
 * Spec: https://www.w3.org/TR/PNG/#11IHDR
 *
 * The IHDR (Image Header) chunk contains critical information about the image such as its
 * dimensions and bit depth, this information is used when looking at later chunks and it's required
 * that this chunk is the first chunk in the datastream.
 */
export function parseChunk(ctx: IInitialDecodeContext, chunk: IPngChunk): IPngHeaderDetails { // eslint-disable-line @typescript-eslint/naming-convention
  assertChunkDataLengthEquals(ctx, chunk, 13);

  let offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const width = ctx.view.getUint32(offset); offset += 4;
  const height = ctx.view.getUint32(offset); offset += 4;

  const bitDepth = ctx.view.getUint8(offset);
  if (!isValidBitDepth(bitDepth)) {
    throw createChunkDecodeError(ctx, chunk, `Bit depth "${bitDepth}" is not valid`, offset);
  }
  offset++;

  const colorType = ctx.view.getUint8(offset);
  if (!isValidColorType(colorType, bitDepth)) {
    throw createChunkDecodeError(ctx, chunk, `Color type "${colorType}" is not valid with bit depth "${bitDepth}"`, offset);
  }
  offset++;

  const compressionMethod = ctx.view.getUint8(offset);
  assertChunkCompressionMethod(ctx, chunk, compressionMethod, offset);
  offset++;

  let filterMethod = ctx.view.getUint8(offset);
  if (!isValidFilterMethod(filterMethod)) {
    handleWarning(ctx, createChunkDecodeWarning(chunk, `Filter method "${filterMethod}" is not valid`, offset));
    // Validation failed. If not in strict mode, continue with adaptive filter method
    filterMethod = 0;
  }
  offset++;

  let interlaceMethod = ctx.view.getUint8(offset);
  if (!isValidInterlaceMethod(interlaceMethod)) {
    handleWarning(ctx, createChunkDecodeWarning(chunk, `Interlace method "${interlaceMethod}" is not valid`, offset));
    // Validation failed. If not in strict mode, continue with no interlace method
    interlaceMethod = InterlaceMethod.None;
  }
  offset++;

  return {
    width,
    height,
    bitDepth,
    colorType,
    interlaceMethod
  };
}
