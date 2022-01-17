/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { IDecodeContext, IPngChunk, KnownChunkTypes } from './types.js';

/**
 * Assert the given chunk type already exists.
 * @param ctx The decode context.
 * @param chunk The chunk being checked.
 */
export function assertChunkSinglular(ctx: IDecodeContext, chunk: Pick<IPngChunk, 'type'>) {
  if (ctx.parsedChunks.has(chunk.type)) {
    handleWarning(ctx, new ChunkError(chunk, `Multiple ${chunk.type} chunks not allowed`));
  }
}

/**
 * Assert a chunk's data length does not equal an expected value.
 * @param ctx The decode context.
 * @param chunk The chunk being checked.
 * @param expected The expected data length of the chunk.
 */
export function assertChunkDataLengthEquals(ctx: IDecodeContext, chunk: Pick<IPngChunk, 'type' | 'dataLength'>, expected: number) {
  if (chunk.dataLength !== expected) {
    const error = new ChunkError(chunk, `Invalid data length: ${chunk.dataLength} !== ${expected}`);
    // Only warn if the data is larger
    if (chunk.dataLength > expected) {
      handleWarning(ctx, error);
    } else {
      throw error;
    }
  }
}

/**
 * Assert a chunk's data length is greater than an expected value.
 * @param chunk The chunk being checked.
 * @param expected The expected data length of the chunk.
 */
export function assertChunkDataLengthGte(chunk: Pick<IPngChunk, 'type' | 'dataLength'>, expected: number) {
  if (chunk.dataLength < expected) {
    throw new ChunkError(chunk, `Invalid data length: ${chunk.dataLength} < ${expected}`);
  }
}

/**
 * Assert the chunk precedes another chunk type, ie. the other chunk type has not yet been parsed.
 * @param ctx The decode context.
 * @param chunk The chunk being checked.
 * @param typeAfter The chunk type that `type` must precede.
 */
export function assertChunkPrecedes(ctx: IDecodeContext, chunk: Pick<IPngChunk, 'type'>, typeAfter: KnownChunkTypes) {
  if (ctx.parsedChunks.has(typeAfter)) {
    handleWarning(ctx, new ChunkError(chunk, `Must precede ${typeAfter}`));
  }
}

/**
 * Assert the chunk follows another chunk type, ie. the other chunk type has not yet been parsed.
 * @param ctx The decode context.
 * @param chunk The chunk being checked.
 * @param typeAfter The chunk type that `type` must precede.
 */
export function assertChunkFollows(ctx: IDecodeContext, chunk: Pick<IPngChunk, 'type'>, typeAfter: KnownChunkTypes) {
  // Follows assertions are always errors by design
  if (!ctx.parsedChunks.has(typeAfter)) {
    throw new ChunkError(chunk, `Must follow ${typeAfter}`);
  }
}

/**
 * Assert the chunk does not exist alongside another chunk type, ie. the other chunk type has not yet been parsed.
 * @param ctx The decode context.
 * @param chunk The chunk being checked.
 * @param otherType The chunk type that cannot be existed beside.
 */
export function assertChunkMutualExclusion(ctx: IDecodeContext, chunk: Pick<IPngChunk, 'type'>, otherType: KnownChunkTypes) {
  if (ctx.parsedChunks.has(otherType)) {
    handleWarning(ctx, new ChunkError(chunk, `Should not be present alongside ${otherType}`));
  }
}
/**
 * Assert the chunk compression method is valid.
 * @param ctx The decode context.
 * @param chunk The chunk being checked.
 * @param compressionMethod The chunk's compression method, only `0` (zlib datastream with deflate
 * compression) is valid.
 */
export function assertChunkCompressionMethod(ctx: IDecodeContext, chunk: Pick<IPngChunk, 'type'>, compressionMethod: number) {
  if (compressionMethod !== 0) {
    handleWarning(ctx, new ChunkError(chunk, `Unknown compression method "${compressionMethod}"`));
  }
}

export class ChunkError extends Error {
  constructor(chunk: Pick<IPngChunk, 'type'>, message: string) {
    super(`${chunk.type}: ${message}`);
  }
}

/**
 * Handles an error, throwing in strict mode or adding to the warnings array otherwise.
 * @param ctx The decode context.
 * @param error The error to handle.
 */
export function handleWarning(ctx: IDecodeContext, error: Error) {
  if (ctx.options.strictMode) {
    throw error;
  }
  ctx.warnings.push(error);
}
