/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { readText } from '../text.js';
import { assertChunkPrecedes, ChunkError } from '../assert.js';
import { ChunkPartByteLength, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngMetadataSuggestedPalette, IPngMetadataSuggestedPaletteEntry, KnownChunkTypes } from '../types.js';

/**
 * sPLT Suggested palette
 *
 * Spec: https://www.w3.org/TR/PNG/#11sPLT
 */
export function parseChunk(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng): IPngMetadataSuggestedPalette {
  assertChunkPrecedes(chunk, KnownChunkTypes.IDAT, decodedPng);

  const dataStartOffset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  let offset = dataStartOffset;
  const maxOffset = offset + chunk.dataLength; // Ensures reading outside this chunk is not allowed
  const textDecoder = new TextDecoder('latin1');
  const readResult = readText(dataView, textDecoder, undefined, offset, maxOffset, true);
  offset += readResult.bytesRead;
  const name = readResult.text;

  const sampleDepth = dataView.getUint8(offset++);
  const sampleBytes = sampleDepth === 16 ? 2 : 1;

  // Verify length
  const entrySize = sampleBytes * 4 + 2/*Frequency*/;
  const entryCount = (chunk.dataLength - (offset - dataStartOffset)) / entrySize;
  if (entryCount % 1 !== 0) {
    throw new ChunkError(chunk, `Invalid data length: ${chunk.dataLength} - ${offset - dataStartOffset} should be divisible by entry size ${entrySize}`);
  }

  const entries: IPngMetadataSuggestedPaletteEntry[] = [];
  for (let i = 0; i < entryCount; i++) {
    const channels: number[] = [];
    for (let c = 0; c < 4; c++) {
      channels.push(sampleBytes === 2 ? dataView.getUint16(offset) : dataView.getUint8(offset));
      offset += sampleBytes;
    }
    const frequency = dataView.getUint16(offset);
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
