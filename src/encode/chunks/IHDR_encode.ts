/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { IEncodeContext, IImage32, IImage64 } from '../../shared/types.js';
import { writeChunkDataFn } from '../write.js';

const enum Constants {
  DataLength = 13
}

export function encodeChunk(
  ctx: IEncodeContext,
  image: Readonly<IImage32> | Readonly<IImage64>
): Uint8Array {
  if (image.width <= 0 || image.height <= 0) {
    throw new Error(`Invalid dimensions ${image.width}x${image.height}`);
  }
  return writeChunkDataFn('IHDR', Constants.DataLength, stream => {
    // Dimensions
    stream.writeUint32(image.width);
    stream.writeUint32(image.height);
    // Bit depth
    stream.writeUint8(ctx.bitDepth);
    // Color type
    stream.writeUint8(ctx.colorType);
    // Compression method (only 0 is valid)
    stream.writeUint8(0);
    // Filter method (only 0 is valid)
    stream.writeUint8(0);
    // Interlace method
    stream.writeUint8(ctx.interlaceMethod);
  });
}
