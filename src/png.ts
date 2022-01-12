/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { IDecodePngOptions, IImage32, IImage64, IPngChunk, PngMetadata } from '../typings/api.js';

export async function decodePng(data: Readonly<Uint8Array>): Promise<{ image: IImage32 | IImage64, metadata?: PngMetadata[], rawChunks: IPngChunk[] }>;
export async function decodePng(data: Readonly<Uint8Array>, options: IDecodePngOptions & { force32: true }): Promise<{ image: IImage32, metadata?: PngMetadata[], rawChunks: IPngChunk[] }>;
export async function decodePng(data: Readonly<Uint8Array>, options: IDecodePngOptions): Promise<{ image: IImage32 | IImage64, metadata?: PngMetadata[], rawChunks: IPngChunk[] }>;
export async function decodePng(data: Readonly<Uint8Array>, options?: IDecodePngOptions): Promise<{ image: IImage32 | IImage64, metadata?: PngMetadata[], rawChunks: IPngChunk[] }> {
  // The decoder is dynamically imported here so only the decoder will be loaded when invoked, not
  // the encoder.
  return (await import('./pngParser.js')).decodePng(data, options);
}
