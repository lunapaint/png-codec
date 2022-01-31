/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { ByteStream } from './byteStream.js';

export function writeChunkType(stream: ByteStream, type: string) {
  stream.writeUint8(type.charCodeAt(0));
  stream.writeUint8(type.charCodeAt(1));
  stream.writeUint8(type.charCodeAt(2));
  stream.writeUint8(type.charCodeAt(3));
}
