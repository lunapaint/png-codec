/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

// Re-export types from the api file which cannot be referenced in the out/ directory.
export {
  BitDepth,
  ColorType,
  DefaultParsedChunkTypes,
  IDecodedPng,
  IDecodePngOptions,
  IImage32,
  IImage64,
  InterlaceMethod,
  IPngChunk,
  IPngMetadataBackgroundColor,
  IPngMetadataChromaticity,
  IPngMetadataCompressedTextualData,
  IPngMetadataEmbeddedIccProfile,
  IPngMetadataExif,
  IPngMetadataGamma,
  IPngMetadataHistogram,
  IPngMetadataInternationalTextualData,
  IPngMetadataLastModificationTime,
  IPngMetadataPhysicalPixelDimensions,
  IPngMetadataSignificantBits,
  IPngMetadataStandardRgbColorSpace,
  IPngMetadataSuggestedPalette,
  IPngMetadataSuggestedPaletteEntry,
  IPngMetadataTextualData,
  IPngMetadataTransparency,
  KnownChunkTypes,
  OptionalParsedChunkTypes,
  PngMetadata,
  RenderingIntent
} from '../typings/api.js';

import {
  BitDepth,
  ColorType,
  IImage32,
  IImage64,
  InterlaceMethod,
  IPngPalette,
  PngMetadata
} from '../typings/api.js';

export interface IPartialDecodedPng {
  image?: IImage32 | IImage64;
  palette?: IPngPaletteInternal;
  /**
   * A Set of chunks already parsed, this can be used to enforce chunk ordering and preventing
   * multiple when only one is allowed.
   */
  parsedChunks: Set<string>;
  metadata: PngMetadata[];
  warnings: Error[];
}

export interface IPngHeaderDetails {
  width: number;
  height: number;
  bitDepth: BitDepth;
  colorType: ColorType;
  interlaceMethod: InterlaceMethod;
}

export const enum ChunkPartByteLength {
  Length = 4,
  Type = 4,
  CRC = 4
}

export interface IPngPaletteInternal extends IPngPalette {
  setRgba(data: Uint8Array, offset: number, colorIndex: number): void;
}
