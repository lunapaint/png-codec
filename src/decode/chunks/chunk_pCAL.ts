/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthGte, assertChunkPrecedes, assertChunkSinglular, createChunkDecodeWarning } from '../assert.js';
import { readFloat } from '../float.js';
import { readText } from '../text.js';
import { ChunkPartByteLength, IDecodeContext, IPngChunk, IPngHeaderDetails, IPngMetadataCalibrationOfPixelValues, KnownChunkTypes } from '../../types.js';

/**
 * `pCAL` Calibration of pixel values
 *
 * Spec: http://www.libpng.org/pub/png/spec/register/pngext-1.4.0-pdg.html#C.pCAL
 */
export function parseChunk(ctx: IDecodeContext, header: IPngHeaderDetails, chunk: IPngChunk): IPngMetadataCalibrationOfPixelValues {
  assertChunkSinglular(ctx, chunk);
  assertChunkPrecedes(ctx, chunk, KnownChunkTypes.IDAT);
  assertChunkDataLengthGte(ctx, chunk, 4);

  // Format:
  // Calibration name:     1-79 bytes (character string)
  // Null separator:       1 byte
  // Original zero (x0):   4 bytes (signed integer)
  // Original max  (x1):   4 bytes (signed integer)
  // Equation type:        1 byte
  // Number of parameters: 1 byte
  // Unit name:            0 or more bytes (character string)
  // Null separator:       1 byte
  // Parameter 0 (p0):     1 or more bytes (ASCII floating-point)
  // Null separator:       1 byte
  // Parameter 1 (p1):     1 or more bytes (ASCII floating-point)
  // ...etc...
  const chunkDataOffset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const maxOffset = chunkDataOffset + chunk.dataLength; // Ensures reading outside this chunk is not allowed
  let offset = chunkDataOffset;

  const textDecoder = new TextDecoder('latin1');
  let readTextResult: { bytesRead: number, text: string };
  readTextResult = readText(ctx, chunk, textDecoder, 79, offset, maxOffset, true);
  offset += readTextResult.bytesRead;
  const calibrationName = readTextResult.text;

  const x0 = ctx.view.getInt32(offset); offset += 4;
  const x1 = ctx.view.getInt32(offset); offset += 4;

  const equationTypeByte = ctx.view.getUint8(offset++);
  let equationType: 'linear-mapping' | 'base-e exponential mapping' | 'arbitrary-base exponential mapping' | 'hyperbolic mapping';
  switch (equationTypeByte) {
    case 0: equationType = 'linear-mapping'; break;
    case 1: equationType = 'base-e exponential mapping'; break;
    case 2: equationType = 'arbitrary-base exponential mapping'; break;
    case 3: equationType = 'hyperbolic mapping'; break;
    default: throw createChunkDecodeWarning(chunk, `Invalid equation type "${equationTypeByte}"`, offset);
  }

  const parameterCount = ctx.view.getUint8(offset++);

  readTextResult = readText(ctx, chunk, textDecoder, 79, offset, maxOffset, true);
  offset += readTextResult.bytesRead;
  const unitName = readTextResult.text;

  const params: number[] = [];
  let readFloatResult: { bytesRead: number, value: number };
  for (let i = 0; i < parameterCount; i++) {
    readFloatResult = readFloat(ctx, chunk, textDecoder, offset, maxOffset, i < parameterCount - 1);
    offset += readFloatResult.bytesRead;
    params.push(readFloatResult.value);
  }

  return {
    type: 'pCAL',
    calibrationName,
    x0,
    x1,
    equationType,
    unitName,
    params
  };
}
