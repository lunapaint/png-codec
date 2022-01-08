/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { ChunkPartByteLength, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngMetadataExif } from '../types.js';

/**
 * Spec: https://www.w3.org/TR/PNG/#11eXIf
 *
 * The eXIf (Exchangeable image file format) chunk contains various addition metadata on an image,
 * typically added by digital cameras, scanners, etc.
 */
export function parseChunk(header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng): IPngMetadataExif {
  const offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
  return {
    type: 'eXIf',
    value: dataView.buffer.slice(offset, offset + chunk.dataLength)
  };
}
