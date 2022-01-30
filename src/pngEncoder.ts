import { IEncodePngOptions, IImage32, IImage64 } from './types.js';

export async function encodePng(data: Readonly<IImage32> | Readonly<IImage64>, options?: IEncodePngOptions): Promise<void> {
  console.log('encode!');
}
