/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthGte, assertChunkPrecedes, assertChunkSinglular, createChunkDecodeWarning } from '../assert.js';
import { readFloat } from '../float.js';
import { readText } from '../text.js';
import { ChunkPartByteLength, IDecodeContext, IPngChunk, IPngHeaderDetails, IPngMetadataPhysicalScaleOfImageSubject, KnownChunkTypes } from '../types.js';

/**
 * `sCAL` Physical scale of image subject
 *
 * Spec: http://www.libpng.org/pub/png/spec/register/pngext-1.4.0-pdg.html#C.sCAL
 */
export function parseChunk(ctx: IDecodeContext, header: IPngHeaderDetails, chunk: IPngChunk): IPngMetadataPhysicalScaleOfImageSubject {
  assertChunkSinglular(ctx, chunk);
  assertChunkPrecedes(ctx, chunk, KnownChunkTypes.IDAT);
  assertChunkDataLengthGte(ctx, chunk, 4);

  // Format:
  // Unit specifier: 1 byte
  // Pixel width:    1 or more bytes (ASCII floating-point)
  // Null separator: 1 byte
  // Pixel height:   1 or more bytes (ASCII floating-point)
  const chunkDataOffset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const maxOffset = chunkDataOffset + chunk.dataLength; // Ensures reading outside this chunk is not allowed
  let offset = chunkDataOffset;
  const textDecoder = new TextDecoder('latin1');

  const unitTypeByte = ctx.view.getUint8(offset);
  let unitType: 'meter' | 'radian';
  switch (unitTypeByte) {
    case 0: unitType = 'meter'; break;
    case 1: unitType = 'radian'; break;
    default: throw createChunkDecodeWarning(chunk, `Invalid sCAL unit type ("${unitTypeByte}")`, offset);
  }
  offset++;

  let readResult: { bytesRead: number, value: number };
  readResult = readFloat(ctx, chunk, textDecoder, offset, maxOffset, true);
  offset += readResult.bytesRead;
  const x = readResult.value;

  readResult = readFloat(ctx, chunk, textDecoder, offset, maxOffset, false);
  offset += readResult.bytesRead;
  const y = readResult.value;

  if (x < 0 || y < 0) {
    throw createChunkDecodeWarning(chunk, `Values cannot be negative (${x}, ${y})`, offset);
  }

  return {
    type: 'sCAL',
    pixelsPerUnit: { x, y },
    unitType
  };
}
