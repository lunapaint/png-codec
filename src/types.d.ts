/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

export {
  PngMetadata,
  IDecodePngOptions,
  IImage32,
  IImage64,
  IPngMetadataBackgroundColor,
  IPngMetadataChromaticity,
  IPngMetadataCompressedTextualData,
  IPngMetadataExif,
  IPngMetadataGamma,
  IPngMetadataHistogram,
  IPngMetadataInternationalTextualData,
  IPngMetadataLastModificationTime,
  IPngMetadataPalette,
  IPngMetadataPhysicalPixelDimensions,
  IPngMetadataSignificantBits,
  IPngMetadataStandardRgbColorSpace,
  RenderingIntent,
  IPngMetadataSuggestedPalette,
  IPngMetadataSuggestedPaletteEntry,
  IPngMetadataTextualData,
  IPngMetadataTransparency,
  KnownChunkTypes,
  DefaultParsedChunkTypes,
  OptionalParsedChunkTypes,
} from '../typings/api.js';

import {
  IImage32,
  IImage64,
  PngMetadata
} from '../typings/api.js';

export interface IPartialDecodedPng {
  image?: IImage32 | IImage64;
  palette?: IPngPalette;
  /**
   * A Set of chunks already parsed, this can be used to enforce chunk ordering and preventing
   * multiple when only one is allowed.
   */
  parsedChunks: Set<string>;
  metadata: PngMetadata[];
}

export interface IPngChunk {
  /** The offset of the beginning of the chunk */
  offset: number;
  /** The type of the chunk. */
  type: string;
  /** The length of the chunk's data (starts from offset + 8B). */
  dataLength: number;
  /** Whether the chunk is optionally interpreted (as opposed to critical). */
  isAncillary: boolean;
  /** Whether the chunk is private and not defined in the standard. */
  isPrivate: boolean;
  /** Whether this chunk is safe to copy into a new image if unrecognized. */
  isSafeToCopy: boolean;
}

export interface IPngHeaderDetails {
  width: number;
  height: number;
  /**
   * The bit depth defines how many bits are used per channel. The total bits used for each color
   * type is determined by `channels * bits per channel` as shown in the below table:
   *
   * | Color type          | Channels | 1 | 2 | 4 |  8 | 16
   * |---------------------|----------|-------------------
   * | Indexed             | 1        | 1 | 2 | 4 |  8 |  -
   * | Grayscale           | 1        | 1 | 2 | 4 |  8 | 16
   * | Grayscale and alpha | 2        | - | - | - | 16 | 32
   * | Truecolor           | 3        | - | - | - | 24 | 48
   * | Truecolor and alpha | 4        | - | - | - | 32 | 64
   */
  bitDepth: 1 | 2 | 4 | 8 | 16;
  colorType: ColorType;
  interlaceMethod: InterlaceMethod;
}

export const enum ColorType {
  Grayscale = 0,
  Truecolor = 2,
  Indexed = 3,
  GrayacaleAndAlpha = 4,
  TruecolorAndAlpha = 6,
}

export type BitDepth = 1 | 2 | 4 | 8 | 16;

export const enum InterlaceMethod {
  None = 0,
  Adam7 = 1
}

export const enum ChunkPartByteLength {
  Length = 4,
  Type = 4,
  CRC = 4
}

export interface IPngPalette {
  /**
   * The number of colors defined in the palette.
   */
  size: number;

  /**
   * Gets a color for a given color index in the format [red, green, blue].
   * @param colorIndex The color index of the color.
   */
  getRgb(colorIndex: number): Uint8Array;
  setRgba(data: Uint8Array, offset: number, colorIndex: number): void;
}
