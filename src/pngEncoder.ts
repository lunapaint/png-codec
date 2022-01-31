/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { ByteStream } from './byteStream.js';
import { encodeChunk as encodeIEND } from './chunks/IEND_encode.js';
import { encodeChunk as encodeIHDR } from './chunks/IHDR_encode.js';
import { ColorType, IEncodePngOptions, IImage32, IImage64, InterlaceMethod } from './types.js';

export async function encodePng(image: Readonly<IImage32> | Readonly<IImage64>, options?: IEncodePngOptions): Promise<Uint8Array> {
  // Create all file sections
  const sections: Uint8Array[] = [];
  sections.push(writePngSignature());

  // TODO: Support configuring bit depth
  // TODO: Support configuring color type
  // TODO: Support configuring interlace method
  sections.push(encodeIHDR(image, 8, ColorType.Truecolor, InterlaceMethod.None));
  sections.push(encodeIDAT(image, 8, ColorType.Truecolor, InterlaceMethod.None));
  sections.push(encodeIEND());
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
