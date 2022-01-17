/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

export { DecodeError, DecodeWarning } from './assert.js';
import { IDecodedPng, IDecodePngOptions, IImage32, IImage64 } from './types.js';

export async function decodePng(data: Readonly<Uint8Array>): Promise<IDecodedPng<IImage32 | IImage64>>;
export async function decodePng(data: Readonly<Uint8Array>, options: IDecodePngOptions & { force32: true }): Promise<IDecodedPng<IImage32>>;
export async function decodePng(data: Readonly<Uint8Array>, options: IDecodePngOptions): Promise<IDecodedPng<IImage32 | IImage64>>;
export async function decodePng(data: Readonly<Uint8Array>, options?: IDecodePngOptions): Promise<IDecodedPng<IImage32 | IImage64>> {
  // The decoder is dynamically imported here so only the decoder will be loaded when invoked when
  // code splitting is enabled, not the encoder.
  return (await import('./pngParser.js')).decodePng(data, options);
}
