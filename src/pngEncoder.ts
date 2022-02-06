/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { ByteStream } from './byteStream.js';
import { encodeChunk as encodeIDAT } from './chunks/IDAT_encode.js';
import { encodeChunk as encodeIEND } from './chunks/IEND_encode.js';
import { encodeChunk as encodeIHDR } from './chunks/IHDR_encode.js';
import { getChannelsForColorType } from './colorTypes.js';
import { BitDepth, ColorType, IEncodeContext, IEncodePngOptions, IImage32, IImage64, InterlaceMethod, IPngPaletteInternal, KnownChunkTypes } from './types.js';

const allLazyChunkTypes: ReadonlyArray<string> = Object.freeze([
]);

/**
 * All lazy chunk decoders are explicitly mapped here such that bundlers are able to bundle all
 * possible chunk decoders when code splitting is not supported.
 */
function getChunkDecoder(type: KnownChunkTypes): Promise<{ encodeChunk: (
  ctx: IEncodeContext,
  image: Readonly<IImage32> | Readonly<IImage64>
) => Uint8Array; }> {
  switch (type) {
    case KnownChunkTypes.tRNS: return import(`./chunks/tRNS_encode.js`);
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

  // TODO: Don't analyze info we don't need
  const ctx = analyze(image, options);

  // TODO: Support configuring bit depth
  // TODO: Support configuring interlace method
  sections.push(encodeIHDR(ctx, image));
  if (ctx.colorType === ColorType.Indexed) {
    const result = (await import(`./chunks/PLTE_encode.js`)).encodeChunk(ctx, image);
    ctx.palette = result.palette;
    sections.push(result.chunkData);
  }
  if (ctx.useTransparencyChunk) {
    sections.push((await getChunkDecoder(KnownChunkTypes.tRNS)).encodeChunk(ctx, image));
  }
  sections.push(encodeIDAT(ctx, image));
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

function analyze(image: Readonly<IImage32> | Readonly<IImage64>, options?: IEncodePngOptions): IEncodeContext {
  const pixelCount = image.width * image.height;
  const indexCount = pixelCount * 4;
  const colorSet = new Set<number>();
  const transparentColorSet = new Set<number>();

  // Get the number of rgb colors and the number of transparent colors in the image
  let rgbaId = 0;
  for (let i = 0; i < indexCount; i += 4) {
    rgbaId = (
      image.data[i    ] << 24 |
      image.data[i + 1] << 16 |
      image.data[i + 2] <<  8 |
      image.data[i + 3]
    );
    if (image.data[i + 3] < 255) {
      transparentColorSet.add(rgbaId);
    }
    colorSet.add(rgbaId);
  }

  // Determine truecolor or indexed depending on the color count
  let colorType = options?.colorType;
  if (colorType === undefined) {
    if (colorSet.size > 256) {
      colorType = ColorType.Truecolor;
    } else {
      colorType = ColorType.Indexed;
    }
  }

  // Determine whether to use the tRNS chunk or upgrade to the "AndAlpha" color type variant if
  // needed
  let useTransparencyChunk: boolean;
  switch (colorType) {
    case ColorType.Grayscale:
    case ColorType.Truecolor:
      useTransparencyChunk = transparentColorSet.size === 1;
      if (!useTransparencyChunk && transparentColorSet.size > 1) {
        colorType = colorType === ColorType.Truecolor ? ColorType.TruecolorAndAlpha : ColorType.GrayscaleAndAlpha;
      }
      break;
    case ColorType.Indexed:
      useTransparencyChunk = transparentColorSet.size > 0;
      break;
    default:
      useTransparencyChunk = false;
  }


  return {
    colorType,
    bitDepth: image.data.BYTES_PER_ELEMENT === 2 ? 16 : 8,
    interlaceMethod: InterlaceMethod.None,
    transparentColorCount: transparentColorSet.size,
    useTransparencyChunk,
  };
}
