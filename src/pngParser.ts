/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { convert16BitTo8BitData } from './array.js';
import { assert1b, ChunkError, handleWarning } from './assert.js';
import { parseChunk_IDAT } from './chunks/chunk_IDAT.js';
import { parseChunk_IEND } from './chunks/chunk_IEND.js';
import { parseChunk_IHDR } from './chunks/chunk_IHDR.js';
import { crc32 } from './crc32.js';
import { ChunkPartByteLength, IDecodedPng, IDecodePngOptions, IImage32, IImage64, IPartialDecodedPng, IPngChunk, IPngHeaderDetails, KnownChunkTypes, PngMetadata } from './types.js';

export function verifyPngSignature(dataView: DataView): void {
  if (dataView.byteLength < 7) {
    throw new Error(`Not enough bytes in file for png signature (${dataView.byteLength})`);
  }
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
  KnownChunkTypes.iCCP,
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

/**
 * All lazy chunk decoders are explicitly mapped here such that bundlers are able to bundle all
 * possible chunk decoders when code splitting is not supported.
 */
function getChunkDecoder(type: KnownChunkTypes): Promise<{ parseChunk: (header: IPngHeaderDetails, dataView: DataView, chunk: IPngChunk, decodedPng: IPartialDecodedPng, options: IDecodePngOptions | undefined) => PngMetadata }> {
  switch (type) {
    case KnownChunkTypes.bKGD: return import(`./chunks/chunk_bKGD.js`);
    case KnownChunkTypes.cHRM: return import(`./chunks/chunk_cHRM.js`);
    case KnownChunkTypes.eXIf: return import(`./chunks/chunk_eXIf.js`);
    case KnownChunkTypes.gAMA: return import(`./chunks/chunk_gAMA.js`);
    case KnownChunkTypes.hIST: return import(`./chunks/chunk_hIST.js`);
    case KnownChunkTypes.iCCP: return import(`./chunks/chunk_iCCP.js`);
    case KnownChunkTypes.iTXt: return import(`./chunks/chunk_iTXt.js`);
    case KnownChunkTypes.tIME: return import(`./chunks/chunk_tIME.js`);
    case KnownChunkTypes.pHYs: return import(`./chunks/chunk_pHYs.js`);
    case KnownChunkTypes.sBIT: return import(`./chunks/chunk_sBIT.js`);
    case KnownChunkTypes.sPLT: return import(`./chunks/chunk_sPLT.js`);
    case KnownChunkTypes.sRGB: return import(`./chunks/chunk_sRGB.js`);
    case KnownChunkTypes.tEXt: return import(`./chunks/chunk_tEXt.js`);
    case KnownChunkTypes.tRNS: return import(`./chunks/chunk_tRNS.js`);
    case KnownChunkTypes.zTXt: return import(`./chunks/chunk_zTXt.js`);
    default: throw new Error(`Could not get decoder for chunk type "${type}"`);
  }
}

export async function decodePng(data: Readonly<Uint8Array>, options?: IDecodePngOptions): Promise<IDecodedPng<IImage32 | IImage64>> {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const result: IPartialDecodedPng = {
    image: undefined,
    palette: undefined,
    metadata: [],
    parsedChunks: new Set(),
    warnings: []
  };

  // Verify file header, throwing if it's invalid
  verifyPngSignature(view);

  // Read chunks
  const chunks = readChunks(view, result, options);

  // Parse the header
  const header = parseChunk_IHDR(view, chunks[0], result, options);

  // Load supported chunks to read
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
          data: parseChunk_IDAT(header, view, dataChunks, result, options) as any
        };
        break;
      }
      case KnownChunkTypes.PLTE:
        result.palette = (await import(`./chunks/chunk_PLTE.js`)).parseChunk(header, view, chunk, result, options);
        break;
      case KnownChunkTypes.IEND:
        parseChunk_IEND(header, view, chunk, result, options);
        break;
      default:
        if (parseChunkTypes.includes(chunk.type)) {
          try {
            result.metadata.push((await getChunkDecoder(chunk.type as KnownChunkTypes)).parseChunk(header, view, chunk, result, options));
          } catch (e: any) {
            // TODO: Check Error type, re-throw if unexpected
            handleWarning(e as Error, result.warnings, options?.strictMode);
          }
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
    details: {
      bitDepth: header.bitDepth,
      colorType: header.colorType,
      interlaceMethod: header.interlaceMethod
    },
    palette: result.palette,
    metadata: result.metadata.length > 0 ? result.metadata : undefined,
    rawChunks: chunks,
    warnings: result.warnings
  };
}

export function readChunks(dataView: DataView, decoded: IPartialDecodedPng, options: IDecodePngOptions | undefined): IPngChunk[] {
  const chunks: IPngChunk[] = [];
  // The first chunk always starts at offset 8, after the fixed size header
  let offset = 8;
  let hasData = false;
  while (offset < dataView.byteLength) {
    const chunk = readChunk(dataView, offset, decoded, options);
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
    handleWarning(new Error('Last chunk is not IEND'), decoded.warnings, options?.strictMode);
  }
  if (!hasData) {
    throw new Error('No IDAT chunk');
  }
  return chunks;
}

export function readChunk(dataView: DataView, offset: number, decoded: IPartialDecodedPng, options: IDecodePngOptions | undefined): IPngChunk {
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
    handleWarning(new Error(`CRC for chunk "${type}" at offset 0x${offset.toString(16)} doesn't match (0x${actualCrc.toString(16)} !== 0x${expectedCrc.toString(16)})`), decoded.warnings, options?.strictMode);
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
