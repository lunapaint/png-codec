/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { ByteStream } from '../byteStream.js';
import { crc32 } from '../crc32.js';
import { BitDepth, ChunkPartByteLength, ColorType, FilterType, IEncodeContext, IImage32, IImage64, InterlaceMethod, IPngPaletteInternal } from '../types.js';
import { writeChunk, writeChunkType } from '../write.js';
import * as pako from 'pako';

export function encodeChunk(
  ctx: IEncodeContext,
  image: Readonly<IImage32> | Readonly<IImage64>
): Uint8Array {
  // First generate the uncompressed data
  const dataStreamLength = calculateDataLength(ctx, image);
  const stream = new ByteStream(dataStreamLength);
  writeUncompressedData(ctx, image, stream);

  // Compress the data
  const compressed = pako.deflate(stream.array);
  // console.log('uncompressed', dataStream.array, 'compressed', compressed);

  // Construct the final IDAT chunk
  const chunkIDAT = writeChunk('IDAT', compressed);

  return chunkIDAT;
}

function calculateDataLength(
  ctx: IEncodeContext,
  image: Readonly<IImage32> | Readonly<IImage64>
): number {
  // Temporary assertions to throw for unsupported config
  if (ctx.bitDepth < 8) {
    throw new Error('Only bit depth 8 and 16 is supported currently');
  }
  if (image.data.BYTES_PER_ELEMENT === 2 && ctx.bitDepth === 8) {
    throw new Error('16 to 8 bit conversion isn\'t supported yet');
  }
  if (ctx.interlaceMethod !== InterlaceMethod.None) {
    throw new Error('Only interlace method 0 is supported currently');
  }

  let channels: number;
  switch (ctx.colorType) {
    case ColorType.Grayscale:         channels = 1; break;
    case ColorType.Truecolor:         channels = 3; break;
    case ColorType.Indexed:           channels = 1; break;
    case ColorType.GrayscaleAndAlpha: channels = 2; break;
    case ColorType.TruecolorAndAlpha: channels = 4; break;
  }
  const bytesPerChannel = ctx.bitDepth === 16 ? 2 : 1;
  const bytesPerPixel = channels * bytesPerChannel;
  const bytesPerLine = /*Filter type*/1 + bytesPerPixel * image.width;

  const bytesAllLines = bytesPerLine * image.height;

  return bytesAllLines;
}

function writeUncompressedData(
  ctx: IEncodeContext,
  image: Readonly<IImage32> | Readonly<IImage64>,
  stream: ByteStream
) {
  // TODO: Support filtering:
  // - If the image type is Palette, or the bit depth is smaller than 8, then do not filter the image (i.e. use fixed filtering, with the filter None).
  // - (The other case) If the image type is Grayscale or RGB (with or without Alpha), and the bit depth is not smaller than 8, then use adaptive filtering as follows: independently for each row, apply all five filters and select the filter that produces the smallest sum of absolute values per row.

  // TODO: Allow specifying a filter pattern option for better testing

  let y = 0;
  let x = 0;
  let i = 0;
  switch (ctx.colorType) {
    case ColorType.Grayscale: {
      for (; y < image.height; y++) {
        // Filter type
        stream.writeUint8(0);

        // Data
        for (x = 0; x < image.width; x++) {
          // Only use the red channel for grayscale
          if (ctx.bitDepth === 16) {
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
        const filterType = pickFilterType(image, y * image.width * 4);
        // Filter type
        stream.writeUint8(filterType);

        // Data
        switch (filterType) {
          case FilterType.None:
            for (x = 0; x < image.width; x++) {
              if (ctx.bitDepth === 16) {
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
            break;
          case FilterType.Sub:
            if (ctx.bitDepth === 16) {
              throw new Error('Sub not supported yet for 16 bit');
              // stream.writeUint16(image.data[i++]);
              // stream.writeUint16(image.data[i++]);
              // stream.writeUint16(image.data[i++]);
              // i++;
            } else {
              stream.writeUint8(image.data[i++]);
              stream.writeUint8(image.data[i++]);
              stream.writeUint8(image.data[i++]);
              i++;
            }
            for (x = 1; x < image.width; x++) {
              // if (ctx.bitDepth === 16) {
              //   stream.writeUint16((image.data[i++] - stream.view.getUint16(stream.offset - 6)) % 256);
              //   stream.writeUint16((image.data[i++] - stream.view.getUint16(stream.offset - 4)) % 256);
              //   stream.writeUint16((image.data[i++] - stream.view.getUint16(stream.offset - 2)) % 256);
              //   i++;
              // } else {
              stream.writeUint8((image.data[i    ] - image.data[i     - 4] + 256) % 256);
              stream.writeUint8((image.data[i + 1] - image.data[i + 1 - 4] + 256) % 256);
              stream.writeUint8((image.data[i + 2] - image.data[i + 2 - 4] + 256) % 256);
              i += 4;
              // }
            }
            break;
          case FilterType.Up:
            if (y === 0) {
              throw new Error('Cannot encode with filter type Up on first line');
            }
            for (x = 0; x < image.width; x++) {
              if (ctx.bitDepth === 16) {
                throw new Error('Sub not supported yet for 16 bit');
                // stream.writeUint16((image.data[i++] - stream.view.getUint16(stream.offset - 6)) % 256);
                // stream.writeUint16((image.data[i++] - stream.view.getUint16(stream.offset - 4)) % 256);
                // stream.writeUint16((image.data[i++] - stream.view.getUint16(stream.offset - 2)) % 256);
                // i++;
              } else {
                stream.writeUint8((image.data[i    ] - image.data[i     - image.width * 4] + 256) % 256);
                stream.writeUint8((image.data[i + 1] - image.data[i + 1 - image.width * 4] + 256) % 256);
                stream.writeUint8((image.data[i + 2] - image.data[i + 2 - image.width * 4] + 256) % 256);
                i += 4;
              }
            }
            break;
          case FilterType.Average:
            for (x = 0; x < image.width; x++) {
              // Add 256 to ensure it's positive for modulo
              stream.writeUint8((image.data[i    ] - Math.floor((
                (x === 0 ? 0 : image.data[i     - 4]) +
                (y === 0 ? 0 : image.data[i     - image.width * 4])
              ) / 2) + 256) % 256);
              stream.writeUint8((image.data[i + 1] - Math.floor((
                (x === 0 ? 0 : image.data[i + 1 - 4]) +
                (y === 0 ? 0 : image.data[i + 1 - image.width * 4])
              ) / 2) + 256) % 256);
              stream.writeUint8((image.data[i + 2] - Math.floor((
                (x === 0 ? 0 : image.data[i + 2 - 4]) +
                (y === 0 ? 0 : image.data[i + 2 - image.width * 4])
              ) / 2) + 256) % 256);
              i += 4;
            }
            break;
          default:
            throw new Error('Only none and sub filter types are supported');
        }
      }
      break;
    }
    case ColorType.Indexed: {
      if (!ctx.palette) {
        throw new Error('Cannot encode indexed file without palette');
      }
      for (; y < image.height; y++) {
        // Filter type - indexed images always use no filter intentionally
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
              ctx.palette.get(
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
          if (ctx.bitDepth === 16) {
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
          if (ctx.bitDepth === 16) {
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
      throw new Error(`Color type "${ctx.colorType}" not supported yet`);
  }
}

function pickFilterType(
  image: Readonly<IImage32> | Readonly<IImage64>,
  lineIndex: number
): FilterType {
  if (image.data.BYTES_PER_ELEMENT === 2) {
    console.warn('16 bit images can\'t select filters yet');
    return FilterType.None;
  }
  const filterSums: Map<FilterType, number> = new Map();
  for (const filterType of [0, 1, 2, 3, 4] as FilterType[]) {
    let sum = 0;
    switch (filterType) {
      case FilterType.None: {
        for (let i = lineIndex; i < lineIndex + image.width * 4; i += 4) {
          // TODO: This is for truecolor, handle other color types
          sum += (
            image.data[i    ] +
            image.data[i + 1] +
            image.data[i + 2]
          );
        }
        break;
      }
      case FilterType.Sub: {
        // TODO: This is only for truecolor, handle other color types
        // First pixel in line is a special case
        sum += (
          image.data[lineIndex    ] +
          image.data[lineIndex + 1] +
          image.data[lineIndex + 2]
        );
        for (let i = lineIndex + 4; i < lineIndex + image.width * 4; i += 4) {
          sum += (
            (image.data[i    ] - image.data[i     - 4] + 256) % 256 +
            (image.data[i + 1] - image.data[i + 1 - 4] + 256) % 256 +
            (image.data[i + 2] - image.data[i + 2 - 4] + 256) % 256
          );
        }
        break;
      }
      case FilterType.Up: {
        // The first line should not use up as it's essentially just None
        if (lineIndex === 0) {
          sum = Infinity;
        } else {
          for (let i = lineIndex; i < lineIndex + image.width * 4; i += 4) {
            // Add 256 to ensure it's positive for modulo
            sum += (
              ((image.data[i    ] - image.data[i     - image.width * 4] + 256) % 256) +
              ((image.data[i + 1] - image.data[i + 1 - image.width * 4] + 256) % 256) +
              ((image.data[i + 2] - image.data[i + 2 - image.width * 4] + 256) % 256)
            );
          }
        }
        break;
      }
      case FilterType.Average: {
        for (let i = lineIndex; i < lineIndex + image.width * 4; i += 4) {
          // Add 256 to ensure it's positive for modulo
          sum += (
            ((image.data[i    ] - Math.floor((
              (i === lineIndex ? 0 : image.data[i     - 4]) +
              (i < image.width * 4 ? 0 : image.data[i     - image.width * 4])
            ) / 2) + 256) % 256) +
            ((image.data[i + 1] - Math.floor((
              (i === lineIndex ? 0 : image.data[i + 1 - 4]) +
              (i < image.width * 4 ? 0 : image.data[i + 1 - image.width * 4])
            ) / 2) + 256) % 256) +
            ((image.data[i + 2] - Math.floor((
              (i === lineIndex ? 0 : image.data[i + 2 - 4]) +
              (i < image.width * 4 ? 0 : image.data[i + 2 - image.width * 4])
            ) / 2) + 256) % 256)
          );
        }
        break;
      }
      default:
        sum = Infinity;
    }
    filterSums.set(filterType, sum);
  }
  let lowestFilterType: FilterType = FilterType.None;
  let lowestSum = filterSums.get(FilterType.None)!;
  for (const filterType of [1, 2, 3, 4] as FilterType[]) {
    if (filterSums.get(filterType)! < lowestSum) {
      lowestFilterType = filterType;
      lowestSum = filterSums.get(filterType)!;
    }
  }
  console.log('filter sums', Array.from(filterSums.values()));
  console.log('lowest filter type', lowestFilterType);
  return lowestFilterType;
}
