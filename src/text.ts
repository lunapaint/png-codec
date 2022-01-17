import * as pako from 'pako';
import { IDecodeContext, IPngChunk } from './types';

export function readText(ctx: IDecodeContext, chunk: IPngChunk, textDecoder: TextDecoder | undefined, maxLength: number | undefined, offset: number, maxOffset: number, readTrailingNull: boolean, isCompressed?: boolean): { bytesRead: number, text: string } {
  const bytes = [];
  let current = 0;
  let i = 0;
  for (; maxLength === undefined || i < maxLength; i++) {
    if (!readTrailingNull && offset === maxOffset) {
      break;
    }
    current = ctx.view.getUint8(offset);
    // Only check if not compressed as 0 is valid is deflated data
    if (!isCompressed && current === 0) {
      break;
    }
    offset++;
    bytes.push(current);
  }

  if (readTrailingNull && ctx.view.getUint8(offset) !== 0) {
    throw new Error(`${chunk.type}: No null character after text`);
  }

  let typedArray: Uint8Array = new Uint8Array(bytes);
  if (isCompressed) {
    const inflator = new pako.Inflate();
    inflator.push(typedArray);
    if (inflator.err) {
      throw new Error(`${chunk.type}: Inflate error: ${inflator.msg}`);
    }
    typedArray = inflator.result as Uint8Array;
  }

  return { text: textDecoder ? textDecoder.decode(typedArray) : String.fromCharCode(...bytes), bytesRead: i + 1 };
}
