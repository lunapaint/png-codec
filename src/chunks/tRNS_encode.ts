/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { getChannelsForColorType } from '../colorTypes.js';
import { ColorType, IEncodeContext, IImage32, IImage64 } from '../types.js';
import { writeChunkDataFn } from '../write.js';

const enum Constants {
  DataLength = 13
}

export function encodeChunk(
  ctx: IEncodeContext,
  image: Readonly<IImage32> | Readonly<IImage64>
): Uint8Array {
  const pixelCount = image.width * image.height;
  const indexCount = pixelCount * 4;

  switch (ctx.colorType) {
    case ColorType.Grayscale: {
      // Find the first pixel with non 255 alpha and use it
      let i = 0;
      for (; i < indexCount; i += 4) {
        if (image.data[i    ] < 255) {
          break;
        }
      }
      return writeChunkDataFn('tRNS', 2, stream => {
        stream.writeUint16(image.data[i]);
      });
    }
    case ColorType.Indexed: {
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
      // TODO: Track first non-alpha pixel in context
      // Find the first pixel with non 255 alpha and use it
      let i = 0;
      for (; i < indexCount; i += 4) {
        if (image.data[i + 3] < 255) {
          break;
        }
      }
      return writeChunkDataFn('tRNS', 6, stream => {
        stream.writeUint16(image.data[i    ]);
        stream.writeUint16(image.data[i + 1]);
        stream.writeUint16(image.data[i + 2]);
      });
    }
    default:
      throw new Error(`Cannot encode tRNS chunk for color type "${ctx.colorType}"`);
  }
}
