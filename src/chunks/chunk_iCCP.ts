/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkCompressionMethod, assertChunkDataLengthGte, assertChunkMutualExclusion, assertChunkPrecedes, assertChunkSinglular } from '../assert.js';
import { readText } from '../text.js';
import { ChunkPartByteLength, IDecodePngOptions, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngMetadataEmbeddedIccProfile, KnownChunkTypes } from '../types.js';

/**
 * `iCCP` Embedded ICC profile
 *
 * Spec: https://www.w3.org/TR/PNG/#11iCCP
 */
export function parseChunk(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng, options: IDecodePngOptions | undefined): IPngMetadataEmbeddedIccProfile {
  assertChunkSinglular(chunk, decodedPng, options?.strictMode);
  assertChunkMutualExclusion(chunk, KnownChunkTypes.sRGB, decodedPng, options?.strictMode);
  assertChunkPrecedes(chunk, KnownChunkTypes.PLTE, decodedPng, options?.strictMode);
  assertChunkPrecedes(chunk, KnownChunkTypes.IDAT, decodedPng, options?.strictMode);
  assertChunkDataLengthGte(chunk, 3);

  const chunkDataOffset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const maxOffset = chunkDataOffset + chunk.dataLength; // Ensures reading outside this chunk is not allowed
  let offset = chunkDataOffset;
  const textDecoder = new TextDecoder('latin1');

  const readResult = readText(dataView, textDecoder, 79, offset, maxOffset, true);
  offset += readResult.bytesRead;
  const name = readResult.text;

  const compressionMethod = dataView.getUint8(offset++);
  assertChunkCompressionMethod(chunk, compressionMethod, decodedPng.warnings, options?.strictMode);

  const data = new Uint8Array(dataView.buffer.slice(dataView.byteOffset + offset, dataView.byteOffset + maxOffset));

  return {
    type: 'iCCP',
    name,
    data
  };
}
