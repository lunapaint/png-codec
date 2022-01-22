/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { convert16BitTo8BitData } from './array.js';
import { createChunkDecodeWarning, DecodeError, DecodeWarning, handleWarning } from './assert.js';
import { parseChunk as parseChunkIDAT } from './chunks/chunk_IDAT.js';
import { parseChunk as parseChunkIEND } from './chunks/chunk_IEND.js';
import { parseChunk as parseChunkIHDR } from './chunks/chunk_IHDR.js';
import { crc32 } from './crc32.js';
import { ChunkPartByteLength, IDecodedPng, IDecodePngOptions, IImage32, IImage64, IDecodeContext, IPngChunk, IPngHeaderDetails, KnownChunkTypes, PngMetadata } from './types.js';

export function verifyPngSignature(ctx: Pick<IDecodeContext, 'view' | 'warnings'>): void {
  if (ctx.view.byteLength < 7) {
    throw new DecodeError(ctx, `Not enough bytes in file for png signature (${ctx.view.byteLength})`, 0);
  }
  const isCorrect = (
    ctx.view.getUint8(0) === 0x89 &&
    ctx.view.getUint8(1) === 0x50 &&
    ctx.view.getUint8(2) === 0x4E &&
    ctx.view.getUint8(3) === 0x47 &&
    ctx.view.getUint8(4) === 0x0D &&
    ctx.view.getUint8(5) === 0x0A &&
    ctx.view.getUint8(6) === 0x1A &&
    ctx.view.getUint8(7) === 0x0A
  );
  if (!isCorrect) {
    const actual = formatHexAssertion(Array.from(new Uint8Array(ctx.view.buffer).slice(ctx.view.byteOffset, ctx.view.byteOffset + 8)));
    const expected = formatHexAssertion([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    throw new DecodeError(ctx, `Png signature is not correct (${actual} !== ${expected})`, 0);
  }
}

function formatHexAssertion(actual: number[]) {
  return `0x${actual.map(e => e.toString(16).padStart(2, '0')).join('')}`;
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
  KnownChunkTypes.oFFs,
  KnownChunkTypes.pCAL,
  KnownChunkTypes.pHYs,
  KnownChunkTypes.sBIT,
  KnownChunkTypes.sCAL,
  KnownChunkTypes.sPLT,
  KnownChunkTypes.sRGB,
  KnownChunkTypes.sTER,
  KnownChunkTypes.tEXt,
  KnownChunkTypes.tRNS,
  KnownChunkTypes.zTXt,
]);

/**
 * All lazy chunk decoders are explicitly mapped here such that bundlers are able to bundle all
 * possible chunk decoders when code splitting is not supported.
 */
function getChunkDecoder(type: KnownChunkTypes): Promise<{ parseChunk: (ctx: IDecodeContext, header: IPngHeaderDetails, chunk: IPngChunk) => PngMetadata }> {
  switch (type) {
    case KnownChunkTypes.bKGD: return import(`./chunks/chunk_bKGD.js`);
    case KnownChunkTypes.cHRM: return import(`./chunks/chunk_cHRM.js`);
    case KnownChunkTypes.eXIf: return import(`./chunks/chunk_eXIf.js`);
    case KnownChunkTypes.gAMA: return import(`./chunks/chunk_gAMA.js`);
    case KnownChunkTypes.hIST: return import(`./chunks/chunk_hIST.js`);
    case KnownChunkTypes.iCCP: return import(`./chunks/chunk_iCCP.js`);
    case KnownChunkTypes.iTXt: return import(`./chunks/chunk_iTXt.js`);
    case KnownChunkTypes.tIME: return import(`./chunks/chunk_tIME.js`);
    case KnownChunkTypes.oFFs: return import(`./chunks/chunk_oFFs.js`);
    case KnownChunkTypes.pCAL: return import(`./chunks/chunk_pCAL.js`);
    case KnownChunkTypes.pHYs: return import(`./chunks/chunk_pHYs.js`);
    case KnownChunkTypes.sBIT: return import(`./chunks/chunk_sBIT.js`);
    case KnownChunkTypes.sCAL: return import(`./chunks/chunk_sCAL.js`);
    case KnownChunkTypes.sPLT: return import(`./chunks/chunk_sPLT.js`);
    case KnownChunkTypes.sRGB: return import(`./chunks/chunk_sRGB.js`);
    case KnownChunkTypes.sTER: return import(`./chunks/chunk_sTER.js`);
    case KnownChunkTypes.tEXt: return import(`./chunks/chunk_tEXt.js`);
    case KnownChunkTypes.tRNS: return import(`./chunks/chunk_tRNS.js`);
    case KnownChunkTypes.zTXt: return import(`./chunks/chunk_zTXt.js`);
    default:
      // Throw a regular error as this is unexpected
      throw new Error(`Could not get decoder for chunk type "${type}"`);
  }
}

export async function decodePng(data: Readonly<Uint8Array>, options: IDecodePngOptions = {}): Promise<IDecodedPng<IImage32 | IImage64>> {
  const ctx: IDecodeContext = {
    view: new DataView(data.buffer, data.byteOffset, data.byteLength),
    image: undefined,
    palette: undefined,
    metadata: [],
    parsedChunks: new Set(),
    warnings: [],
    info: [],
    options
  };

  // Verify file header, throwing if it's invalid
  verifyPngSignature(ctx);

  // Read chunks
  const chunks = readChunks(ctx);

  // Parse the header
  const header = parseChunkIHDR(ctx, chunks[0]);

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
      case KnownChunkTypes.IHDR:
        handleWarning(ctx, createChunkDecodeWarning(chunk, `Multiple IHDR chunks not allowed`, chunk.offset + ChunkPartByteLength.Length));
        break;
      case KnownChunkTypes.IDAT: {
        const dataChunks = [chunk];
        // Gather all consecutive IDAT entries
        while (chunks.length > i + 1 && chunks[i + 1].type === KnownChunkTypes.IDAT) {
          dataChunks.push(chunks[++i]);
        }
        ctx.image = {
          width: header.width,
          height: header.height,
          // HACK: Not sure why TS doesn't like unioned typed arrays
          data: parseChunkIDAT(ctx, header, dataChunks) as any
        };
        break;
      }
      case KnownChunkTypes.PLTE:
        ctx.palette = (await import(`./chunks/chunk_PLTE.js`)).parseChunk(ctx, header, chunk);
        break;
      case KnownChunkTypes.IEND:
        parseChunkIEND(ctx, header, chunk);
        break;
      default:
        if (parseChunkTypes.includes(chunk.type)) {
          try {
            ctx.metadata.push((await getChunkDecoder(chunk.type as KnownChunkTypes)).parseChunk(ctx, header, chunk));
          } catch (e: unknown) {
            if (e instanceof DecodeWarning) {
              handleWarning(ctx, e);
            } else {
              // Re-throw decode errors or unexpected errors
              throw e;
            }
          }
        } else {
          if (!allLazyChunkTypes.includes(chunk.type)) {
            if (!chunk.isAncillary) {
              throw new DecodeError(ctx, `Unrecognized critical chunk type "${chunk.type}"`, chunk.offset + ChunkPartByteLength.Length);
            } else {
              ctx.info.push(`Unrecognized chunk type "${chunk.type}"`);
            }
          }
        }
        break;
    }
    ctx.parsedChunks.add(chunk.type);
  }

  // Validation
  if (!ctx.image) {
    throw new DecodeError(ctx, 'Failed to decode, no IDAT chunk', 0);
  }

  // Convert to a 32-bit image if required
  if (options && options.force32 && ctx.image.data.BYTES_PER_ELEMENT === 2) {
    ctx.image.data = convert16BitTo8BitData((ctx.image as IImage64).data);
  }

  return {
    image: ctx.image,
    details: {
      bitDepth: header.bitDepth,
      colorType: header.colorType,
      interlaceMethod: header.interlaceMethod
    },
    palette: ctx.palette,
    metadata: ctx.metadata.length > 0 ? ctx.metadata : undefined,
    rawChunks: chunks,
    warnings: ctx.warnings,
    info: ctx.info
  };
}

export function readChunks(ctx: IDecodeContext): IPngChunk[] {
  const chunks: IPngChunk[] = [];
  // The first chunk always starts at offset 8, after the fixed size header
  let offset = 8;
  let hasData = false;
  while (offset < ctx.view.byteLength) {
    const chunk = readChunk(ctx, offset);
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
    throw new DecodeError(ctx, `First chunk is not IHDR`, chunks[0].offset + ChunkPartByteLength.Type);
  }
  if (chunks[chunks.length - 1].type !== KnownChunkTypes.IEND) {
    handleWarning(ctx, new DecodeError(ctx, 'Last chunk is not IEND', chunks[chunks.length - 1].offset + ChunkPartByteLength.Type));
  }
  if (!hasData) {
    throw new DecodeError(ctx, 'No IDAT chunk', 0);
  }
  return chunks;
}

export function readChunk(ctx: IDecodeContext, offset: number): IPngChunk {
  if (ctx.view.byteLength < offset + ChunkPartByteLength.Length) {
    throw new DecodeError(ctx, `EOF while reading chunk length`, offset);
  }

  const dataLength = ctx.view.getUint32(offset);
  if (ctx.view.byteLength < offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type) {
    throw new DecodeError(ctx, `EOF while reading chunk type`, offset);
  }

  const type = String.fromCharCode(
    ctx.view.getUint8(offset + 4),
    ctx.view.getUint8(offset + 5),
    ctx.view.getUint8(offset + 6),
    ctx.view.getUint8(offset + 7)
  );
  if (ctx.view.byteLength < offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type + dataLength + ChunkPartByteLength.CRC) {
    throw new DecodeError(ctx, `EOF while reading chunk "${type}"`, offset);
  }

  // Verify crc
  const actualCrc = ctx.view.getUint32(offset + ChunkPartByteLength.Length + ChunkPartByteLength.Type + dataLength) >>> 0;
  const expectedCrc = crc32(ctx.view, offset + ChunkPartByteLength.Length, ChunkPartByteLength.Type + dataLength);
  if (actualCrc !== expectedCrc) {
    handleWarning(ctx, new DecodeWarning(`CRC for chunk "${type}" at offset 0x${offset.toString(16)} doesn't match (0x${actualCrc.toString(16)} !== 0x${expectedCrc.toString(16)})`, offset));
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
