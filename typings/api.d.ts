/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

/**
 * Decodes a png file.
 *
 * Note that it's best to drop references to both metadata and rawChunks as soon as they are no
 * longer needed as they may take up a significant amount of memory depending on the image.
 *
 * @param data The complete png file data to decode.
 * @param options Options to configure how decoding happens.
 */
export function decodePng(data: Readonly<Uint8Array>): Promise<{ image: IImage32 | IImage64, metadata?: PngMetadata[], rawChunks: IPngChunk[] }>;
export function decodePng(data: Readonly<Uint8Array>, options: IDecodePngOptions & { force32: true }): Promise<{ image: IImage32, metadata?: PngMetadata[], rawChunks: IPngChunk[] }>;
export function decodePng(data: Readonly<Uint8Array>, options: IDecodePngOptions): Promise<{ image: IImage32 | IImage64, metadata?: PngMetadata[], rawChunks: IPngChunk[] }>;

/**
 * A 32-bit image (ie. 8 bit depth).
 */
export interface IImage32 {
  data: Uint8Array;
  width: number;
  height: number;
}

/**
 * A 64-bit image (ie. 16 bit depth).
 */
export interface IImage64 {
  data: Uint16Array;
  width: number;
  height: number;
}

/**
 * A set of options to configure how decoding happens.
 */
export interface IDecodePngOptions {
  /**
   * Automatically convert 64-bit images (ie. 16 bit depth) to 32-bit images.
   */
  force32?: boolean;

  /**
   * A list of optional chunk types to parse or `'*'` to parse all known chunk types. By default
   * only the chunk types required to extract the image data is parsed for performance reasons, if a
   * chunk type is of use this option can be used to do that.
   */
  parseChunkTypes?: OptionalParsedChunkTypes[] | '*';
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

export const enum KnownChunkTypes {
  IHDR = 'IHDR',
  PLTE = 'PLTE',
  IDAT = 'IDAT',
  IEND = 'IEND',
  /* eslint-disable */
  bKGD = 'bKGD',
  cHRM = 'cHRM',
  eXIf = 'eXIf',
  gAMA = 'gAMA',
  hIST = 'hIST',
  iCCP = 'iCCP',
  iTXt = 'iTXt',
  tIME = 'tIME',
  pHYs = 'pHYs',
  sBIT = 'sBIT',
  sPLT = 'sPLT',
  sRGB = 'sRGB',
  tEXt = 'tEXt',
  tRNS = 'tRNS',
  zTXt = 'zTXt',
  /* eslint-enable */
}

/**
 * The set of chunk types parsed by default. The transparency chunk is included in this list as that
 * can change to the resulting image data.
 */
type DefaultParsedChunkTypes =
  KnownChunkTypes.IHDR |
  KnownChunkTypes.PLTE |
  KnownChunkTypes.IDAT |
  KnownChunkTypes.IEND |
  KnownChunkTypes.tRNS;

/**
 * The set of chunk types that are optionally parsed, but not by default.
 */
type OptionalParsedChunkTypes = Exclude<KnownChunkTypes, DefaultParsedChunkTypes>;

export type PngMetadata =
  IPngMetadataBackgroundColor |
  IPngMetadataChromaticity |
  IPngMetadataCompressedTextualData |
  IPngMetadataEmbeddedIccProfile |
  IPngMetadataExif |
  IPngMetadataGamma |
  IPngMetadataHistogram |
  IPngMetadataInternationalTextualData |
  IPngMetadataLastModificationTime |
  IPngMetadataPalette |
  IPngMetadataPhysicalPixelDimensions |
  IPngMetadataSignificantBits |
  IPngMetadataStandardRgbColorSpace |
  IPngMetadataSuggestedPalette |
  IPngMetadataTextualData |
  IPngMetadataTransparency;

/**
 * A metadata entry that defines an image's preferred default background color to present it
 * against. This is typically used in image viewers but not in web browsers (where an existing
 * background color exists) or image editors (where retaining transparency is important).
 *
 * An example of where this might be useful is a diagram with text all in black where everything
 * else is transparent, opening this in an image viewer with a dark background would make this
 * unreadable but not if the image viewer respected a white bKGD entry.
 */
export interface IPngMetadataBackgroundColor {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'bKGD';

  /**
   * The preferred background color. The format of this property depends on the `colorType` of the
   * image:
   *
   * - `0` (Greyscale): The lightness of the color (0-255).
   * - `2` (Truecolor): A number array made up of each color channel (each 0-255).
   * - `3` (Indexed): The palette color index (0-255).
   * - `4` (Greyscale and alpha): The lightness of the color (0-255).
   * - `6` (Truecolor and alpha): A number array made up of each color channel (each 0-255).
   */
  color: number | [number, number, number];
}

/**
 * A metadata entry that defines the x,y chromaticities of the red green and blue channels used in
 * the image as well the references white point.
 */
export interface IPngMetadataChromaticity {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'cHRM';

  /**
   * The x,y white point.
   */
  whitePoint: { x: number, y: number };

  /**
   * The x,y red chromaticity.
   */
  red: { x: number, y: number };

  /**
   * The x,y green chromaticity.
   */
  green: { x: number, y: number };

  /**
   * The x,y blue chromaticity.
   */
  blue: { x: number, y: number };
}

/**
 * A metadata entry that defines a compressed piece of text associated with the image, interpreted
 * according to the Latin-1 character set.
 */
export interface IPngMetadataCompressedTextualData {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'zTXt';

  /**
   * A description of the text in English, this typically matches one of the following:
   * - Author:      Name of image's creator
   * - Description: Description of image (possibly long)
   * - Copyright:   Copyright notice
   * - Creation:    Time	Time of original image creation
   * - Software:    Software used to create the image
   * - Disclaimer:  Legal disclaimer
   * - Warning:     Warning of nature of content
   * - Source:      Device used to create the image
   * - Comment:     Miscellaneous comment
   */
  keyword: string;

  /**
   * The text.
   */
  text: string;
}

/**
 * A metadata entry that defines an image's EXIF (Exchangeable image file format) data which
 * contains various addition metadata on an image, typically added by digital cameras, scanners,
 * etc.
 */
export interface IPngMetadataExif {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'eXIf';

  /**
   * The raw EXIF buffer.
   */
  value: ArrayBuffer;
}

/**
 * A metadata entry that defines the relationship between the image samples and its desired display
 * output intensity.
 */
export interface IPngMetadataGamma {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'gAMA';

  /**
   * The gamma value.
   */
  value: number;
}

/**
 * A metadata entry that defines the approximate color usage frequency in the palette. This entry
 * can only exist if there is also a palette. If a viewer of the png file cannot display all colors,
 * this chunk can help select a subset of the colors to use.
 */
 export interface IPngMetadataHistogram {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'hIST';

  /**
   * An array of approximately frequency of each palette entry, the exact scale of the frequency is
   * not standard and determined by the encoder of the image.
   */
  frequency: number[];
}

/**
 * A metadata entry that defines an ICC profile as defined by the International Color Consortium.
 */
export interface IPngMetadataEmbeddedIccProfile {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'iCCP';

  /**
   * The name of the profile.
   */
  name: string;

  /**
   * The raw bytes of the embedded ICC profile.
   */
  data: Uint8Array;
}

/**
 * A metadata entry that defines a piece of text associated with the image that has a language
 * associated with it. All text will be decoded using the `TextDecoder` API if it's present in the
 * environment (eg. web, node.js), otherwise `String.fromCharCode` will be used.
 */
 export interface IPngMetadataInternationalTextualData {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'iTXt';

  /**
   * A description of the text in English, this typically matches one of the following:
   * - Author:      Name of image's creator
   * - Description: Description of image (possibly long)
   * - Copyright:   Copyright notice
   * - Creation:    Time	Time of original image creation
   * - Software:    Software used to create the image
   * - Disclaimer:  Legal disclaimer
   * - Warning:     Warning of nature of content
   * - Source:      Device used to create the image
   * - Comment:     Miscellaneous comment
   */
  keyword: string;

  /**
   * The language tag of the data.
   */
  languageTag: string;

  /**
   * The description of the text in the target language.
   */
  translatedKeyword: string;

  /**
   * The text in the target language.
   */
  text: string;
}

/**
 * A metadata entry that defines the last modification time of the image.
 */
export interface IPngMetadataLastModificationTime {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'tIME';

  /**
   * The last modification time.
   */
  value: Date;
}

/**
 * A metadata entry that defines the image's core palette. This must be present when `colorType` is
 * equal to `3` (indexed).
 */
export interface IPngMetadataPalette {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'PLTE';

  // TODO: Provide access to the palette via the API
}

/**
 * A metadata entry that defines the intended pixel size or aspect ratio of the image.
 */
export interface IPngMetadataPhysicalPixelDimensions {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'pHYs';

  /**
   * The number of pixels per unit for each dimension.
   */
  pixelsPerUnit: { x: number, y: number };

  /**
   * The unit type of the dimensions.
   */
  unitType: 'meter' | 'unknown';
}

/**
 * A metadata entry that defines a bit depth less than or equal to the image's bit depth which
 * allows potentially storing bit depths not equal to 1, 2, 4, 8 or 16 within pngs. Since the
 * assembled data is output as a 32-bit image or 64-bit image, this is only useful in the library
 * for handling non-standard bit depths of 9 to 15.
 */
export interface IPngMetadataSignificantBits {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'sBIT';

  /**
   * The number of significant bits for each channel. The format of this property depends on the
   * `colorType` of the image:
   *
   * - `0` (Greyscale): number
   * - `2` (Truecolor): [number, number, number]
   * - `3` (Indexed): [number, number, number]
   * - `4` (Greyscale and alpha): [number, number]
   * - `6` (Truecolor and alpha): [number, number, number, number]
   */
  value: number | number[];
}

/**
 * A metadata entry that defines the image's rendering intent.
 */
export interface IPngMetadataStandardRgbColorSpace {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'sRGB';

  /**
   * The rendering intent as defined by the International Color Consortium (ICC).
   */
  renderingIntent: RenderingIntent;
}

/**
 * A rendering intent as defined by the International Color Consortium (ICC).
 */
export const enum RenderingIntent {
  /**
   * For images preferring good adaptation to the output device gamut at the expense of colorimetric
   * accuracy, such as photographs.
   */
  Perceptual = 0,
  /**
   * For images requiring colour appearance matching (relative to the output device white point),
   * such as logos.
   */
  RelativeColorimetric = 1,
  /**
   * For images preferring preservation of saturation at the expense of hue and lightness, such as
   * charts and graphs.
   */
  Saturation = 2,
  /**
   * For images requiring preservation of absolute colorimetry, such as previews of images destined
   * for a different output device (proofs).
   */
  AbsoluteColorimetric = 3
}

/**
 * A metadata entry that defines a suggested palette. Multiple suggested palettes can exist.
 */
 export interface IPngMetadataSuggestedPalette {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'sPLT';

  /**
   * The name of the palette
   */
  name: string;

  /**
   * The sample depth of the palette (8 or 16).
   */
  sampleDepth: number;

  /**
   * The entries of the palette.
   */
  entries: IPngMetadataSuggestedPaletteEntry[];
}

/**
 * A suggested palette entry.
 */
export interface IPngMetadataSuggestedPaletteEntry {
  /**
   * The red channel of the entry, the range of this depends on the sampleDepth of the palette:
   *
   * - 8:  0-255
   * - 16: 0-65535
   */
  red: number;

  /**
   * The green channel of the entry, the range of this depends on the sampleDepth of the palette:
   *
   * - 8:  0-255
   * - 16: 0-65535
   */
  green: number;

  /**
   * The blue channel of the entry, the range of this depends on the sampleDepth of the palette:
   *
   * - 8:  0-255
   * - 16: 0-65535
   */
  blue: number;

  /**
   * The alpha channel of the entry, the range of this depends on the sampleDepth of the palette:
   *
   * - 8:  0-255
   * - 16: 0-65535
   */
  alpha: number;

  /**
   * The frequency of the entry which is proportional to the amount of pixels in the image that
   * use the entry. The scale of the frequency is up to the encoder.
   */
  frequency: number;
}

/**
 * A metadata entry that defines a piece of text associated with the image, interpreted according to
 * the Latin-1 character set.
 */
 export interface IPngMetadataTextualData {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'tEXt';

  /**
   * A description of the text in English, this typically matches one of the following:
   * - Author:      Name of image's creator
   * - Description: Description of image (possibly long)
   * - Copyright:   Copyright notice
   * - Creation:    Time	Time of original image creation
   * - Software:    Software used to create the image
   * - Disclaimer:  Legal disclaimer
   * - Warning:     Warning of nature of content
   * - Source:      Device used to create the image
   * - Comment:     Miscellaneous comment
   */
  keyword: string;

  /**
   * The text.
   */
  text: string;
}

/**
 * A metadata entry that defines "simple transparency," allowing transparency within  non-alpha
 * color types. The transparency defined in this chunk is applied automatically to the data during
 * decoding.
 */
export interface IPngMetadataTransparency {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'tRNS';

  /**
   * The transparent color or the transparency of the palette color, the format depends on the
   * image color type:
   *
   * - `0` (Greyscale): number - the shade of grey that will use alpha 0.
   * - `2` (Truecolor): [number, number, number] - the color rgb that will use alpha 0.
   * - `3` (Indexed): [number, ...] - The alpha value of palette entries, this may not include all
   *   palette entries.
   */
  transparency: number | [number, number, number] | number[];
}
