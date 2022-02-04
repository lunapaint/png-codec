/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { ByteStream } from '../byteStream.js';
import { crc32 } from '../crc32.js';
import { BitDepth, ChunkPartByteLength, ColorType, IImage32, IImage64, InterlaceMethod, IPngPaletteInternal } from '../types.js';
import { writeChunk, writeChunkType } from '../write.js';
import * as pako from 'pako';

export function encodeChunk(
  image: Readonly<IImage32> | Readonly<IImage64>,
  bitDepth: BitDepth,
  colorType: ColorType,
  interlaceMethod: InterlaceMethod,
  palette: Map<number, number> | undefined
): Uint8Array {
  // First generate the uncompressed data
  const dataStreamLength = calculateDataLength(image, bitDepth, colorType, interlaceMethod);
  const dataStream = new ByteStream(dataStreamLength);
  writeUncompressedData(dataStream, image, bitDepth, colorType, interlaceMethod, palette);

  // Compress the data
  const compressed = pako.deflate(dataStream.array);
  // console.log('uncompressed', dataStream.array, 'compressed', compressed);

  // Construct the final chunk
  return writeChunk('IDAT', compressed);
}

function calculateDataLength(
  image: Readonly<IImage32> | Readonly<IImage64>,
  bitDepth: BitDepth,
  colorType: ColorType,
  interlaceMethod: InterlaceMethod
): number {
  // Temporary assertions to throw for unsupported config
  if (bitDepth < 8) {
    throw new Error('Only bit depth 8 and 16 is supported currently');
  }
  if (image.data.BYTES_PER_ELEMENT === 2 && bitDepth === 8) {
    throw new Error('16 to 8 bit conversion isn\'t supported yet');
  }
  if (interlaceMethod !== InterlaceMethod.None) {
    throw new Error('Only interlace method 0 is supported currently');
  }

  let channels: number;
  switch (colorType) {
    case ColorType.Grayscale:         channels = 1; break;
    case ColorType.Truecolor:         channels = 3; break;
    case ColorType.Indexed:           channels = 1; break;
    case ColorType.GrayscaleAndAlpha: channels = 2; break;
    case ColorType.TruecolorAndAlpha: channels = 4; break;
  }
  const bytesPerChannel = bitDepth === 16 ? 2 : 1;
  const bytesPerPixel = channels * bytesPerChannel;
  const bytesPerLine = /*Filter type*/1 + bytesPerPixel * image.width;

  const bytesAllLines = bytesPerLine * image.height;

  return bytesAllLines;
}

function writeUncompressedData(
  stream: ByteStream,
  image: Readonly<IImage32> | Readonly<IImage64>,
  bitDepth: BitDepth,
  colorType: ColorType,
  interlaceMethod: InterlaceMethod,
  palette: Map<number, number> | undefined
) {
  let y = 0;
  let x = 0;
  let i = 0;
  switch (colorType) {
    case ColorType.Grayscale: {
      for (; y < image.height; y++) {
        // Filter type
        stream.writeUint8(0);

        // Data
        for (x = 0; x < image.width; x++) {
          // Only use the red channel for grayscale
          if (bitDepth === 16) {
            stream.writeUint16(image.data[i++]);
            i += 3;
          } else {
            stream.writeUint8(image.data[i++]);
            i += 3;
          }
        }
      }
      break;
    }
    case ColorType.Truecolor: {
      for (; y < image.height; y++) {
        // Filter type
        stream.writeUint8(0);

        // Data
        for (x = 0; x < image.width; x++) {
          if (bitDepth === 16) {
            stream.writeUint16(image.data[i++]);
            stream.writeUint16(image.data[i++]);
            stream.writeUint16(image.data[i++]);
            i++;
          } else {
            stream.writeUint8(image.data[i++]);
            stream.writeUint8(image.data[i++]);
            stream.writeUint8(image.data[i++]);
            i++;
          }
        }
      }
      break;
    }
    case ColorType.Indexed: {
      if (!palette) {
        throw new Error('Cannot encode indexed file without palette');
      }
      for (; y < image.height; y++) {
        // Filter type
        stream.writeUint8(0);

        // Data
        for (x = 0; x < image.width; x++) {
          // if (bitDepth === 16) {
          //   stream.writeUint16(image.data[i++]);
          //   stream.writeUint16(image.data[i++]);
          //   stream.writeUint16(image.data[i++]);
          //   i++;
          // } else {
            stream.writeUint8(
              palette.get(
                image.data[i    ] << 16 |
                image.data[i + 1] <<  8 |
                image.data[i + 2]
              )!
            );
            i += 4;
          // }
        }
      }
      break;
    }
    case ColorType.GrayscaleAndAlpha: {
      for (; y < image.height; y++) {
        // Filter type
        stream.writeUint8(0);

        // Data
        for (x = 0; x < image.width; x++) {
          // Only use the red channel for grayscale
          if (bitDepth === 16) {
            stream.writeUint16(image.data[i++]);
            i += 2;
            stream.writeUint16(image.data[i++]);
          } else {
            stream.writeUint8(image.data[i++]);
            i += 2;
            stream.writeUint8(image.data[i++]);
          }
        }
      }
      break;
    }
    case ColorType.TruecolorAndAlpha: {
      for (; y < image.height; y++) {
        // Filter type
        stream.writeUint8(0);

        // Data
        for (x = 0; x < image.width; x++) {
          if (bitDepth === 16) {
            stream.writeUint16(image.data[i++]);
            stream.writeUint16(image.data[i++]);
            stream.writeUint16(image.data[i++]);
            stream.writeUint16(image.data[i++]);
          } else {
            stream.writeUint8(image.data[i++]);
            stream.writeUint8(image.data[i++]);
            stream.writeUint8(image.data[i++]);
            stream.writeUint8(image.data[i++]);
          }
        }
      }
      break;
    }
    default:
      throw new Error(`Color type "${colorType}" not supported yet`);
  }
}
