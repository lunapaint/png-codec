/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { ChunkPartByteLength, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngMetadataExif } from '../types.js';

/**
 * `iCCP` Embedded ICC profile
 *
 * Spec: https://www.w3.org/TR/PNG/#11iCCP
 */
export function parseChunk(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng): IPngMetadataExif {
  const offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  return {
    type: 'eXIf',
    value: dataView.buffer.slice(dataView.byteOffset + offset, dataView.byteOffset + offset + chunk.dataLength)
  };
}
