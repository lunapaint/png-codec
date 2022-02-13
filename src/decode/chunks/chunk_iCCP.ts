/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkCompressionMethod, assertChunkDataLengthGte, assertChunkMutualExclusion, assertChunkPrecedes, assertChunkSinglular } from '../assert.js';
import { readText } from '../text.js';
import { ChunkPartByteLength, IDecodeContext, IPngChunk, IPngHeaderDetails, IPngMetadataEmbeddedIccProfile, KnownChunkTypes } from '../../types.js';

/**
 * `iCCP` Embedded ICC profile
 *
 * Spec: https://www.w3.org/TR/PNG/#11iCCP
 */
export function parseChunk(ctx: IDecodeContext, header: IPngHeaderDetails, chunk: IPngChunk): IPngMetadataEmbeddedIccProfile {
  assertChunkSinglular(ctx, chunk);
  assertChunkMutualExclusion(ctx, chunk, KnownChunkTypes.sRGB);
  assertChunkPrecedes(ctx, chunk, KnownChunkTypes.PLTE);
  assertChunkPrecedes(ctx, chunk, KnownChunkTypes.IDAT);
  assertChunkDataLengthGte(ctx, chunk, 3);

  const chunkDataOffset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const maxOffset = chunkDataOffset + chunk.dataLength; // Ensures reading outside this chunk is not allowed
  let offset = chunkDataOffset;
  const textDecoder = new TextDecoder('latin1');

  const readResult = readText(ctx, chunk, textDecoder, 79, offset, maxOffset, true);
  offset += readResult.bytesRead;
  const name = readResult.text;

  const compressionMethod = ctx.view.getUint8(offset);
  assertChunkCompressionMethod(ctx, chunk, compressionMethod, offset);
  offset++;

  const data = new Uint8Array(ctx.view.buffer.slice(ctx.view.byteOffset + offset, ctx.view.byteOffset + maxOffset));

  return {
    type: 'iCCP',
    name,
    data
  };
}
