/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import * as pako from 'pako';
import { createChunkDecodeError, DecodeError } from '../assert.js';
import { paethPredicator } from '../../shared/paeth.js';
import { ChunkPartByteLength, ColorType, FilterType, IDecodeContext, InterlaceMethod, IPngChunk, IPngHeaderDetails, IPngMetadataTransparency, IPngPaletteInternal } from '../../shared/types.js';

/**
 * `IDAT` Image Data
 *
 * Spec: https://www.w3.org/TR/PNG/#11IDAT
 *
 * The `IDAT` chunk is the primary source of image data in a png. Each line is filtered using
 * various filter types, optionally interlaced via Adam7 interlacing and then compressed using the
 * deflate algorithm. Note that a single image may contain multiple IDAT chunks, if they do they
 * must appear consecutively.
 */
export function parseChunk(ctx: IDecodeContext, header: IPngHeaderDetails, chunks: IPngChunk[]): Uint8Array | Uint16Array {
  // Decompress the chunk data.
  const decompressed = decompress(ctx, chunks);

  // Remove the filter, leaving the packed format. For example an 8-bit grayscale and alpha
  // filter would give an array where each pixel is represented by 2 bytes; grayscale (0-255) and
  // alpha (0-255). This is done for each deinterlace pass if the image is interlaced.
  let packed: Uint8Array;
  if (header.interlaceMethod === InterlaceMethod.Adam7) {
    packed = deinterlaceAdam7(ctx, header, decompressed);
  } else {
    packed = defilter(ctx, header, decompressed);
  }

  // Apply the tRNS chunk if needed
  const trnsChunk = ctx.metadata.find(e => e.type === 'tRNS') as IPngMetadataTransparency | undefined;

  // Map the packed buffer into a new 8-bit rgba buffer. This applies alpha for indexed color type
  // as well.
  const result = mapPackedDataToRgba(ctx, header, packed, ctx.palette, trnsChunk);

  // Apply the tRNS if it still needed
  if (trnsChunk && (header.colorType === ColorType.Grayscale || header.colorType === ColorType.Truecolor)) {
      applyTransparency(header, result, trnsChunk);
  }

  return result;
}

/**
 * Decompresses the chunk's data using the inflate algorithm.
 */
function decompress(ctx: IDecodeContext, chunks: IPngChunk[]): Uint8Array {
  const inflator = new pako.Inflate();
  let offset = 0;
  for (const chunk of chunks) {
    offset = chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type;
    inflator.push(ctx.view.buffer.slice(ctx.view.byteOffset + offset, ctx.view.byteOffset + offset + chunk.dataLength));
  }
  if (inflator.err) {
    throw createChunkDecodeError(ctx, chunks[0], `Inflate error: ${inflator.msg}`, chunks[0].offset);
  }
  if (inflator.result === undefined) {
    throw new DecodeError(ctx, 'IDAT: Failed to decompress data chunks', 0);
  }
  return inflator.result as Uint8Array;
}

/**
 * Defilters the decompressed data, returning a packed format (not RGBA image format).
 */
function defilter(
  ctx: IDecodeContext,
  header: IPngHeaderDetails,
  decompressed: Uint8Array,
  start: number = 0,
  width: number = header.width,
  height: number = header.height
): Uint8Array {
  let i = 0;
  const bpp = getBytesPerPixel(header);
  const bppFloat = getBytesPerPixelFloat(header);
  const bpl = getBytesPerLine(header, width);
  const bplCeiled = Math.ceil(width * bppFloat);

  // Ceil result of width * bppFloat such that line data does not overlap. For example, a 4x4 1 bit
  // image which only needs 2 bytes of data to encode, we will use 4 bytes instead so that reading a
  // line always starts on the next bit
  const result = new Uint8Array(height * bplCeiled);

  const filterFnCache: Map<number, DefilterFunction> = new Map();

  for (let y = 0; y < height; y++) {
    let lineOffset = start + y * (bpl + 1/*Filter type for each line*/);

    // Get and validate filter type
    const filterType = decompressed[lineOffset++];
    if (!isValidFilterType) {
      throw new DecodeError(ctx, `IDAT: Invalid filter type ${filterType}`, 0);
    }

    // Get the filter function for this line, caching it for later lines
    let filterFn = filterFnCache.get(filterType);
    if (!filterFn) {
      filterFn = buildDefilterFunction(bppFloat, bpl, width, filterType);
      filterFnCache.set(filterType, filterFn);
    }

    // Handle special cases for first pixel in line
    let pixel = 1;
    let x = 0;
    switch (filterType) {
      case FilterType.None:
      case FilterType.Sub:{
        for (; x < bpp; x++) {
          result[i] = decompressed[lineOffset + x];
          i++;
        }
        break;
      }
      case FilterType.Average: {
        let bi = 0;
        for (; x < bpp; x++) {
          bi = i - width * bpp;
          result[i] = decompressed[lineOffset + x] + Math.floor(
            0 +
            (bi < 0 ? 0 : result[bi])
          ) / 2;
          i++;
        }
        break;
      }
      case FilterType.Up: {
        // The filter function starts at pixel index 0 for these filters
        pixel = 0;
        break;
      }
      case FilterType.Paeth: {
        for (; x < bpp; x++) {
          const bi = Math.floor(i - bpl);
          result[i] = (decompressed[lineOffset + x] + paethPredicator(
              0,
              (bi < 0 ? 0 : result[bi]),
              0
            )
          ) % 256;
          i++;
        }
        break;
      }
    }


    // console.log(`line ${y}, filter ${filterType}`);


    // Other pixels in line
    if (header.bitDepth >= 8) {
      for (; pixel < width; pixel++) {
        for (let x = 0; x < bpp; x++) {
          result[i] = filterFn(decompressed, lineOffset + pixel * bpp + x, result, i);
          i++;
        }
      }
    } else {
      // Remove i offset if set for first pixel to simplify below
      if (pixel) {
        i -= pixel;
      }
      for (x = pixel; x < bpl; x++) {
        result[i + x] = filterFn(decompressed, lineOffset + x, result, i + x);
      }
      i += bpl;
    }
  }

  return result;
}

function isValidFilterType(filterType: number): filterType is FilterType {
  return filterType % 1 === 0 && filterType >= 0 && filterType <= 4;
}

type DefilterFunction = (filt: Uint8Array | Uint16Array, filtX: number, recon: Uint8Array | Uint16Array, reconX: number) => number;

function buildDefilterFunction(bpp: number, bpl: number, width: number, filterType: FilterType): DefilterFunction {
  // This function is not called for the first pixel in a line so ai/ci should always be valid
  let ai = 0, bi = 0, ci = 0;
  switch (filterType) {
    case FilterType.None: return (filt, filtX) => filt[filtX];
    case FilterType.Sub: return (filt, filtX, recon, reconX) => (filt[filtX] + recon[Math.floor(reconX - bpp)]) % 256;
    case FilterType.Up: return (filt, filtX, recon, reconX) => {
      bi = Math.floor(reconX - width * bpp);
      return bi < 0 ? filt[filtX] : ((filt[filtX] + recon[bi]) % 256);
    };
    case FilterType.Average: return (filt, filtX, recon, reconX) => {
      ai = Math.floor(reconX - bpp);
      bi = Math.floor(reconX - width * bpp);
      return filt[filtX] + Math.floor(
        (ai < 0 ? 0 : recon[ai]) +
        (bi < 0 ? 0 : recon[bi])
      ) / 2;
    };
    case FilterType.Paeth: return (filt, filtX, recon, reconX) => {
      ai = Math.floor(reconX - Math.ceil(bpp));
      bi = Math.floor(reconX - bpl);
      ci = Math.floor(reconX - bpl - Math.ceil(bpp));
      return (
        filt[filtX] + paethPredicator(
          (ai < 0 ? 0 : recon[ai]),
          (bi < 0 ? 0 : recon[bi]),
          (ci < 0 ? 0 : recon[ci])
        )
      ) % 256;
    };
  }
}

function getBytesPerPixel(header: IPngHeaderDetails): number {
  return Math.ceil(getBytesPerPixelFloat(header));
}

function getBytesPerPixelFloat(header: IPngHeaderDetails): number {
  return getChannelCount(header.colorType) * header.bitDepth / 8;
}

function getBytesPerLine(header: IPngHeaderDetails, width: number): number {
  return Math.ceil(getChannelCount(header.colorType) * header.bitDepth * width / 8);
}

function getChannelCount(colorType: ColorType): number {
  switch (colorType) {
    case ColorType.Grayscale: return 1;
    case ColorType.Truecolor: return 3;
    case ColorType.Indexed: return 1;
    case ColorType.GrayscaleAndAlpha: return 2;
    case ColorType.TruecolorAndAlpha: return 4;
  }
}

function deinterlaceAdam7(ctx: IDecodeContext, header: IPngHeaderDetails, decompressed: Uint8Array): Uint8Array {
  const bppFloat = getBytesPerPixelFloat(header);
  // Each line of data is guaranteed to start on a new byte
  const bplCeiled = Math.ceil(header.width * bppFloat);
  const result = new Uint8Array(bplCeiled * header.height);
  const bpp = getBytesPerPixel(header);
  const pixelsPerByte = 8 / header.bitDepth;
  const maxValue = (1 << header.bitDepth) - 1;

  // Adam7 interlacing splits the image into 7 smaller image, each of which contain pixels in the
  // repeating 8x8 pattern below:
  //
  //   1 6 4 6 2 6 4 6
  //   7 7 7 7 7 7 7 7
  //   5 6 5 6 5 6 5 6
  //   7 7 7 7 7 7 7 7
  //   3 6 4 6 3 6 4 6
  //   7 7 7 7 7 7 7 7
  //   5 6 5 6 5 6 5 6
  //   7 7 7 7 7 7 7 7
  //
  // For example, a 256x256 interlaced image passes would be treated as seven smaller images with
  // dimensions 32x32, 32x32, 64x32, 64x64, 128x64, 128x128, and 256x128, respectively. Notice how
  // the first 32x32 refers to pass 1 above which only contain a single point, whereas the 64x32
  // refers to pass 3 which contains two points. Each of these passes with differing sized images
  // needs to be defiltered separately which is why these sizes need to be calculated ahead of time.
  //
  // The below arrays (size 7 = 7 passes) encode the above pattern, allowing the correct image size
  // to be determined for each pass. For example, for pass 1:
  //
  //   xStart[0] = 0 ↘
  //   yStart[0] = 0 → Start the pattern at pixel (0,0).
  //   xGap[0]   = 8 ↘
  //   yGap[0]   = 8 → Repeat the pattern every 8x8 pixels.
  //
  const xStart = [0, 4, 0, 2, 0, 1, 0];
  const yStart = [0, 0, 4, 0, 2, 0, 1];
  const xGap   = [8, 8, 4, 4, 2, 2, 1];
  const yGap   = [8, 8, 8, 4, 4, 2, 2];

  let dataPointer = 0;
  for (let pass = 0; pass < 7; pass++) {
    const passXStart = xStart[pass];
    const passYStart = yStart[pass];
    const passXGap = xGap[pass];
    const passYGap = yGap[pass];
    const passWidth = Math.ceil((header.width - passXStart) / passXGap);
    const passHeight = Math.ceil((header.height - passYStart) / passYGap);
    const passBplCeiled = Math.ceil(bppFloat * passWidth);

    // Skip pass if it has no content
    if (passWidth === 0 || passHeight === 0) {
      continue;
    }

    // Defilter this pass' sub-image
    const passPacked = defilter(ctx, header, decompressed, dataPointer, passWidth, passHeight);

    // Fill in result using the defiltered sub-image
    let i = 0;
    for (let y = 0; y < passHeight; y++) {
      i = (passYStart + y * passYGap) * bplCeiled + passXStart * bppFloat;
      for (let x = 0; x < passWidth; x++) {
        if (header.bitDepth < 8) {
          // Get the packed value, including multiple pixels
          let value = passPacked[y * passBplCeiled + Math.floor(x * bppFloat)];
          // Shift bits being considered to RHS
          value >>= ((pixelsPerByte - (x % pixelsPerByte)) - 1) * header.bitDepth;
          // Mask out irrelevant bits
          value &= maxValue;
          // Shift bits back to correct position they will appear in the result array
          const resultPosition = ((pixelsPerByte - 1) - ((i % 1)) * pixelsPerByte) * header.bitDepth;
          value <<= resultPosition;
          // Apply the bits to the result array
          result[Math.floor(i)] |= value;
        } else {
          for (let j = 0; j < bpp; j++) {
            result[i + j] = passPacked[(y * passWidth + x) * bpp + j];
          }
        }
        i += passXGap * bppFloat;
      }
    }

    dataPointer += passHeight * (1/*filter type*/ + getBytesPerLine(header, passWidth));
  }
  return result;
}

function mapPackedDataToRgba(ctx: IDecodeContext, header: IPngHeaderDetails, packed: Uint8Array, palette: IPngPaletteInternal | undefined, trnsChunk: IPngMetadataTransparency | undefined) {
  const result = new (header.bitDepth === 16 ? Uint16Array : Uint8Array)(header.width * header.height * 4);
  let i = 0;
  const bpp = getBytesPerPixel(header);
  const bppFloat = getBytesPerPixelFloat(header);
  // Each line of data is guaranteed to start on a new byte
  const bplCeiled = Math.ceil(header.width * bppFloat);

  switch (header.colorType) {

    case ColorType.Grayscale: {
      switch (header.bitDepth) {
        case 1:
        case 2:
        case 4: {
          const pixelsPerByte = 8 / header.bitDepth;
          const maxValue = (1 << header.bitDepth) - 1;
          const bytesPerPixel = header.bitDepth / 8;
          for (let y = 0; y < header.height; y++) {
            for (let x = 0; x < header.width; x++) {
              i = (y * header.width + x) * 4;
              result[i    ] = packed[y * bplCeiled + Math.floor(x * bytesPerPixel)];
              // Shift bits being considered to RHS
              result[i    ] >>= ((pixelsPerByte - (x % pixelsPerByte)) - 1) * header.bitDepth;
              // Mask out irrelevant bits
              result[i    ] &= maxValue;
              // Multiple to range 0-255
              result[i    ] *= 255 / maxValue;
              result[i + 1] = result[i];
              result[i + 2] = result[i];
              result[i + 3] = 255;
            }
          }
          break;
        }
        case 8:
        case 16: {
          for (let y = 0; y < header.height; y++) {
            for (let x = 0; x < header.width; x++) {
              i = (y * header.width + x) * 4;
              if (header.bitDepth === 16) {
                result[i    ] = (packed[(y * header.width + x) * bpp] << 8) | (packed[(y * header.width + x) * bpp + 1]);
              } else {
                result[i    ] = packed[(y * header.width + x) * bpp];
              }
              result[i + 1] = result[i];
              result[i + 2] = result[i];
              result[i + 3] = header.bitDepth === 16 ? 65535 : 255;
            }
          }
          break;
        }
      }
      break;
    }

    case ColorType.GrayscaleAndAlpha: {
      // Note this color type is not valid with bit depth < 8
      for (let y = 0; y < header.height; y++) {
        for (let x = 0; x < header.width; x++) {
          i = (y * header.width + x) * 4;
          if (header.bitDepth === 16) {
            result[i    ] = (packed[(y * header.width + x) * bpp] << 8) | (packed[(y * header.width + x) * bpp + 1]);
          } else {
            result[i    ] = packed[(y * header.width + x) * bpp];
          }
          result[i + 1] = result[i];
          result[i + 2] = result[i];
          if (header.bitDepth === 16) {
            result[i + 3] = (packed[(y * header.width + x) * bpp + 2] << 8) | (packed[(y * header.width + x) * bpp + 3]);
          } else {
            result[i + 3] = packed[(y * header.width + x) * bpp + 1];
          }
        }
      }
      break;
    }

    case ColorType.Indexed: {
      if (!palette) {
        throw new DecodeError(ctx, 'IDAT: Cannot decode indexed color type without a palette', 0);
      }
      switch (header.bitDepth) {
        case 1:
        case 2:
        case 4: {
          const pixelsPerByte = 8 / header.bitDepth;
          const maxValue = (1 << header.bitDepth) - 1;
          const bytesPerPixel = header.bitDepth / 8;
          for (let y = 0; y < header.height; y++) {
            for (let x = 0; x < header.width; x++) {
              i = (y * header.width + x) * 4;
              let colorId = packed[y * bplCeiled + Math.floor(x * bytesPerPixel)];
              // Shift bits being considered to RHS
              colorId >>= ((pixelsPerByte - (x % pixelsPerByte)) - 1) * header.bitDepth;
              // Mask out irrelevant bits
              colorId &= maxValue;
              palette.setRgba(result as Uint8Array, i, colorId);
              if (trnsChunk && (trnsChunk.transparency as number[]).length > colorId) {
                result[i + 3] = (trnsChunk.transparency as number[])[colorId];
              }
            }
          }
          break;
        }
        case 8: {
          let colorId = 0;
          for (let y = 0; y < header.height; y++) {
            for (let x = 0; x < header.width; x++) {
              i = (y * header.width + x) * 4;
              colorId = packed[y * header.width + x];
              palette.setRgba(result as Uint8Array, i, colorId);
              if (trnsChunk && (trnsChunk.transparency as number[]).length > colorId) {
                result[i + 3] = (trnsChunk.transparency as number[])[colorId];
              }
            }
          }
          break;
        }
      }
      break;
    }

    case ColorType.Truecolor: {
      for (let y = 0; y < header.height; y++) {
        for (let x = 0; x < header.width; x++) {
          i = (y * header.width + x) * 4;
          if (header.bitDepth === 16) {
            result[i    ] = (packed[(y * header.width + x) * bpp    ] << 8) | (packed[(y * header.width + x) * bpp + 1]);
            result[i + 1] = (packed[(y * header.width + x) * bpp + 2] << 8) | (packed[(y * header.width + x) * bpp + 3]);
            result[i + 2] = (packed[(y * header.width + x) * bpp + 4] << 8) | (packed[(y * header.width + x) * bpp + 5]);
          } else {
            result[i    ] = packed[(y * header.width + x) * bpp    ];
            result[i + 1] = packed[(y * header.width + x) * bpp + 1];
            result[i + 2] = packed[(y * header.width + x) * bpp + 2];
          }
          result[i + 3] = header.bitDepth === 16 ? 65535 : 255;
        }
      }
      break;
    }

    case ColorType.TruecolorAndAlpha: {
      for (let y = 0; y < header.height; y++) {
        for (let x = 0; x < header.width; x++) {
          i = (y * header.width + x) * 4;
          if (header.bitDepth === 16) {
            result[i    ] = (packed[(y * header.width + x) * bpp    ] << 8) | (packed[(y * header.width + x) * bpp + 1]);
            result[i + 1] = (packed[(y * header.width + x) * bpp + 2] << 8) | (packed[(y * header.width + x) * bpp + 3]);
            result[i + 2] = (packed[(y * header.width + x) * bpp + 4] << 8) | (packed[(y * header.width + x) * bpp + 5]);
            result[i + 3] = (packed[(y * header.width + x) * bpp + 6] << 8) | (packed[(y * header.width + x) * bpp + 7]);
          } else {
            result[i    ] = packed[(y * header.width + x) * bpp    ];
            result[i + 1] = packed[(y * header.width + x) * bpp + 1];
            result[i + 2] = packed[(y * header.width + x) * bpp + 2];
            result[i + 3] = packed[(y * header.width + x) * bpp + 3];
          }
        }
      }
      break;
    }

  }
  return result;
}

function applyTransparency(header: IPngHeaderDetails, data: Uint8Array | Uint16Array, trnsChunk: IPngMetadataTransparency) {
  const maxEncodedValue = (1 << header.bitDepth) - 1;
  const maxDataValue = header.bitDepth === 16 ? 0xFFFF : 0xFF;

  // Set colors matching the shade to alpha 0
  if (header.colorType === ColorType.Grayscale) {
    const shade = (maxDataValue / maxEncodedValue) * (trnsChunk.transparency as number);
    for (let i = 0; i < data.length; i += 4) {
      // Only check red channel
      if (data[i] === shade) {
        data[i + 3] = 0;
      }
    }
    return;
  }

  // Set colors matching the rgb to alpha 0
  if (header.colorType === ColorType.Truecolor) {
    const channels = [
      maxDataValue / maxEncodedValue * (trnsChunk.transparency as [number, number, number])[0],
      maxDataValue / maxEncodedValue * (trnsChunk.transparency as [number, number, number])[1],
      maxDataValue / maxEncodedValue * (trnsChunk.transparency as [number, number, number])[2],
    ];
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] === channels[0] && data[i + 1] === channels[1] && data[i + 2] === channels[2]) {
        data[i + 3] = 0;
      }
    }
    return;
  }
}
