/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { crc32 } from './crc32.js';
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
  const result = new Uint8Array(8);
  const view = new DataView(result.buffer, result.byteOffset, result.byteLength);
  view.setUint8(0, 0x89);
  view.setUint8(1, 0x50);
  view.setUint8(2, 0x4E);
  view.setUint8(3, 0x47);
  view.setUint8(4, 0x0D);
  view.setUint8(5, 0x0A);
  view.setUint8(6, 0x1A);
  view.setUint8(7, 0x0A);
  return result;
}

function writeIHDR(
  image: Readonly<IImage32> | Readonly<IImage64>,
  bitDepth: BitDepth,
  colorType: ColorType,
  interlaceMethod: InterlaceMethod
): Uint8Array {
  const dataLength = 13;
  const { array, view } = initBuffer(ChunkPartByteLength.Length + ChunkPartByteLength.Length + dataLength + ChunkPartByteLength.CRC);
  if (image.width <= 0 || image.height <= 0) {
    throw new Error(`Invalid dimensions ${image.width}x${image.height}`);
  }

  let offset = 0;

  // Data length
  view.setUint32(offset, dataLength);
  offset += ChunkPartByteLength.Length;

  // Chunk type
  writeChunkType(view, offset, 'IHDR');
  offset += ChunkPartByteLength.Type;

  // Data
  view.setUint32(offset, image.width);
  offset += 4;
  view.setUint32(offset, image.height);
  offset += 4;
  // Bit depth
  view.setUint8(offset, 8);
  offset += 1;
  // Color type
  view.setUint8(offset, ColorType.Truecolor);
  offset += 1;
  // Compression method (only 0 is valid)
  view.setUint8(offset, 0);
  offset += 1;
  // Filter method (only 0 is valid)
  view.setUint8(offset, 0);
  offset += 1;
  // Interlace method
  view.setUint8(offset, 0);
  offset += 1;

  // CRC
  const crc = crc32(view, ChunkPartByteLength.Length, ChunkPartByteLength.Type + dataLength);
  view.setUint32(offset, crc);
  offset += 4;

  return array;
}

function initBuffer(length: number): { array: Uint8Array, view: DataView } {
  const array = new Uint8Array(length);
  const view = new DataView(array.buffer, array.byteOffset, array.byteLength);
  return { array, view };
}

function writeChunkType(view: DataView, offset: number, type: string) {
  view.setUint8(offset, type.charCodeAt(0));
  view.setUint8(offset, type.charCodeAt(1));
  view.setUint8(offset, type.charCodeAt(2));
  view.setUint8(offset, type.charCodeAt(3));
}
