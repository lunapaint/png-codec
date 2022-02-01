/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { ByteStream } from '../byteStream.js';
import { crc32 } from '../crc32.js';
import { BitDepth, ChunkPartByteLength, ColorType, IImage32, IImage64, InterlaceMethod } from '../types.js';
import { writeChunkType } from '../write.js';
import * as pako from 'pako';

export function encodeChunk(
  image: Readonly<IImage32> | Readonly<IImage64>,
  bitDepth: BitDepth,
  colorType: ColorType,
  interlaceMethod: InterlaceMethod
): Uint8Array {
  // First generate the uncompressed data
  const dataStreamLength = calculateDataLength(image, bitDepth, colorType, interlaceMethod);
  const dataStream = new ByteStream(dataStreamLength);
  writeUncompressedData(dataStream, image, bitDepth, colorType, interlaceMethod);

  // TODO: Compress the data
  const compressed = pako.deflate(dataStream.array);
  console.log('uncompressed', dataStream.array, 'compressed', compressed);


  // Construct the final chunk
  const dataLength = compressed.length;
  const streamLength = ChunkPartByteLength.Length + ChunkPartByteLength.Length + dataLength + ChunkPartByteLength.CRC;

  const stream = new ByteStream(streamLength);

  // TODO: Refactor generalized creating chunks into write.ts

  // Data length
  stream.writeUint32(dataLength);

  // Chunk type
  writeChunkType(stream, 'IDAT');

  // Data
  stream.writeArray(compressed);

  // CRC
  stream.writeUint32(crc32(stream.view, ChunkPartByteLength.Length, ChunkPartByteLength.Type + dataLength));

  // Validation
  stream.assertAtEnd();

  return stream.array;
}

function calculateDataLength(
  image: Readonly<IImage32> | Readonly<IImage64>,
  bitDepth: BitDepth,
  colorType: ColorType,
  interlaceMethod: InterlaceMethod
): number {
  // Temporary assertions to throw for unsupported config
  if (bitDepth !== 8) {
    throw new Error('Only bit depth 8 is supported currently');
  }
  if (colorType !== ColorType.Truecolor) {
    throw new Error('Only color type truecolor is supported currently');
  }
  if (interlaceMethod !== InterlaceMethod.None) {
    throw new Error('Only interlace method 0 is supported currently');
  }

  const channels = 3;
  const bytesPerPixel = channels * 1;
  const bytesPerLine = /*Filter type*/1 + bytesPerPixel * image.width;

  const bytesAllLines = bytesPerLine * image.height;

  return bytesAllLines;
}

function writeUncompressedData(
  stream: ByteStream,
  image: Readonly<IImage32> | Readonly<IImage64>,
  bitDepth: BitDepth,
  colorType: ColorType,
  interlaceMethod: InterlaceMethod
) {
  let y = 0;
  let x = 0;
  let i = 0;
  for (; y < image.height; y++) {
    // Filter type
    stream.writeUint8(0);

    // Data
    for (x = 0; x < image.width; x++) {
      // TODO: Make a simple increment
      i = (y * image.width + x) * 4;
      stream.writeUint8(image.data[i    ]);
      stream.writeUint8(image.data[i + 1]);
      stream.writeUint8(image.data[i + 2]);
    }
  }
}
