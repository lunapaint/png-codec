/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkDataLengthEquals, assertChunkSinglular } from '../assert.js';
import { ChunkPartByteLength, IDecodePngOptions, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngMetadataLastModificationTime } from '../types.js';

/**
 * `tIME` Image last-modification time
 *
 * Spec: https://www.w3.org/TR/PNG/#11tIME
 */
export function parseChunk(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng, options: IDecodePngOptions | undefined): IPngMetadataLastModificationTime {
  assertChunkSinglular(chunk, decodedPng, options?.strictMode);
  assertChunkDataLengthEquals(chunk, 7);

  // Format:
  // Year:   2 bytes (complete; for example, 1995, not 95)
  // Month:  1 byte (1-12)
  // Day:    1 byte (1-31)
  // Hour:   1 byte (0-23)
  // Minute: 1 byte (0-59)
  // Second: 1 byte (0-60) (to allow for leap seconds)
  let offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  const year = dataView.getUint16(offset); offset += 2;
  const month = dataView.getUint8(offset++);
  const day = dataView.getUint8(offset++);
  const hour = dataView.getUint8(offset++);
  const minute = dataView.getUint8(offset++);
  const second = dataView.getUint8(offset++);

  return {
    type: 'tIME',
    value: new Date(year, month, day, hour, minute, second)
  };
}
