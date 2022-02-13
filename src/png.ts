/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

export { DecodeError, DecodeWarning } from './assert.js';
export { EncodeError, EncodeWarning } from './encode/assert.js';
import { IEncodedPng } from '../typings/api.js';
import { IDecodedPng, IDecodePngOptions, IEncodePngOptions, IImage32, IImage64 } from './types.js';

// This file is the entry point the the library, it wraps the implementation files using dynamic
// imports so the bare minimum code is loaded when code splitting is enabled.

export async function decodePng(data: Readonly<Uint8Array>): Promise<IDecodedPng<IImage32 | IImage64>>;
export async function decodePng(data: Readonly<Uint8Array>, options: IDecodePngOptions & { force32: true }): Promise<IDecodedPng<IImage32>>;
export async function decodePng(data: Readonly<Uint8Array>, options: IDecodePngOptions): Promise<IDecodedPng<IImage32 | IImage64>>;
export async function decodePng(data: Readonly<Uint8Array>, options?: IDecodePngOptions): Promise<IDecodedPng<IImage32 | IImage64>> {
  return (await import('./pngDecoder.js')).decodePng(data, options);
}

export async function encodePng(data: Readonly<IImage32> | Readonly<IImage64>, options?: IEncodePngOptions): Promise<IEncodedPng> {
  return (await import('./pngEncoder.js')).encodePng(data, options);
}
