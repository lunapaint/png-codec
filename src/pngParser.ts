/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { convert16BitTo8BitData } from './array.js';
import { assert1b, ChunkError } from './assert.js';
import { parseChunk_IDAT } from './chunks/chunk_IDAT.js';
import { parseChunk_IEND } from './chunks/chunk_IEND.js';
import { parseChunk_IHDR } from './chunks/chunk_IHDR.js';
import { crc32 } from './crc32.js';
import { ChunkPartByteLength, IDecodePngOptions, IImage32, IImage64, IPartialDecodedPng, IPngChunk, KnownChunkTypes, PngMetadata } from './types.js';

export function verifyPngSignature(dataView: DataView): void {
  assert1b(dataView, 0, 0x89);
  assert1b(dataView, 1, 0x50);
  assert1b(dataView, 2, 0x4E);
  assert1b(dataView, 3, 0x47);
  assert1b(dataView, 4, 0x0D);
  assert1b(dataView, 5, 0x0A);
  assert1b(dataView, 6, 0x1A);
  assert1b(dataView, 7, 0x0A);
}

const defaultLazyChunkTypes: ReadonlyArray<string> = Object.freeze([
  KnownChunkTypes.tRNS,
]);

const allLazyChunkTypes: ReadonlyArray<string> = Object.freeze([
  KnownChunkTypes.bKGD,
  KnownChunkTypes.cHRM,
  KnownChunkTypes.eXIf,
  KnownChunkTypes.gAMA,
  KnownChunkTypes.hIST,
  KnownChunkTypes.iTXt,
  KnownChunkTypes.tIME,
  KnownChunkTypes.pHYs,
  KnownChunkTypes.sBIT,
  KnownChunkTypes.sPLT,
  KnownChunkTypes.sRGB,
  KnownChunkTypes.tEXt,
  KnownChunkTypes.tRNS,
  KnownChunkTypes.zTXt,
]);

export async function decodePng(data: Readonly<Uint8Array>, options?: IDecodePngOptions): Promise<{ image: IImage32 | IImage64, metadata?: PngMetadata[], rawChunks: IPngChunk[] }> {
  const view = new DataView(data.buffer);

  // Verify file header, throwing if it's invalid
  verifyPngSignature(view);

  // Read chunks
  const chunks = readChunks(view);

  // Parse the header
  const header = parseChunk_IHDR(view, chunks[0]);

  let parseChunkTypes: ReadonlyArray<string>;
  if (options && options.parseChunkTypes) {
    if (options.parseChunkTypes === '*') {
      parseChunkTypes = allLazyChunkTypes;
    } else {
      parseChunkTypes = defaultLazyChunkTypes.concat(options.parseChunkTypes);
    }
  } else {
    parseChunkTypes = defaultLazyChunkTypes;
  }

  // Parse the chunks
  const result: IPartialDecodedPng = {
    image: undefined,
    palette: undefined,
    metadata: [],
    parsedChunks: new Set()
  };
  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];
    switch (chunk.type) {
      case KnownChunkTypes.IDAT: {
        const dataChunks = [chunk];
        // Gather all consecutive IDAT entries
        while (chunks.length > i + 1 && chunks[i + 1].type === KnownChunkTypes.IDAT) {
          dataChunks.push(chunks[++i]);
        }
        result.image = {
          width: header.width,
          height: header.height,
          // HACK: Not sure why TS doesn't like unioned typed arrays
          data: parseChunk_IDAT(header, view, dataChunks, result) as any
        };
        break;
      }
      case KnownChunkTypes.PLTE:
        result.palette = (await import(`./chunks/chunk_${chunk.type}.js`)).parseChunk(header, view, chunk, result);
        break;
      case KnownChunkTypes.IEND:
        if (i < chunks.length - 1) {
          throw new ChunkError(chunk, 'Chunk is not last');
        }
        parseChunk_IEND(header, view, chunk, result);
        break;
      default:
        if (parseChunkTypes.includes(chunk.type)) {
          result.metadata.push((await import(`./chunks/chunk_${chunk.type}.js`)).parseChunk(header, view, chunk, result));
        } else {
          if (!allLazyChunkTypes.includes(chunk.type)) {
            // TODO: Return as a problem
            console.warn(`Unrecognized chunk type "${chunk.type}"`);
          }
        }
        break;
    }
    result.parsedChunks.add(chunk.type);
  }

  // Validation
  if (!result.image) {
    throw new Error('Failed to decode, no IDAT');
  }

  // Convert to a 32-bit image if required
  if (options && options.force32 && result.image.data.BYTES_PER_ELEMENT === 2) {
    result.image.data = convert16BitTo8BitData((result.image as IImage64).data);
  }

  return {
    image: result.image,
    metadata: result.metadata.length > 0 ? result.metadata : undefined,
    rawChunks: chunks
  };
}

export function readChunks(dataView: DataView): IPngChunk[] {
  const chunks: IPngChunk[] = [];
  // The first chunk always starts at offset 8, after the fixed size header
  let offset = 8;
  let hasData = false;
  while (offset < dataView.byteLength) {
    const chunk = readChunk(dataView, offset);
    // Chunk layout:
    // 4B: Length (l)
    // 4B: Type
    // lB: Data
    // 4B: CRC
    offset += ChunkPartByteLength.Length + ChunkPartByteLength.Type + chunk.dataLength + ChunkPartByteLength.CRC;
    chunks.push(chunk);

    hasData ||= chunk.type === KnownChunkTypes.IDAT;
  }
  if (chunks[0].type !== KnownChunkTypes.IHDR) {
    throw new Error(`First chunk is not IHDR`);
  }
  if (chunks[chunks.length - 1].type !== KnownChunkTypes.IEND) {
    throw new Error('Last chunk is not IEND');
  }
  if (!hasData) {
    throw new Error('No IDAT chunk');
  }
  return chunks;
}

export function readChunk(dataView: DataView, offset: number): IPngChunk {
  if (dataView.byteLength < offset + ChunkPartByteLength.Length) {
    throw new Error(`EOF while reading chunk length for chunk starting at offset ${offset}`);
  }

  const dataLength = dataView.getUint32(offset);
  if (dataView.byteLength < offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type) {
    throw new Error(`EOF while reading chunk type for chunk starting at offset ${offset}`);
  }

  const type = String.fromCharCode(
    dataView.getUint8(offset + 4),
    dataView.getUint8(offset + 5),
    dataView.getUint8(offset + 6),
    dataView.getUint8(offset + 7)
  );
  if (dataView.byteLength < offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type + dataLength + ChunkPartByteLength.CRC) {
    throw new Error(`EOF while reading chunk "${type}" starting at offset ${offset}`);
  }

  // Verify crc
  const actualCrc = dataView.getUint32(offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type + dataLength) >>> 0;
  const expectedCrc = crc32(dataView, offset + ChunkPartByteLength.Length, ChunkPartByteLength.Type + dataLength);
  if (actualCrc !== expectedCrc) {
    // TODO: Warn by returning problem when crc doesn't match
    throw new Error(`CRC for chunk "${type}" at offset 0x${offset.toString(16)} doesn't match (0x${actualCrc.toString(16)} !== 0x${expectedCrc.toString(16)})`);
  }

  return {
    offset,
    type,
    dataLength,
    isAncillary: isCharLowercase(type, 0),
    isPrivate: isCharLowercase(type, 1),
    isSafeToCopy: isCharLowercase(type, 3)
  };
}

function isCharLowercase(text: string, index: number): boolean {
  return !!(text.charCodeAt(index) & 32);
}
