/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { ByteStream } from './byteStream.js';
import { encodeChunk as encodeIDAT } from './chunks/IDAT_encode.js';
import { encodeChunk as encodeIEND } from './chunks/IEND_encode.js';
import { encodeChunk as encodeIHDR } from './chunks/IHDR_encode.js';
import { BitDepth, ColorType, IEncodePngOptions, IImage32, IImage64, InterlaceMethod, KnownChunkTypes } from './types.js';


const allLazyChunkTypes: ReadonlyArray<string> = Object.freeze([
  KnownChunkTypes.PLTE
]);

/**
 * All lazy chunk decoders are explicitly mapped here such that bundlers are able to bundle all
 * possible chunk decoders when code splitting is not supported.
 */
function getChunkDecoder(type: KnownChunkTypes): Promise<{ encodeChunk: (
  image: Readonly<IImage32> | Readonly<IImage64>,
  bitDepth: BitDepth,
  colorType: ColorType,
  interlaceMethod: InterlaceMethod
) => Uint8Array; }> {
  switch (type) {
    case KnownChunkTypes.PLTE: return import(`./chunks/PLTE_encode.js`);
    // This is an exception that should never happen in practice, it's only here for a nice error
    // message if it does.
    /* istanbul ignore next */
    default:
      // Throw a regular error as this is unexpected
      throw new Error(`Could not get encoder for chunk type "${type}"`);
  }
}

export async function encodePng(image: Readonly<IImage32> | Readonly<IImage64>, options: IEncodePngOptions = {}): Promise<Uint8Array> {
  // Create all file sections
  const sections: Uint8Array[] = [];
  sections.push(writePngSignature());

  // TODO: Scan image and detect best color type to use
  if (options.colorType === undefined) {
    options.colorType = ColorType.Truecolor;
  }
  if (options.bitDepth === undefined) {
    options.bitDepth = 8;
  }

  // TODO: Support configuring bit depth
  // TODO: Support configuring interlace method
  sections.push(encodeIHDR(image, options.bitDepth, options.colorType, InterlaceMethod.None));
  if (options.colorType === ColorType.Indexed) {
    sections.push((await getChunkDecoder(KnownChunkTypes.PLTE)).encodeChunk(image, options.bitDepth, options.colorType, InterlaceMethod.None));
  }
  sections.push(encodeIDAT(image, options.bitDepth, options.colorType, InterlaceMethod.None));
  sections.push(encodeIEND());
  // console.log('sections', sections);

  // Merge sections into a single typed array
  const totalLength = sections.reduce((p, c) => p + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const s of sections) {
    result.set(s, offset);
    offset += s.length;
  }
  // console.log('result', result);

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
