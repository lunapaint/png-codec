/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { getChannelsForColorType } from '../colorTypes.js';
import { ColorType, IEncodeContext, IImage32, IImage64 } from '../types.js';
import { writeChunkDataFn } from '../write.js';

export function encodeChunk(
  ctx: IEncodeContext,
  image: Readonly<IImage32> | Readonly<IImage64>
): Uint8Array {
  switch (ctx.colorType) {
    case ColorType.Grayscale: {
      /* istanbul ignore next - this error should never happen in practice */
      if (ctx.firstTransparentColor === undefined) {
        throw new Error('Cannot write tRNS for grayscale without any transparent colors');
      }
      const firstTransparentColor = ctx.firstTransparentColor;
      return writeChunkDataFn('tRNS', 2, stream => {
        if (image.data.BYTES_PER_ELEMENT === 2) {
          stream.writeUint16((firstTransparentColor >> 48) & 0xFFFF);
        } else {
          stream.writeUint16((firstTransparentColor >> 24) & 0xFF);
        }
      });
    }
    case ColorType.Indexed: {
      /* istanbul ignore next - this error should never happen in practice */
      if (!ctx.palette) {
        throw new Error('Cannot encode tRNS chunk for indexed image without palette');
      }
      return writeChunkDataFn('tRNS', ctx.palette.size, stream => {
        for (const color of ctx.colorSet) {
          stream.writeUint8(color & 0xFF);
        }
      });
    }
    case ColorType.Truecolor: {
      /* istanbul ignore next - this error should never happen in practice */
      if (ctx.firstTransparentColor === undefined) {
        throw new Error('Cannot write tRNS for True color without any transparent colors');
      }
      const firstTransparentColor = ctx.firstTransparentColor;
      return writeChunkDataFn('tRNS', 6, stream => {
        if (image.data.BYTES_PER_ELEMENT === 2) {
          stream.writeUint16((firstTransparentColor >> 48) & 0xFFFF);
          stream.writeUint16((firstTransparentColor >> 32) & 0xFFFF);
          stream.writeUint16((firstTransparentColor >> 16) & 0xFFFF);
        } else {
          stream.writeUint16((firstTransparentColor >> 24) & 0xFF);
          stream.writeUint16((firstTransparentColor >> 16) & 0xFF);
          stream.writeUint16((firstTransparentColor >>  8) & 0xFF);
        }
      });
    }
    /* istanbul ignore next - this error should never happen in practice */
    default:
      throw new Error(`Cannot encode tRNS chunk for color type "${ctx.colorType}"`);
  }
}
