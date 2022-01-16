/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { assertChunkPrecedes, assertChunkSinglular, ChunkError, handleWarning } from '../assert.js';
import { ChunkPartByteLength, ColorType, IDecodePngOptions, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, IPngPaletteInternal, KnownChunkTypes } from '../types.js';

/**
 * `PLTE` Palette
 *
 * Spec: https://www.w3.org/TR/PNG/#11PLTE
 */
export function parseChunk(header: IPngHeaderDetails, view: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng, options: IDecodePngOptions | undefined): IPngPaletteInternal {
  assertChunkSinglular(chunk, decodedPng, options?.strictMode);
  assertChunkPrecedes(chunk, KnownChunkTypes.bKGD, decodedPng, options?.strictMode);
  assertChunkPrecedes(chunk, KnownChunkTypes.hIST, decodedPng, options?.strictMode);
  assertChunkPrecedes(chunk, KnownChunkTypes.tRNS, decodedPng, options?.strictMode);
  assertChunkPrecedes(chunk, KnownChunkTypes.IDAT, decodedPng, options?.strictMode);

  // This chunk shall appear for colour type 3, and may appear for colour types 2 and 6; it shall not appear for colour types 0 and 4.
  if (header.colorType === ColorType.Grayscale || header.colorType === ColorType.GrayacaleAndAlpha) {
    throw new ChunkError(chunk, `Color type "${header.colorType}" cannot have a palette`);
  }

  if (chunk.dataLength === 0) {
    throw new ChunkError(chunk, 'Cannot have 0 entries');
  }

  // A chunk length not divisible by 3 is an error.
  if (chunk.dataLength % 3 !== 0) {
    throw new ChunkError(chunk, `Chunk length must be divisible by 3 (actual "${chunk.dataLength}")`);
  }

  if (chunk.dataLength / 3 > 256) {
    handleWarning(new ChunkError(chunk, `Too many entries (${chunk.dataLength / 3} > 256)`), decodedPng.warnings, options?.strictMode);
  }

  // TODO: The number of palette entries shall not exceed the range that can be represented in the image bit depth (for example, 24 = 16 for a bit depth of 4).

  return new PngPalette(view, chunk.offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type, chunk.dataLength, header.bitDepth);
}

class PngPalette implements IPngPaletteInternal {
  constructor(
    private readonly _view: DataView,
    private _paletteOffset: number,
    private _length: number,
    private _bitDepth: number
  ) {
    // TODO: Slice the palette data off the main buffer so it can be freed since the palette will be returned via API.
    // for (let i = 0; i < this._length / 3; i++) {
    //   console.log(`Palette color ${i} = ${this._view.getUint8(this._paletteOffset + i * 3)}, ${this._view.getUint8(this._paletteOffset + i * 3 + 1)}, ${this._view.getUint8(this._paletteOffset + i * 3 + 2)}`);
    // }
  }

  get size(): number { return this._length / 3; }

  getRgb(colorIndex: number): Uint8Array {
    this._checkIndex(colorIndex);
    return new Uint8Array(this._view.buffer.slice(this._view.byteOffset + this._paletteOffset + colorIndex * 3, this._view.byteOffset + this._paletteOffset + colorIndex * 3 + 3));
  }

  setRgba(data: Uint8Array, offset: number, colorIndex: number): void {
    this._checkIndex(colorIndex);
    const i = this._paletteOffset + colorIndex * 3;
    data[offset    ] = this._view.getUint8(i    );
    data[offset + 1] = this._view.getUint8(i + 1);
    data[offset + 2] = this._view.getUint8(i + 2);
    data[offset + 3] = 255;
  }

  private _checkIndex(colorIndex: number) {
    // any out-of-range pixel value found in the image data is an error.
    if (colorIndex < 0 || colorIndex * 3 > this._length - 3) {
      throw new Error(`Palette does not contain color index "${colorIndex}"`);
    }
  }
}
