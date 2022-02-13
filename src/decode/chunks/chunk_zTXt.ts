/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkCompressionMethod, assertChunkDataLengthGte } from '../assert.js';
import { readText } from '../text.js';
import { ChunkPartByteLength, IDecodeContext, IPngChunk, IPngHeaderDetails, IPngMetadataCompressedTextualData } from '../../shared/types.js';

/**
 * `zTXt` Textual data
 *
 * Spec: https://www.w3.org/TR/PNG/#11tEXt
 */
export function parseChunk(ctx: IDecodeContext, header: IPngHeaderDetails, chunk: IPngChunk): IPngMetadataCompressedTextualData {
  assertChunkDataLengthGte(ctx, chunk, 6);

  // Format:
  // Keyword:            1-79 bytes (character string)
  // Null separator:     1 byte (null character)
  // Text:               0 or more bytes
  const chunkDataOffset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const maxOffset = chunkDataOffset + chunk.dataLength; // Ensures reading outside this chunk is not allowed
  let offset = chunkDataOffset;
  const textDecoder = new TextDecoder('latin1');
  let readResult: { bytesRead: number, text: string };

  readResult = readText(ctx, chunk, textDecoder, 79, offset, maxOffset, true);
  offset += readResult.bytesRead;
  const keyword = readResult.text;

  const compressionMethod = ctx.view.getUint8(offset);
  assertChunkCompressionMethod(ctx, chunk, compressionMethod, offset);
  offset++;

  readResult = readText(ctx, chunk, textDecoder, undefined, offset, maxOffset, false, true);
  offset += readResult.bytesRead;
  const text = readResult.text;

  return {
    type: 'zTXt',
    keyword,
    text
  };
}
