/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { crc32 } from './crc32.js';
import { ByteStream } from './byteStream.js';
import { BitDepth, ChunkPartByteLength, ColorType, IEncodePngOptions, IImage32, IImage64, InterlaceMethod } from './types.js';

export async function encodePng(image: Readonly<IImage32> | Readonly<IImage64>, options?: IEncodePngOptions): Promise<Uint8Array> {
  // Create all file sections
  const sections = [];
  sections.push(writePngSignature());
  // TODO: Support configuring bit depth
  // TODO: Support configuring color type
  // TODO: Support configuring interlace method
  sections.push(writeIHDR(image, 8, ColorType.Truecolor, InterlaceMethod.None));
  console.log('sections', sections);

  // Merge sections into a single typed array
  const totalLength = sections.reduce((p, c) => p + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const s of sections) {
    result.set(s, offset);
    offset += s.length;
  }
  console.log('result', result);

  return result;
}

function writePngSignature(): Uint8Array {
  const stream = new ByteStream(8);
  stream.writeUint8(0x89);
  stream.writeUint8(0x50);
  stream.writeUint8(0x4E);
  stream.writeUint8(0x47);
  stream.writeUint8(0x0D);
  stream.writeUint8(0x0A);
  stream.writeUint8(0x1A);
  stream.writeUint8(0x0A);
  stream.assertAtEnd();
  return stream.array;
}

function writeIHDR(
  image: Readonly<IImage32> | Readonly<IImage64>,
  bitDepth: BitDepth,
  colorType: ColorType,
  interlaceMethod: InterlaceMethod
): Uint8Array {
  if (image.width <= 0 || image.height <= 0) {
    throw new Error(`Invalid dimensions ${image.width}x${image.height}`);
  }

  const dataLength = 13;
  const stream = new ByteStream(ChunkPartByteLength.Length + ChunkPartByteLength.Length + dataLength + ChunkPartByteLength.CRC);

  // Data length
  stream.writeUint32(dataLength);

  // Chunk type
  writeChunkType(stream, 'IHDR');

  // Data
  stream.writeUint32(image.width);
  stream.writeUint32(image.height);
  // Bit depth
  stream.writeUint8(bitDepth);
  // Color type
  stream.writeUint8(colorType);
  // Compression method (only 0 is valid)
  stream.writeUint8(0);
  // Filter method (only 0 is valid)
  stream.writeUint8(0);
  // Interlace method
  stream.writeUint8(interlaceMethod);

  // CRC
  const crc = crc32(stream.view, ChunkPartByteLength.Length, ChunkPartByteLength.Type + dataLength);
  stream.writeUint32(crc);

  // Validation
  stream.assertAtEnd();

  return stream.array;
}

function initBuffer(length: number): { array: Uint8Array, view: DataView } {
  const array = new Uint8Array(length);
  const view = new DataView(array.buffer, array.byteOffset, array.byteLength);
  return { array, view };
}

function writeChunkType(stream: ByteStream, type: string) {
  stream.writeUint8(type.charCodeAt(0));
  stream.writeUint8(type.charCodeAt(1));
  stream.writeUint8(type.charCodeAt(2));
  stream.writeUint8(type.charCodeAt(3));
}
