/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { IPartialDecodedPng, IPngChunk, KnownChunkTypes } from './types.js';

/**
 * Assert the given chunk type already exists.
 * @param chunk The chunk being checked.
 * @param decodedPng The partial decoded png.
 * @param strictMode Whether strict decoding is enabled.
 */
export function assertChunkSinglular(chunk: Pick<IPngChunk, 'type'>, decodedPng: Pick<IPartialDecodedPng, 'parsedChunks' | 'warnings'>, strictMode: boolean | undefined) {
  if (decodedPng.parsedChunks.has(chunk.type)) {
    handleWarning(new ChunkError(chunk, `Multiple ${chunk.type} chunks not allowed`), decodedPng.warnings, strictMode);
  }
}

/**
 * Assert a chunk's data length does not equal an expected value.
 * @param chunk The chunk being checked.
 * @param expected The expected data length of the chunk.
 */
export function assertChunkDataLengthEquals(chunk: Pick<IPngChunk, 'type' | 'dataLength'>, expected: number, warnings: Error[], strictMode: boolean | undefined) {
  if (chunk.dataLength !== expected) {
    const error = new ChunkError(chunk, `Invalid data length: ${chunk.dataLength} !== ${expected}`);
    // Only warn if the data is larger
    if (chunk.dataLength > expected) {
      handleWarning(error, warnings, strictMode);
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
 * @param chunk The chunk being checked.
 * @param typeAfter The chunk type that `type` must precede.
 * @param decodedPng The partial decoded png.
 * @param strictMode Whether strict decoding is enabled.
 */
export function assertChunkPrecedes(chunk: Pick<IPngChunk, 'type'>, typeAfter: KnownChunkTypes, decodedPng: Pick<IPartialDecodedPng, 'parsedChunks' | 'warnings'>, strictMode: boolean | undefined) {
  if (decodedPng.parsedChunks.has(typeAfter)) {
    handleWarning(new ChunkError(chunk, `Must precede ${typeAfter}`), decodedPng.warnings, strictMode);
  }
}

/**
 * Assert the chunk follows another chunk type, ie. the other chunk type has not yet been parsed.
 * @param chunk The chunk being checked.
 * @param typeAfter The chunk type that `type` must precede.
 * @param decodedPng The partial decoded png.
 */
export function assertChunkFollows(chunk: Pick<IPngChunk, 'type'>, typeAfter: KnownChunkTypes, decodedPng: Pick<IPartialDecodedPng, 'parsedChunks'>) {
  // Follows assertions are always errors by design
  if (!decodedPng.parsedChunks.has(typeAfter)) {
    throw new ChunkError(chunk, `Must follow ${typeAfter}`);
  }
}

/**
 * Assert the chunk does not exist alongside another chunk type, ie. the other chunk type has not yet been parsed.
 * @param chunk The chunk being checked.
 * @param otherType The chunk type that cannot be existed beside.
 * @param decodedPng The partial decoded png.
 * @param strictMode Whether strict decoding is enabled.
 */
export function assertChunkMutualExclusion(chunk: Pick<IPngChunk, 'type'>, otherType: KnownChunkTypes, decodedPng: Pick<IPartialDecodedPng, 'parsedChunks' | 'warnings'>, strictMode: boolean | undefined) {
  if (decodedPng.parsedChunks.has(otherType)) {
    handleWarning(new ChunkError(chunk, `Should not be present alongside ${otherType}`), decodedPng.warnings, strictMode);
  }
}
/**
 * Assert the chunk compression method is valid.
 * @param chunk The chunk being checked.
 * @param compressionMethod The chunk's compression method, only `0` (zlib datastream with deflate
 * compression) is valid.
 * @param strictMode Whether strict decoding is enabled.
 */
export function assertChunkCompressionMethod(chunk: Pick<IPngChunk, 'type'>, compressionMethod: number, warnings: Error[], strictMode: boolean | undefined) {
  if (compressionMethod !== 0) {
    handleWarning(new ChunkError(chunk, `Unknown compression method "${compressionMethod}"`), warnings, strictMode);
  }
}

export class ChunkError extends Error {
  constructor(chunk: Pick<IPngChunk, 'type'>, message: string) {
    super(`${chunk.type}: ${message}`);
  }
}

/**
 * Handles an error, throwing in strict mode or adding to the warnings array otherwise.
 */
export function handleWarning(error: Error, warnings: Error[], strictMode: boolean | undefined) {
  if (strictMode) {
    throw error;
  }
  warnings.push(error);
}
