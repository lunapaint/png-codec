/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { readText } from '../text.js';
import { assertChunkDataLengthGte } from '../assert.js';
import { ChunkPartByteLength, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngMetadataTextualData } from '../types.js';

/**
 * tEXt Textual data
 *
 * Spec: https://www.w3.org/TR/PNG/#11tEXt
 */
export function parseChunk(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng): IPngMetadataTextualData {
  assertChunkDataLengthGte(chunk, 6);

  // Format:
  // Keyword:            1-79 bytes (character string)
  // Null separator:     1 byte (null character)
  // Text:               0 or more bytes
  const chunkDataOffset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const maxOffset = chunkDataOffset + chunk.dataLength; // Ensures reading outside this chunk is not allowed
  let offset = chunkDataOffset;
  const textDecoder = new TextDecoder('latin1');
  let readResult: { bytesRead: number, text: string };

  readResult = readText(dataView, textDecoder, 79, offset, maxOffset, true);
  offset += readResult.bytesRead;
  const keyword = readResult.text;

  readResult = readText(dataView, textDecoder, undefined, offset, maxOffset, false);
  offset += readResult.bytesRead;
  const text = readResult.text;

  return {
    type: 'tEXt',
    keyword,
    text
  };
}
