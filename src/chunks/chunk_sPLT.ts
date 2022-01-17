/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { readText } from '../text.js';
import { assertChunkPrecedes, createChunkDecodeWarning, DecodeWarning } from '../assert.js';
import { ChunkPartByteLength, IDecodePngOptions, IDecodeContext, IPngChunk, IPngHeaderDetails, IPngMetadataSuggestedPalette, IPngMetadataSuggestedPaletteEntry, KnownChunkTypes } from '../types.js';

/**
 * `sPLT` Suggested palette
 *
 * Spec: https://www.w3.org/TR/PNG/#11sPLT
 */
export function parseChunk(ctx: IDecodeContext, header: IPngHeaderDetails, chunk: IPngChunk): IPngMetadataSuggestedPalette {
  assertChunkPrecedes(ctx, chunk, KnownChunkTypes.IDAT);

  const dataStartOffset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  let offset = dataStartOffset;
  const maxOffset = offset + chunk.dataLength; // Ensures reading outside this chunk is not allowed
  const textDecoder = new TextDecoder('latin1');
  const readResult = readText(ctx, chunk, textDecoder, undefined, offset, maxOffset, true);
  offset += readResult.bytesRead;
  const name = readResult.text;

  const sampleDepth = ctx.view.getUint8(offset++);
  const sampleBytes = sampleDepth === 16 ? 2 : 1;

  // Verify length
  const entrySize = sampleBytes * 4 + 2/*Frequency*/;
  const entriesOffset = (chunk.dataLength - (offset - dataStartOffset));
  const entryCount = entriesOffset / entrySize;
  if (entryCount % 1 !== 0) {
    throw createChunkDecodeWarning(chunk, `Invalid data length: ${entriesOffset} should be divisible by entry size ${entrySize}`, offset);
  }

  const entries: IPngMetadataSuggestedPaletteEntry[] = [];
  for (let i = 0; i < entryCount; i++) {
    const channels: number[] = [];
    for (let c = 0; c < 4; c++) {
      channels.push(sampleBytes === 2 ? ctx.view.getUint16(offset) : ctx.view.getUint8(offset));
      offset += sampleBytes;
    }
    const frequency = ctx.view.getUint16(offset);
    offset += 2;
    entries.push({
      red: channels[0],
      green: channels[1],
      blue: channels[2],
      alpha: channels[3],
      frequency
    });
  }

  return {
    type: 'sPLT',
    name,
    sampleDepth,
    entries
  };
}
