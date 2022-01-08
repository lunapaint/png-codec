/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { IPartialDecodedPng, IPngChunk, KnownChunkTypes } from './types.js';

export function assert1b(dataView: DataView, offset: number, expected: number) {
  if (dataView.getUint8(offset) !== expected) {
    throw new Error(`Assertion failure: ${dataView.getUint8(offset)} !== ${expected}`);
  }
}

/**
 * Assert the given chunk type already exists.
 * @param chunk The chunk being checked.
 * @param decodedPng The partial decoded png.
 */
export function assertChunkSinglular(chunk: Pick<IPngChunk, 'type'>, decodedPng: Pick<IPartialDecodedPng, 'parsedChunks'>) {
  if (decodedPng.parsedChunks.has(chunk.type)) {
    throw new ChunkError(chunk, `Multiple ${chunk.type} chunks not allowed`);
  }
}

/**
 * Assert a chunk's data length does not equal an expected value.
 * @param chunk The chunk being checked.
 * @param expected The expected data length of the chunk.
 */
export function assertChunkDataLengthEquals(chunk: Pick<IPngChunk, 'type' | 'dataLength'>, expected: number) {
  if (chunk.dataLength !== expected) {
    throw new ChunkError(chunk, `Invalid data length: ${chunk.dataLength} !== ${expected}`);
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
 */
export function assertChunkPrecedes(chunk: Pick<IPngChunk, 'type'>, typeAfter: KnownChunkTypes, decodedPng: Pick<IPartialDecodedPng, 'parsedChunks'>) {
  if (decodedPng.parsedChunks.has(typeAfter)) {
    throw new ChunkError(chunk, `Must precede ${typeAfter}`);
  }
}

/**
 * Assert the chunk follows another chunk type, ie. the other chunk type has not yet been parsed.
 * @param chunk The chunk being checked.
 * @param typeAfter The chunk type that `type` must precede.
 * @param decodedPng The partial decoded png.
 */
export function assertChunkFollows(chunk: Pick<IPngChunk, 'type'>, typeAfter: KnownChunkTypes, decodedPng: Pick<IPartialDecodedPng, 'parsedChunks'>) {
  if (!decodedPng.parsedChunks.has(typeAfter)) {
    throw new ChunkError(chunk, `Must follow ${typeAfter}`);
  }
}

/**
 * Assert the chunk does not exist alongside another chunk type, ie. the other chunk type has not yet been parsed.
 * @param chunk The chunk being checked.
 * @param otherType The chunk type that cannot be existed beside.
 * @param decodedPng The partial decoded png.
 */
export function assertChunkMutualExclusion(chunk: Pick<IPngChunk, 'type'>, otherType: KnownChunkTypes, decodedPng: Pick<IPartialDecodedPng, 'parsedChunks'>) {
  if (decodedPng.parsedChunks.has(otherType)) {
    throw new ChunkError(chunk, `Should not be present alongside ${otherType}`);
  }
}

export class ChunkError extends Error {
  constructor(chunk: Pick<IPngChunk, 'type'>, message: string) {
    super(`${chunk.type}: ${message}`);
  }
}
