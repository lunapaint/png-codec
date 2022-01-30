/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { IEncodePngOptions, IImage32, IImage64 } from './types.js';

export async function encodePng(data: Readonly<IImage32> | Readonly<IImage64>, options?: IEncodePngOptions): Promise<Uint8Array> {
  const result = new Uint8Array(8);
  const view = new DataView(result.buffer, result.byteOffset, result.byteLength);
  let offset = 0;

  offset += writePngSignature(view, offset);

  console.log('encode!', result);
  return result;
}

function writePngSignature(view: DataView, offset: number): number {
  view.setUint8(offset    , 0x89);
  view.setUint8(offset + 1, 0x50);
  view.setUint8(offset + 2, 0x4E);
  view.setUint8(offset + 3, 0x47);
  view.setUint8(offset + 4, 0x0D);
  view.setUint8(offset + 5, 0x0A);
  view.setUint8(offset + 6, 0x1A);
  view.setUint8(offset + 7, 0x0A);
  return 8;
}
