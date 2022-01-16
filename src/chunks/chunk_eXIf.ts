/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { ChunkPartByteLength, IDecodePngOptions, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngMetadataExif } from '../types.js';

/**
 * `eXIf` Exchangeable image file format
 *
 * Spec: https://www.w3.org/TR/PNG/#11eXIf
 */
export function parseChunk(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng, options: IDecodePngOptions | undefined): IPngMetadataExif {
  const offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  return {
    type: 'eXIf',
    value: dataView.buffer.slice(dataView.byteOffset + offset, dataView.byteOffset + offset + chunk.dataLength)
  };
}
