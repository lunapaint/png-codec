/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import * as pako from 'pako';
import { ByteStream } from '../byteStream.js';
import { paethPredicator } from '../paeth.js';
import { ColorType, FilterType, IEncodeContext, IImage32, IImage64, InterlaceMethod } from '../types.js';
import { writeChunk } from '../write.js';

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
  // Filtering using the following approach from the spec:
  // - If the image type is Palette, or the bit depth is smaller than 8, then do not filter the
  //   image (i.e. use fixed filtering, with the filter None).
  // - (The other case) If the image type is Grayscale or RGB (with or without Alpha), and the bit
  //   depth is not smaller than 8, then use adaptive filtering as follows: independently for each
  //   row, apply all five filters and select the filter that produces the smallest sum of absolute
  //   values per row.

  // TODO: Allow specifying a filter pattern option for better testing


  // Get the channels to write based on the color type
  const channelsToWrite = getChannelsToWrite(ctx.colorType);

  let y = 0;
  let x = 0;
  let i = 0;
  switch (ctx.colorType) {
    case ColorType.Grayscale:
    case ColorType.Truecolor:
    case ColorType.GrayscaleAndAlpha:
    case ColorType.TruecolorAndAlpha: {
      for (; y < image.height; y++) {
        // Filter type
        const filterType = pickFilterType(ctx, image, y * image.width * 4);
        const dataUint8 = new Uint8Array(image.data.buffer, image.data.byteOffset, image.data.byteLength);
        const bpp = 4 * image.data.BYTES_PER_ELEMENT;
        const filterFn = buildFilterFunction(bpp, bpp * image.width, filterType);
        stream.writeUint8(filterType);

        // Data
        let byte = 0, c = 0;
        for (x = 0; x < image.width; x++) { // Pixel
          for (c of channelsToWrite) { // Channel
            for (byte = image.data.BYTES_PER_ELEMENT - 1; byte >= 0; byte--) { // Byte
              stream.writeUint8(filterFn(dataUint8, (i + c) * image.data.BYTES_PER_ELEMENT + byte, x === 0));
            }
          }
          i += 4;
        }
      }
      break;
    }
    case ColorType.Indexed: {
      if (!ctx.palette) {
        throw new Error('Cannot encode indexed file without palette');
      }
      if (image.data.BYTES_PER_ELEMENT === 2) {
        throw new Error('Cannot encode indexed file from 16-bit image');
      }
      for (; y < image.height; y++) {
        stream.writeUint8(0); // Filter type - indexed images always use no filter intentionally
        for (x = 0; x < image.width; x++) {
          stream.writeUint8(
            ctx.palette.get(
              image.data[i    ] << 24 |
              image.data[i + 1] << 16 |
              image.data[i + 2] <<  8 |
              image.data[i + 3]
            )!
          );
          i += 4;
        }
      }
      break;
    }
    default:
      throw new Error(`Color type "${ctx.colorType}" not supported yet`);
  }
}

function pickFilterType(
  ctx: IEncodeContext,
  image: Readonly<IImage32> | Readonly<IImage64>,
  lineIndex: number
): FilterType {
  // NOTE: These sums are approximate for 16 bit to avoid additional math
  // (... + 256) % 256 is used below to ensure it's positive for modulo as the numbers are encoded
  // as unsigned ints.

  // TODO: Support filtering properly for non true color
  // TODO: Use filter function here

  const filterSums: Map<FilterType, number> = new Map();
  for (const filterType of [0, 1, 2, 3, 4] as FilterType[]) {
    const bpp = 4 * image.data.BYTES_PER_ELEMENT;
    // TODO: This builds all filter funtions for evey line
    const filterFn = buildFilterFunction(bpp, bpp * image.width, filterType);

    let sum = 0;
    const channelsToWrite = getChannelsToWrite(ctx.colorType);
    const dataUint8 = new Uint8Array(image.data.buffer, image.data.byteOffset, image.data.byteLength);
    let c = 0, byte = 0;
    for (let i = lineIndex; i < lineIndex + image.width * 4; i += 4) { // Pixel in line
      for (c of channelsToWrite) { // Channel
        for (byte = image.data.BYTES_PER_ELEMENT - 1; byte >= 0; byte--) { // Byte
          sum += filterFn(dataUint8, (i + c) * image.data.BYTES_PER_ELEMENT + byte, i === lineIndex);
        }
      }
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
  return lowestFilterType;
}

type FilterFunction = (orig: Uint8Array, origX: number, isFirstInLine: boolean) => number;

function buildFilterFunction(bpp: number, bpl: number, filterType: FilterType): FilterFunction {
  let ai = 0, bi = 0, ci = 0;
  switch (filterType) {
    case FilterType.None: return (filt, filtX) => filt[filtX];
    case FilterType.Sub: return (filt, filtX, isFirstInLine) => {
      ai = isFirstInLine ? -1 : filtX - bpp;
      return (filt[filtX] - (
        ai < 0 ? 0 : filt[filtX - bpp]
      ) + 256) % 256;
    };
    case FilterType.Up: return (filt, filtX) => {
      bi = filtX - bpl;
      return (filt[filtX] - filt[bi] + 256) % 256;
    };
    case FilterType.Average: return (filt, filtX, isFirstInLine) => {
      ai = isFirstInLine ? -1 : filtX - bpp      ;
      bi =                      filtX       - bpl;
      return (
        filt[filtX] - Math.floor((
          (ai < 0 ? 0 : filt[ai]) +
          (bi < 0 ? 0 : filt[bi])
        ) / 2) + 256
      ) % 256;
    };
    case FilterType.Paeth: return (filt, filtX, isFirstInLine) => {
      ai = isFirstInLine ? -1 : filtX - bpp      ;
      bi =                      filtX       - bpl;
      ci = isFirstInLine ? -1 : filtX - bpp - bpl;
      return (
        filt[filtX] - paethPredicator(
          (ai < 0 ? 0 : filt[ai]),
          (bi < 0 ? 0 : filt[bi]),
          (ci < 0 ? 0 : filt[ci])
        ) + 256
      ) % 256;
    };
  }
}

function getChannelsToWrite(colorType: ColorType): number[] {
  switch (colorType) {
    case ColorType.Grayscale: return [0];
    case ColorType.Truecolor: return [0, 1, 2];
    case ColorType.GrayscaleAndAlpha: return [0, 3];
    case ColorType.TruecolorAndAlpha: return [0, 1, 2, 3];
  }
  return [];
}
