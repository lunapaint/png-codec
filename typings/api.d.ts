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
 *
 * @throws A {@link DecodeError} when an error is encountered or a {@link DecodeWarning} when a
 * warning is encountered in strict mode. In Typescript, `instanceof` can be used to narrow the type
 * safely.
 */
export function decodePng(data: Readonly<Uint8Array>): Promise<IDecodedPng<IImage32 | IImage64>>;
export function decodePng(data: Readonly<Uint8Array>, options: IDecodePngOptions & { force32: true }): Promise<IDecodedPng<IImage32>>;
export function decodePng(data: Readonly<Uint8Array>, options: IDecodePngOptions): Promise<IDecodedPng<IImage32 | IImage64>>;

/**
 * Encodes a png file.
 *
 * @param data The image data in rgba format.
 * @param options Options to configure how encoding happens.
 */
export function encodePng(data: Readonly<IImage32> | Readonly<IImage64>, options?: IEncodePngOptions): Promise<Uint8Array>;

/**
 * A png that has been successfully decoded.
 */
export interface IDecodedPng<T extends IImage32 | IImage64> {
  /**
   * The image dimensions and data.
   */
  image: T;

  /**
   * Details about the image, this is mostly useful internally as they are used to decode the image.
   * However, these could be presented in an image viewer.
   */
  details: IPngDetails;

  /**
   * The palette if it exists.
   */
  palette?: IPngPalette;

  /**
   * A list of metadata entries that have been decoded. See
   * {@link IDecodePngOptions.parseChunkTypes} for how to decode additional metadata entries.
   */
  metadata?: PngMetadata[];

  /**
   * All raw chunks contained in the png.
   */
  rawChunks: IPngChunk[];

  /**
   * Any warnings that were encountered during decoding. Warnings typically fall into the following
   * categories and are generally safe to ignore:
   *
   * - Strict ordering of chunks is not respected.
   * - Invalid property values in ancillary chunks.
   * - Could not decode an ancillary chunk.
   * - CRC checksum check for the chunk failed.
   * - Unrecognized chunk type (this is always a warning regardless of strict mode).
   * - Mutually exclusive chunk types were both included (eg. sRGB and iCCP).
   *
   * Strict mode can be enabled via {@link IDecodePngOptions.strictMode} which will throw an error when
   * any warning is encountered.
   */
  warnings?: DecodeWarning[];

  /**
   * Any informational messages when decoding. These are things of note but not important enough to
   * be a warning.
   */
  info: string[];
}

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
 * A png image's core palette. This must be present if the image's color type is `3` (indexed).
 */
export interface IPngPalette {
  /**
   * The number of entries in the palette.
   */
  readonly size: number;

  /**
   * Get the color at a given color index in [r, g, b] format.
   * @param colorIndex The color index.
   */
  getRgb(colorIndex: number): Uint8Array;
}

/**
 * Internal details of the png required to decode.
 */
export interface IPngDetails {
  /**
   * The width of the image.
   */
  width: number;

  /**
   * The height of the image.
   */
  height: number;

  /**
   * The bit depth defines how many bits are used per channel. The total bits used for each color
   * type is determined by `channels * bits per channel` as shown in the below table:
   *
   * | Color type          | Channels | 1 | 2 | 4 |  8 | 16
   * |---------------------|----------|---------------------
   * | Indexed             | 1        | 1 | 2 | 4 |  8 |  -
   * | Grayscale           | 1        | 1 | 2 | 4 |  8 | 16
   * | Grayscale and alpha | 2        | - | - | - | 16 | 32
   * | Truecolor           | 3        | - | - | - | 24 | 48
   * | Truecolor and alpha | 4        | - | - | - | 32 | 64
   */
  bitDepth: 1 | 2 | 4 | 8 | 16;

  /**
   * The color type of the image. The color type plus the bit depth defines the possible range of
   * colors that could be encoded by the image.
   */
  colorType: ColorType;

  /**
   * The interlace method of the png.
   */
  interlaceMethod: InterlaceMethod;
}

/**
 * The bit depth of the image which defines the number of bits used per channel. See
 * {@link IPngDetails.bitDepth} for more information.
 */
export type BitDepth = 1 | 2 | 4 | 8 | 16;

/**
 * The color type of the image.
 */
export const enum ColorType {
  Grayscale = 0,
  Truecolor = 2,
  Indexed = 3,
  GrayscaleAndAlpha = 4,
  TruecolorAndAlpha = 6,
}

/**
 * The interlacing method of the image.
 */
export const enum InterlaceMethod {
  None = 0,
  Adam7 = 1
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

  /**
   * Enables strict mode which will throw an error when the first warning is encountered. Strict
   * mode should be used when it's important that the PNG is completely valid, when strict mode is
   * not enabled the decoder will be as error tolerant as possible and report any warnings that
   * would has failed in strict mode in {@link IDecodedPng.warnings}.
   */
  strictMode?: boolean;
}

/**
 * An optional set of options to encode an image with. The options override the specified property
 * when encoding, except for the case where it's not possible to encode the image with that option
 * at which point it will be overridden (unless {@link IEncodePngOptions.strictMode} is used).
 *
 * @example Using the Truecolor color type that contains transparency will use either truecolor with
 * a tRNS chunk or truecolor and alpha depending on which is smaller.
 * @example Using the TruecolorAndAlpha color type will always use it.
 *
 * @throws An {@link EncodeError} when an error is encountered or a {@link EncodeWarning} when a
 * warning is encountered in strict mode. In Typescript, `instanceof` can be used to narrow the type
 * safely.
 */
export interface IEncodePngOptions {
  /**
   * The bit depth to encode with. When unspecified, the library will scan the image and determine
   * the best value based on the content, it's best to pass this in if know to avoid the scan
   * iterating over every pixel in the image.
   */
  bitDepth?: BitDepth;

  /**
   * What color type to encode with. Remarks:
   *
   * - When unspecified, the library will decide what color type to use.
   * - When grayscale is used, only the red channel will be considered when encoding as the image is
   * expected to be a valid grayscale image.
   * - When grayscale or truecolor are used and transparent colors exist, the resulting image will
   * be "upgraded" to {@link ColorType.GrayscaleAndAlpha}/{@link ColorType.TruecolorAndAlpha} or the
   * `tRNS` chunk will be used, depending on which consumes less bytes.
   */
  colorType?: ColorType;

  /**
   * Enabled strict encoding which will throw when
   */
  strictMode?: boolean;
}

/**
 * A raw png chunk extracted from the datastream. A png is made up of a fixed signature and then a
 * series of chunks which encode all the information in the png. The {@link IPngChunk.type} of the
 * chunk determines what information it contains.
 */
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

/**
 * The set of all chunk types the library is aware of.
 */
export const enum KnownChunkTypes {
  /** Image header                           */ IHDR = 'IHDR',
  /** Palette                                */ PLTE = 'PLTE',
  /** Image data                             */ IDAT = 'IDAT',
  /** Image trailer                          */ IEND = 'IEND',
  /* eslint-disable */
  /** Background color                       */ bKGD = 'bKGD',
  /** Primary chromaticities and white point */ cHRM = 'cHRM',
  /** Exchangeable image file format         */ eXIf = 'eXIf',
  /** Image gamma                            */ gAMA = 'gAMA',
  /** Image histogram                        */ hIST = 'hIST',
  /** Embedded ICC profile                   */ iCCP = 'iCCP',
  /** International textual data             */ iTXt = 'iTXt',
  /** Image offset                           */ oFFs = 'oFFs',
  /** Calibration of pixel values            */ pCAL = 'pCAL',
  /** Physical pixel dimensions              */ pHYs = 'pHYs',
  /** Significant bits                       */ sBIT = 'sBIT',
  /** Physical scale of image subject        */ sCAL = 'sCAL',
  /** Suggested palette                      */ sPLT = 'sPLT',
  /** Standard RGB colour space              */ sRGB = 'sRGB',
  /** Indicator of stereo image              */ sTER = 'sTER',
  /** Textual data                           */ tEXt = 'tEXt',
  /** Image last-modification time           */ tIME = 'tIME',
  /** Transparency                           */ tRNS = 'tRNS',
  /** Compressed textual data                */ zTXt = 'zTXt',
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

/**
 * A metadata entry defining information that was encoded as a chunk in the image.
 */
export type PngMetadata =
  IPngMetadataBackgroundColor |
  IPngMetadataCalibrationOfPixelValues |
  IPngMetadataChromaticity |
  IPngMetadataCompressedTextualData |
  IPngMetadataEmbeddedIccProfile |
  IPngMetadataExif |
  IPngMetadataGamma |
  IPngMetadataHistogram |
  IPngMetadataIndicatorOfStereoImage |
  IPngMetadataInternationalTextualData |
  IPngMetadataLastModificationTime |
  IPngMetadataOffset |
  IPngMetadataPhysicalPixelDimensions |
  IPngMetadataPhysicalScaleOfImageSubject |
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
   * The preferred background color. The format of this property depends on the
   * {@link IPngDetails.colorType} of the image:
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
 * A metadata entry that indicates that the image contains physical data other than color values,
 * for example a 2D temperature field. The resulting data might be used to construct a reference
 * color bar beside the image, or to extract the original physical data values from the file. It is
 * not expected to affect the way the pixels are displayed.
 */
export interface IPngMetadataCalibrationOfPixelValues {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'pCAL';

  /**
   * The name of the calibration mapping.
   */
  calibrationName: string;

  /**
   * The unit name of the resulting data.
   */
  unitName: string;

  /**
   * The type of equation to use in order to extract the mapped data.
   *
   * - `linear-mapping`:
   *   ```
   *   physical_value = p0 + p1 * original_sample / (x1-x0)
   *   ```
   * - `base-e exponential mapping`:
   *   ```
   *   p0 + p1 * exp(p2 * original_sample / (x1-x0))
   *   ```
   * - `arbitrary-base exponential mapping`:
   *   ```
   *   physical_value = p0 + p1 * pow(p2, (original_sample / (x1-x0)))
   *   ```
   * - `hyperbolic mapping`:
   *   ```
   *   physical_value = p0 + p1 * sinh(p2 * (original_sample - p3) / (x1-x0))
   *   ```
   */
  equationType: 'linear-mapping' | 'base-e exponential mapping' | 'arbitrary-base exponential mapping' | 'hyperbolic mapping';

  /**
   * The `x0` value in {@link IPngMetadataCalibrationOfPixelValues.equationType}.
   */
  x0: number;

  /**
   * The `x1` value in {@link IPngMetadataCalibrationOfPixelValues.equationType}.
   */
  x1: number;

  /**
   * The `p0...pn` values in {@link IPngMetadataCalibrationOfPixelValues.equationType}.
   */
  params: number[];
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
 * A metadata entry that indicates the image contains a stereo pair of subimages where the images
 * are presented side-by-side with one subimage intended for the left eye and the other for the
 * right eye. This metadata entry does not split the resulting image but enables the program decoding
 * the image to split it manually if needed.
 *
 * The left edge of the right subimage must be on a column that is evenly divisible by eight, such
 * that if interlacing is employed, the two images will have coordinated interlacing. Padding
 * columns between the two subimages must be introduced by the encoder if necessary.
 */
 export interface IPngMetadataIndicatorOfStereoImage {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'sTER';

  /**
   * The layout mode of the two subimages, each defined below:
   *
   * - `cross-fuse`: The right-eye image appears on the left and the left-eye image appears on the
   *   right, suitable for cross-eyed free viewing.
   * - `diverging-fuse`: The left-eye images appears on the left and the right-eye image appears on
   *   on the right, suitable for divergent (wall-eyed) free viewing.
   *
   * ```
   * |         |           |         |
   * |  first  |  optional |  second |
   * |←       →|←         →|←       →|
   * |  image  |  padding  |  image  |
   * |         |           |         |
   * ```
   */
  layoutMode: 'cross-fuse' | 'diverging-fuse';

  /**
   * The width of the individual subimages.
   */
  subimageWidth: number;

  /**
   * The number of pixels of padding in between the images.
   */
  padding: number;
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
 * A metadata entry that defines the image's offset. This could be for example the position on a printed page at which
 * the image should be output when printed alone, or the image's location with respect to a larger screen.
 */
export interface IPngMetadataOffset {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'oFFs';

  /**
   * The offset.
   */
  offset: { x: number, y: number };

  /**
   * The unit type of the offset.
   */
  unitType: 'pixel' | 'micrometer';
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
 * A metadata entry that defines the physical scale of the subject within the image. This is often
 * used for maps, floor plans, etc.
 */
 export interface IPngMetadataPhysicalScaleOfImageSubject {
  /**
   * The type of metadata, this is typically the name of the chunk from which is originates.
   */
  type: 'sCAL';

  /**
   * The number of pixels per unit for each dimension.
   */
  pixelsPerUnit: { x: number, y: number };

  /**
   * The unit type of the dimensions.
   */
  unitType: 'meter' | 'radian';
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
   * {@link IPngDetails.colorType} of the image:
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

/**
 * A critical error occurred during decoding.
 */
export class DecodeError extends Error {
  /**
   * The byte offset of the error in the datastream.
   */
  offset: number;

  /**
   * The partially decoded image which gives access to deocde warnings, dimensions, etc.
   */
  partiallyDecodedImage: Partial<IDecodedPng<any>>;
}

/**
 * A warning occurred during decoding.
 */
export class DecodeWarning extends Error {
  /**
   * The byte offset of the warning in the datastream.
   */
  offset: number;
}

/**
 * A critical error occurred during encoding.
 */
export class EncodeError extends Error {
  /**
   * The byte offset of the error in the datastream.
   */
  offset: number;
}

/**
 * A warning occurred during encoding.
 */
export class EncodeWarning extends Error {
  /**
   * The byte offset of the warning in the datastream.
   */
  offset: number;
}
