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
  const colorSet = new Set<number>();
  const transparentColorSet = new Set<number>();

  // // Get the number of rgb colors and the number of transparent colors in the image
  // let rgbId = 0;
  // let rgbaId = 0;
  // for (let i = 0; i < indexCount; i += 4) {
  //   rgbId = (
  //     image.data[i    ] << 24 |
  //     image.data[i    ] << 16 |
  //     image.data[i    ] <<  8
  //   );
  //   if (image.data[i    ] < 255) {
  //     rgbaId = (
  //       rgbId |
  //       image.data[i    ]
  //     );
  //     transparentColorSet.add(rgbaId);
  //   }
  //   colorSet.add(rgbId);
  // }


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
      const colorSet = new Set<number>();
      return writeChunkDataFn('tRNS', ctx.palette.size, stream => {
        let rgbaId = 0;
        for (let i = 0; i < indexCount; i += 4) {
          rgbaId = (
            image.data[i    ] << 24 |
            image.data[i + 1] << 16 |
            image.data[i + 2] <<  8 |
            image.data[i + 3]
          );
          if (!colorSet.has(rgbaId)) {
            stream.writeUint8(image.data[i + 3]);
            colorSet.add(rgbaId);
          }
        }
      });
    }
    case ColorType.Truecolor: {
      // Find the first pixel with non 255 alpha and use it
      let i = 0;
      for (; i < indexCount; i += 4) {
        if (image.data[i    ] < 255) {
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
  const channelsForColorType = getChannelsForColorType(ctx.colorType);
  const dataLength = ctx.transparentColorCount * channelsForColorType;


  return writeChunkDataFn('tRNS', Constants.DataLength, stream => {
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
