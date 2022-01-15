/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkCompressionMethod, assertChunkDataLengthGte, ChunkError } from '../assert.js';
import { readText } from '../text.js';
import { ChunkPartByteLength, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngMetadataInternationalTextualData } from '../types.js';

/**
 * `iTXt` International textual data
 *
 * Spec: https://www.w3.org/TR/PNG/#11iTXt
 */
export function parseChunk(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng): IPngMetadataInternationalTextualData {
  assertChunkDataLengthGte(chunk, 6);

  // Format:
  // Keyword:            1-79 bytes (character string)
  // Null separator:     1 byte (null character)
  // Compression flag:   1 byte
  // Compression method: 1 byte
  // Language tag:       0 or more bytes (character string)
  // Null separator:     1 byte (null character)
  // Translated keyword: 0 or more bytes
  // Null separator:     1 byte (null character)
  // Text:               0 or more bytes
  let offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const maxOffset = offset + chunk.dataLength; // Ensures reading outside this chunk is not allowed
  const textDecoder = new TextDecoder('utf8');
  let readResult: { bytesRead: number, text: string };

  readResult = readText(dataView, textDecoder, 79, offset, maxOffset, true);
  offset += readResult.bytesRead;
  const keyword = readResult.text;

  const isCompressed = dataView.getUint8(offset++) === 1;
  const compressionMethod = dataView.getUint8(offset++);
  if (isCompressed) {
    assertChunkCompressionMethod(chunk, compressionMethod);
  }

  readResult = readText(dataView, textDecoder, undefined, offset, maxOffset, true);
  offset += readResult.bytesRead;
  const languageTag = readResult.text;

  readResult = readText(dataView, textDecoder, undefined, offset, maxOffset, true);
  offset += readResult.bytesRead;
  const translatedKeyword = readResult.text;

  readResult = readText(dataView, textDecoder, undefined, offset, maxOffset, false, isCompressed);
  offset += readResult.bytesRead;
  const text = readResult.text;

  return {
    type: 'iTXt',
    keyword,
    languageTag,
    translatedKeyword,
    text
  };
}
