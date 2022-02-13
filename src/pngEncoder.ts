/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { IEncodedPng } from '../typings/api.js';
import { DecodeWarning } from './assert.js';
import { ByteStream } from './byteStream.js';
import { encodeChunk as encodeIDAT } from './chunks/IDAT_encode.js';
import { encodeChunk as encodeIEND } from './chunks/IEND_encode.js';
import { encodeChunk as encodeIHDR } from './chunks/IHDR_encode.js';
import { handleWarning } from './encode/assert.js';
import { EncodeError, EncodeWarning } from './png.js';
import { ColorType, IEncodeContext, IEncodePngOptions, IImage32, IImage64, InterlaceMethod, KnownChunkTypes } from './types.js';

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
    /* istanbul ignore next - this error should never happen in practice */
    default:
      // Throw a regular error as this is unexpected
      throw new Error(`Could not get encoder for chunk type "${type}"`);
  }
}

export async function encodePng(image: Readonly<IImage32> | Readonly<IImage64>, options: IEncodePngOptions = {}): Promise<IEncodedPng> {
  if (image.data.length !== image.width * image.height * 4) {
    throw new EncodeError(`Provided image data length (${image.data.length}) is not expected length (${image.width * image.height * 4})`, Math.min(image.data.length, image.width * image.height * 4) - 1);
  }

  // Create all file sections
  const sections: Uint8Array[] = [];
  sections.push(writePngSignature());

  const ctx = analyze(image, options);

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
  // tEXt chunks
  if (options?.ancillaryChunks === undefined) {
    sections.push((await import(`./chunks/tEXt_encode.js`)).encodeChunk(ctx, image, 'Software', '@lunapaint/png-codec'));
  } else {
    for (const chunk of options.ancillaryChunks) {
      switch (chunk.type) {
        case KnownChunkTypes.tEXt:
          sections.push((await import(`./chunks/tEXt_encode.js`)).encodeChunk(ctx, image, chunk.keyword, chunk.text));
          break;
        default:
          throw new Error(`Cannot encode chunk type "${chunk.type}"`);
      }
    }
  }
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

  return {
    data: result,
    warnings: ctx.warnings,
    info: ctx.info
  };
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

function analyze(image: Readonly<IImage32> | Readonly<IImage64>, options: IEncodePngOptions = {}): IEncodeContext {
  const warnings: DecodeWarning[] = [];
  const info: string[] = [];

  const pixelCount = image.width * image.height;
  const indexCount = pixelCount * 4;
  const colorSet = new Set<number>();
  const transparentColorSet = new Set<number>();

  // Get the number of rgb colors and the number of transparent colors in the image
  let rgbaId = 0;
  if (image.data.BYTES_PER_ELEMENT === 2) {
    for (let i = 0; i < indexCount; i += 4) {
      rgbaId = (
        image.data[i    ] << 48 |
        image.data[i + 1] << 32 |
        image.data[i + 2] << 16 |
        image.data[i + 3]
      );
      if (image.data[i + 3] < 65535) {
        transparentColorSet.add(rgbaId);
      }
      colorSet.add(rgbaId);
    }
  } else {
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
  }

  // Determine truecolor or indexed depending on the color count
  let colorType = options.colorType;
  if (colorType === undefined) {
    // Use indexed when there are the correct amount of colors only on 8 bit images
    if (colorSet.size > 256 || image.data.BYTES_PER_ELEMENT === 2) {
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
        if (options.colorType === ColorType.Truecolor) {
          handleWarning({ options, warnings }, new EncodeWarning(`Cannot encode image as color type Truecolor as it contains ${transparentColorSet.size} transparent colors`, 0));
        }
      }
      break;
    case ColorType.Indexed:
      useTransparencyChunk = transparentColorSet.size > 0;
      break;
    default:
      useTransparencyChunk = false;
  }

  if (options.colorType === undefined) {
    info.push(`Using color type ${colorType}`);
  }

  return {
    colorType,
    bitDepth: image.data.BYTES_PER_ELEMENT === 2 ? 16 : 8,
    interlaceMethod: InterlaceMethod.None,
    colorSet,
    transparentColorCount: transparentColorSet.size,
    firstTransparentColor: transparentColorSet.size > 0 ? transparentColorSet.values().next().value : undefined,
    useTransparencyChunk,
    options,
    warnings,
    info
  };
}
