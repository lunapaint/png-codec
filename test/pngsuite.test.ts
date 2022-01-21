/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { IPngMetadataSuggestedPaletteEntry } from '../typings/api';
import { createTests } from './testUtil.js';

const pngSuiteRoot = 'test/pngsuite/png';

/**
 * Generate PngSuite suggested palette, note that both 8 bit and 16 bit palettes are the same in the
 * files, just they are encoded using different sample depths.
 */
function generateSuggestedPalette(): IPngMetadataSuggestedPaletteEntry[] {
  const entries: IPngMetadataSuggestedPaletteEntry[] = [];
  for (let r = 0; r < 256; r += 51) {
    for (let g = 0; g < 256; g += 51) {
      for (let b = 0; b < 256; b += 51) {
        entries.push({ red: r, green: g, blue: b, alpha: 255, frequency: 0 });
      }
    }
  }
  return entries;
}

describe('PngSuite', () => {
  describe('Basic formats', () => {
    createTests([
      ['basn0g01', 'black & white'],
      ['basn0g02', '2 bit (4 level) grayscale'],
      ['basn0g04', '4 bit (16 level) grayscale'],
      ['basn0g08', '8 bit (256 level) grayscale'],
      ['basn0g16', '16 bit (64k level) grayscale'],
      ['basn0g16', '16 bit (64k level) grayscale [converted to 8 bit]', { forceBitDepth8: true, customFile: 'basn0g16_to8' }],
      ['basn2c08', '3x8 bits rgb color'],
      ['basn2c16', '3x16 bits rgb color'],
      ['basn2c16', '3x16 bits rgb color [converted to 8 bit]', { forceBitDepth8: true, customFile: 'basn2c16_to8' }],
      ['basn3p01', '1 bit (2 color) paletted'],
      ['basn3p02', '2 bit (4 color) paletted'],
      ['basn3p04', '4 bit (16 color) paletted'],
      ['basn3p08', '8 bit (256 color) paletted'],
      ['basn4a08', '8 bit grayscale + 8 bit alpha-channel'],
      ['basn4a16', '16 bit grayscale + 16 bit alpha-channel'],
      ['basn6a08', '3x8 bits rgb color + 8 bit alpha-channel'],
      ['basn6a16', '3x16 bits rgb color + 16 bit alpha-channel'],
    ], pngSuiteRoot);
  });
  describe('Interlacing', () => {
    createTests([
      ['basi0g01', 'black & white'],
      ['basi0g02', '2 bit (4 level) grayscale'],
      ['basi0g04', '4 bit (16 level) grayscale'],
      ['basi0g08', '8 bit (256 level) grayscale'],
      ['basi0g16', '16 bit (64k level) grayscale'],
      ['basi0g16', '16 bit (64k level) grayscale [converted to 8 bit]', { forceBitDepth8: true, customFile: 'basi0g16_to8' }],
      ['basi2c08', '3x8 bits rgb color'],
      ['basi2c16', '3x16 bits rgb color'],
      ['basi2c16', '3x16 bits rgb color [converted to 8 bit]', { forceBitDepth8: true, customFile: 'basi2c16_to8' }],
      ['basi3p01', '1 bit (2 color) paletted'],
      ['basi3p02', '2 bit (4 color) paletted'],
      ['basi3p04', '4 bit (16 color) paletted'],
      ['basi3p08', '8 bit (256 color) paletted'],
      ['basi4a08', '8 bit grayscale + 8 bit alpha-channel'],
      ['basi4a16', '16 bit grayscale + 16 bit alpha-channel'],
      ['basi6a08', '3x8 bits rgb color + 8 bit alpha-channel'],
      ['basi6a16', '3x16 bits rgb color + 16 bit alpha-channel'],
    ], pngSuiteRoot);
  });
  describe('Odd sizes', () => {
    createTests([
      ['s01i3p01', '1x1 paletted file, interlaced'],
      ['s01n3p01', '1x1 paletted file, no interlacing'],
      ['s02i3p01', '2x2 paletted file, interlaced'],
      ['s02n3p01', '2x2 paletted file, no interlacing'],
      ['s03i3p01', '3x3 paletted file, interlaced'],
      ['s03n3p01', '3x3 paletted file, no interlacing'],
      ['s04i3p01', '4x4 paletted file, interlaced'],
      ['s04n3p01', '4x4 paletted file, no interlacing'],
      ['s05i3p02', '5x5 paletted file, interlaced'],
      ['s05n3p02', '5x5 paletted file, no interlacing'],
      ['s06i3p02', '6x6 paletted file, interlaced'],
      ['s06n3p02', '6x6 paletted file, no interlacing'],
      ['s07i3p02', '7x7 paletted file, interlaced'],
      ['s07n3p02', '7x7 paletted file, no interlacing'],
      ['s08i3p02', '8x8 paletted file, interlaced'],
      ['s08n3p02', '8x8 paletted file, no interlacing'],
      ['s09i3p02', '9x9 paletted file, interlaced'],
      ['s09n3p02', '9x9 paletted file, no interlacing'],
      ['s32i3p04', '32x32 paletted file, interlaced'],
      ['s32n3p04', '32x32 paletted file, no interlacing'],
      ['s33i3p04', '33x33 paletted file, interlaced'],
      ['s33n3p04', '33x33 paletted file, no interlacing'],
      ['s34i3p04', '34x34 paletted file, interlaced'],
      ['s34n3p04', '34x34 paletted file, no interlacing'],
      ['s35i3p04', '35x35 paletted file, interlaced'],
      ['s35n3p04', '35x35 paletted file, no interlacing'],
      ['s36i3p04', '36x36 paletted file, interlaced'],
      ['s36n3p04', '36x36 paletted file, no interlacing'],
      ['s37i3p04', '37x37 paletted file, interlaced'],
      ['s37n3p04', '37x37 paletted file, no interlacing'],
      ['s38i3p04', '38x38 paletted file, interlaced'],
      ['s38n3p04', '38x38 paletted file, no interlacing'],
      ['s39i3p04', '39x39 paletted file, interlaced'],
      ['s39n3p04', '39x39 paletted file, no interlacing'],
      ['s40i3p04', '40x40 paletted file, interlaced'],
      ['s40n3p04', '40x40 paletted file, no interlacing'],
    ], pngSuiteRoot);
  });
  describe('Background colors', () => {
    createTests([
      ['bgai4a08', '8 bit grayscale, alpha, no background chunk, interlaced', { includesMetadata: { bKGD: undefined } }],
      ['bgai4a16', '16 bit grayscale, alpha, no background chunk, interlaced', { includesMetadata: { bKGD: undefined } }],
      ['bgai4a16', '16 bit grayscale, alpha, no background chunk, interlaced [converted to 8 bit]', { forceBitDepth8: true, customFile: 'bgai4a16_to8' }],
      ['bgan6a08', '3x8 bits rgb color, alpha, no background chunk', { includesMetadata: { bKGD: undefined } }],
      ['bgan6a16', '3x16 bits rgb color, alpha, no background chunk', { includesMetadata: { bKGD: undefined } }],
      ['bgan6a16', '3x16 bits rgb color, alpha, no background chunk [converted to 8 bit]', { forceBitDepth8: true, customFile: 'bgan6a16_to8' }],
      ['bgbn4a08', '8 bit grayscale, alpha, black background chunk', { includesMetadata: { bKGD: { type: 'bKGD', color: 0 } } }],
      ['bggn4a16', '16 bit grayscale, alpha, gray background chunk', { includesMetadata: { bKGD: { type: 'bKGD', color: 43908 } } }],
      ['bggn4a16', '16 bit grayscale, alpha, gray background chunk [converted to 8 bit]', { forceBitDepth8: true, customFile: 'bggn4a16_to8' }],
      ['bgwn6a08', '3x8 bits rgb color, alpha, white background chunk', { includesMetadata: { bKGD: { type: 'bKGD', color: [255, 255, 255] } } }],
      ['bgyn6a16', '3x16 bits rgb color, alpha, yellow background chunk', { includesMetadata: { bKGD: { type: 'bKGD', color: [65535, 65535, 0] } } }],
      ['bgyn6a16', '3x16 bits rgb color, alpha, yellow background chunk [converted to 8 bit]', { forceBitDepth8: true, customFile: 'bgyn6a16_to8' }],
    ], pngSuiteRoot);
  });
  describe('Transparency', () => {
    createTests([
      ['tbbn0g04', 'transparent, black background chunk', { ignoreTransparentHue: true }],
      ['tbbn2c16', 'transparent, blue background chunk', { ignoreTransparentHue: true }],
      ['tbbn2c16', 'transparent, blue background chunk [converted to 8 bit]', { forceBitDepth8: true, customFile: 'tbbn2c16_to8', ignoreTransparentHue: true }],
      ['tbbn3p08', 'transparent, black background chunk', { ignoreTransparentHue: true }],
      ['tbgn2c16', 'transparent, green background chunk', { ignoreTransparentHue: true }],
      ['tbgn2c16', 'transparent, green background chunk [converted to 8 bit]', { forceBitDepth8: true, customFile: 'tbgn2c16_to8', ignoreTransparentHue: true }],
      ['tbgn3p08', 'transparent, light-gray background chunk', { ignoreTransparentHue: true }],
      ['tbrn2c08', 'transparent, red background chunk', { ignoreTransparentHue: true }],
      ['tbwn0g16', 'transparent, white background chunk', { ignoreTransparentHue: true }],
      ['tbwn0g16', 'transparent, white background chunk [converted to 8 bit]', { forceBitDepth8: true, customFile: 'tbwn0g16_to8', ignoreTransparentHue: true }],
      ['tbwn3p08', 'transparent, white background chunk', { ignoreTransparentHue: true }],
      ['tbyn3p08', 'transparent, yellow background chunk', { ignoreTransparentHue: true }],
      ['tp0n0g08', 'not transparent for reference (logo on gray)', { ignoreTransparentHue: true }],
      ['tp0n2c08', 'not transparent for reference (logo on gray)', { ignoreTransparentHue: true }],
      ['tp0n3p08', 'not transparent for reference (logo on gray)', { ignoreTransparentHue: true }],
      ['tp1n3p08', 'transparent, but no background chunk', { ignoreTransparentHue: true }],
      ['tm3n3p02', 'multiple levels of transparency, 3 entries', { ignoreTransparentHue: true }],
    ], pngSuiteRoot);
  });
  describe('Gamma values', () => {
    createTests([
      ['g03n0g16', 'grayscale, file-gamma = 0.35', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 0.35 }] } }],
      ['g03n0g16', 'grayscale, file-gamma = 0.35 [converted to 8 bit]', { forceBitDepth8: true, customFile: 'g03n0g16_to8' }],
      ['g03n2c08', 'color, file-gamma = 0.35', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 0.35 }] } }],
      ['g03n3p04', 'paletted, file-gamma = 0.35', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 0.35 }] } }],
      ['g04n0g16', 'grayscale, file-gamma = 0.45', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 0.45 }] } }],
      ['g04n0g16', 'grayscale, file-gamma = 0.45 [converted to 8 bit]', { forceBitDepth8: true, customFile: 'g04n0g16_to8' }],
      ['g04n2c08', 'color, file-gamma = 0.45', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 0.45 }] } }],
      ['g04n3p04', 'paletted, file-gamma = 0.45', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 0.45 }] } }],
      ['g05n0g16', 'grayscale, file-gamma = 0.55', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 0.55 }] } }],
      ['g05n0g16', 'grayscale, file-gamma = 0.55 [converted to 8 bit]', { forceBitDepth8: true, customFile: 'g05n0g16_to8' }],
      ['g05n2c08', 'color, file-gamma = 0.55', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 0.55 }] } }],
      ['g05n3p04', 'paletted, file-gamma = 0.55', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 0.55 }] } }],
      ['g07n0g16', 'grayscale, file-gamma = 0.70', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 0.7 }] } }],
      ['g07n0g16', 'grayscale, file-gamma = 0.70 [converted to 8 bit]', { forceBitDepth8: true, customFile: 'g07n0g16_to8' }],
      ['g07n2c08', 'color, file-gamma = 0.70', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 0.7 }] } }],
      ['g07n3p04', 'paletted, file-gamma = 0.70', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 0.7 }] } }],
      ['g10n0g16', 'grayscale, file-gamma = 1.00', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 1 }] } }],
      ['g10n0g16', 'grayscale, file-gamma = 1.00 [converted to 8 bit]', { forceBitDepth8: true, customFile: 'g10n0g16_to8' }],
      ['g10n2c08', 'color, file-gamma = 1.00', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 1 }] } }],
      ['g10n3p04', 'paletted, file-gamma = 1.00', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 1 }] } }],
      ['g25n0g16', 'grayscale, file-gamma = 2.50', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 2.5 }] } }],
      ['g25n0g16', 'grayscale, file-gamma = 2.50 [converted to 8 bit]', { forceBitDepth8: true, customFile: 'g25n0g16_to8' }],
      ['g25n2c08', 'color, file-gamma = 2.50', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 2.5 }] } }],
      ['g25n3p04', 'paletted, file-gamma = 2.50', { includesMetadata: { gAMA: [{ type: 'gAMA', value: 2.5 }] } }],
    ], pngSuiteRoot);
  });
  describe('Image filtering', () => {
    createTests([
      ['f00n0g08', 'grayscale, no interlacing, filter-type 0'],
      ['f00n2c08', 'color, no interlacing, filter-type 0'],
      ['f01n0g08', 'grayscale, no interlacing, filter-type 1'],
      ['f01n2c08', 'color, no interlacing, filter-type 1'],
      ['f02n0g08', 'grayscale, no interlacing, filter-type 2'],
      ['f02n2c08', 'color, no interlacing, filter-type 2'],
      ['f03n0g08', 'grayscale, no interlacing, filter-type 3'],
      ['f03n2c08', 'color, no interlacing, filter-type 3'],
      ['f04n0g08', 'grayscale, no interlacing, filter-type 4'],
      ['f04n2c08', 'color, no interlacing, filter-type 4'],
      ['f99n0g04', 'bit-depth 4, filter changing per scanline'],
    ], pngSuiteRoot);
  });
  describe('Additional palettes', () => {
    createTests([
      ['pp0n2c16', 'six-cube palette-chunk in true-color image', { includesMetadata: { sPLT: undefined } }],
      ['pp0n2c16', 'six-cube palette-chunk in true-color image [converted to 8 bit]', { forceBitDepth8: true, customFile: 'pp0n2c16_to8' }],
      ['pp0n6a08', 'six-cube palette-chunk in true-color+alpha image', { includesMetadata: { sPLT: undefined } }],
      ['ps1n0g08', 'six-cube suggested palette (1 byte) in grayscale image', {
        includesMetadata: {
          sPLT: [
            {
              type: 'sPLT',
              name: 'six-cube',
              sampleDepth: 8,
              entries: generateSuggestedPalette()
            }
          ]
        }
      }],
      ['ps1n2c16', 'six-cube suggested palette (1 byte) in true-color image', {
        includesMetadata: {
          sPLT: [
            {
              type: 'sPLT',
              name: 'six-cube',
              sampleDepth: 8,
              entries: generateSuggestedPalette()
            }
          ]
        }
      }],
      ['ps1n2c16', 'six-cube suggested palette (1 byte) in true-color image [converted to 8 bit]', { forceBitDepth8: true, customFile: 'ps1n2c16_to8' }],
      ['ps2n0g08', 'six-cube suggested palette (2 bytes) in grayscale image', {
        includesMetadata: {
          sPLT: [
            {
              type: 'sPLT',
              name: 'six-cube',
              sampleDepth: 16,
              entries: generateSuggestedPalette()
            }
          ]
        }
      }],
      ['ps2n2c16', 'six-cube suggested palette (2 bytes) in true-color image', {
        includesMetadata: {
          sPLT: [
            {
              type: 'sPLT',
              name: 'six-cube',
              sampleDepth: 16,
              entries: generateSuggestedPalette()
            }
          ]
        }
      }],
      ['ps2n2c16', 'six-cube suggested palette (2 bytes) in true-color image [converted to 8 bit]', { forceBitDepth8: true, customFile: 'ps2n2c16_to8' }],
    ], pngSuiteRoot);
  });
  describe('Ancillary chunks', () => {
    createTests([
      ['ccwn2c08', 'chroma chunk w:0.3127,0.3290 r:0.64,0.33 g:0.30,0.60 b:0.15,0.06', {
        includesMetadata: {
          cHRM: {
            type: 'cHRM',
            whitePoint: {
              x: 0.3127,
              y: 0.329
            },
            red: {
              x: 0.64,
              y: 0.33
            },
            green: {
              x: 0.3,
              y: 0.6
            },
            blue: {
              x: 0.15,
              y: 0.06
            },
          }
        }
      }],
      ['ccwn3p08', 'chroma chunk w:0.3127,0.3290 r:0.64,0.33 g:0.30,0.60 b:0.15,0.06', {
        includesMetadata: {
          cHRM: {
            type: 'cHRM',
            whitePoint: {
              x: 0.3127,
              y: 0.329
            },
            red: {
              x: 0.64,
              y: 0.33
            },
            green: {
              x: 0.3,
              y: 0.6
            },
            blue: {
              x: 0.15,
              y: 0.06
            },
          }
        }
      }],
      ['cdfn2c08', 'physical pixel dimensions, 8x32 flat pixels', { includesMetadata: { pHYs: { type: 'pHYs', pixelsPerUnit: { x: 1, y: 4 }, unitType: 'unknown' } }, expectedDimensions: { width: 8, height: 32 } }],
      ['cdhn2c08', 'physical pixel dimensions, 32x8 high pixels', { includesMetadata: { pHYs: { type: 'pHYs', pixelsPerUnit: { x: 4, y: 1 }, unitType: 'unknown' } }, expectedDimensions: { width: 32, height: 8 } }],
      ['cdsn2c08', 'physical pixel dimensions, 8x8 square pixels', { includesMetadata: { pHYs: { type: 'pHYs', pixelsPerUnit: { x: 1, y: 1 }, unitType: 'unknown' } }, expectedDimensions: { width: 8, height: 8 } }],
      ['cdun2c08', 'physical pixel dimensions, 1000 pixels per 1 meter', { includesMetadata: { pHYs: { type: 'pHYs', pixelsPerUnit: { x: 1000, y: 1000 }, unitType: 'meter' } } }],
      ['ch1n3p04', 'histogram 15 colors', { includesMetadata: { hIST: { type: 'hIST', frequency: [64, 112, 48, 96, 96, 32, 32, 80, 16, 128, 64, 16, 48, 80, 112] } } }],
      ['ch2n3p08', 'histogram 256 colors', { includesMetadata: { hIST: { type: 'hIST', frequency: '4'.repeat(256).split('').map(e => parseInt(e)) } } }],
      ['cm0n0g04', 'modification time, 01-jan-2000 12:34:56', { includesMetadata: { tIME: { type: 'tIME', value: new Date(2000, 1, 1, 12, 34, 56) } } }],
      ['cm7n0g04', 'modification time, 01-jan-1970 00:00:00', { includesMetadata: { tIME: { type: 'tIME', value: new Date(1970, 1, 1, 0, 0, 0) } } }],
      ['cm9n0g04', 'modification time, 31-dec-1999 23:59:59', { includesMetadata: { tIME: { type: 'tIME', value: new Date(1999, 12, 31, 23, 59, 59) } } }],
      ['cs3n2c16', 'color, 13 significant bits', { includesMetadata: { sBIT: { type: 'sBIT', value: [13, 13, 13] } } }],
      ['cs3n2c16', 'color, 13 significant bits [converted to 8 bit]', { forceBitDepth8: true, customFile: 'cs3n2c16_to8' }],
      ['cs3n3p08', 'paletted, 3 significant bits', { includesMetadata: { sBIT: { type: 'sBIT', value: [3, 3, 3] } } }],
      ['cs5n2c08', 'color, 5 significant bits', { includesMetadata: { sBIT: { type: 'sBIT', value: [5, 5, 5] } } }],
      ['cs5n3p08', 'paletted, 5 significant bits', { includesMetadata: { sBIT: { type: 'sBIT', value: [5, 5, 5] } } }],
      ['cs8n2c08', 'color, 8 significant bits (reference)', { includesMetadata: { sBIT: undefined } }],
      ['cs8n3p08', 'paletted, 8 significant bits (reference)', { includesMetadata: { sBIT: undefined } }],
      ['ct0n0g04', 'no textual data', { includesMetadata: { tEXt: undefined } }],
      ['ct1n0g04', 'with textual data', {
        includesMetadata: {
          tEXt: [
            {
              keyword: 'Title',
              text: 'PngSuite',
              type: 'tEXt',
            },
            {
              keyword: 'Author',
              text: 'Willem A.J. van Schaik\n(willem@schaik.com)',
              type: 'tEXt',
            },
            {
              keyword: 'Copyright',
              text: 'Copyright Willem van Schaik, Singapore 1995-96',
              type: 'tEXt',
            },
            {
              keyword: 'Description',
              text: 'A compilation of a set of images created to test the\nvarious color-types of the PNG format. Included are\nblack&white, color, paletted, with alpha channel, with\ntransparency formats. All bit-depths allowed according\nto the spec are present.',
              type: 'tEXt',
            },
            {
              keyword: 'Software',
              text: 'Created on a NeXTstation color using "pnmtopng".',
              type: 'tEXt',
            },
            {
              keyword: 'Disclaimer',
              text: 'Freeware.',
              type: 'tEXt',
            }
          ]
        }
      }],
      ['ctzn0g04', 'with compressed textual data', {
        includesMetadata: {
          zTXt: [
            {
              keyword: 'Copyright',
              text: 'Copyright Willem van Schaik, Singapore 1995-96',
              type: 'zTXt',
            },
            {
              keyword: 'Description',
              text: 'A compilation of a set of images created to test the\nvarious color-types of the PNG format. Included are\nblack&white, color, paletted, with alpha channel, with\ntransparency formats. All bit-depths allowed according\nto the spec are present.',
              type: 'zTXt',
            },
            {
              keyword: 'Software',
              text: 'Created on a NeXTstation color using "pnmtopng".',
              type: 'zTXt',
            },
            {
              keyword: 'Disclaimer',
              text: 'Freeware.',
              type: 'zTXt',
            }
          ]
        }
      }],
      ['cten0g04', 'international UTF-8, english', {
        includesMetadata: {
          iTXt: [
            {
              keyword: 'Title',
              languageTag: 'en',
              text: 'PngSuite',
              translatedKeyword: 'Title',
              type: 'iTXt',
            },
            {
              keyword: 'Author',
              languageTag: 'en',
              text: 'Willem van Schaik (willem@schaik.com)',
              translatedKeyword: 'Author',
              type: 'iTXt',
            },
            {
              keyword: 'Copyright',
              languageTag: 'en',
              text: 'Copyright Willem van Schaik, Canada 2011',
              translatedKeyword: 'Copyright',
              type: 'iTXt',
            },
            {
              keyword: 'Description',
              languageTag: 'en',
              text: 'A compilation of a set of images created to test the various color-types of the PNG format. Included are black&white, color, paletted, with alpha channel, with transparency formats. All bit-depths allowed according to the spec are present.',
              translatedKeyword: 'Description',
              type: 'iTXt',
            },
            {
              keyword: 'Software',
              languageTag: 'en',
              text: 'Created on a NeXTstation color using "pnmtopng".',
              translatedKeyword: 'Software',
              type: 'iTXt',
            },
            {
              keyword: 'Disclaimer',
              languageTag: 'en',
              text: 'Freeware.',
              translatedKeyword: 'Disclaimer',
              type: 'iTXt',
            }
          ]
        }
      }],
      ['ctfn0g04', 'international UTF-8, finnish', {
        includesMetadata: {
          iTXt: [
            {
              keyword: 'Title',
              languageTag: 'fi',
              text: 'PngSuite',
              translatedKeyword: 'Otsikko',
              type: 'iTXt',
            },
            {
              keyword: 'Author',
              languageTag: 'fi',
              text: 'Willem van Schaik (willem@schaik.com)',
              translatedKeyword: 'Tekijä',
              type: 'iTXt',
            },
            {
              keyword: 'Copyright',
              languageTag: 'fi',
              text: 'Copyright Willem van Schaik, Kanada 2011',
              translatedKeyword: 'Tekijänoikeudet',
              type: 'iTXt',
            },
            {
              keyword: 'Description',
              languageTag: 'fi',
              text: 'kokoelma joukon kuvia luotu testata eri väri-tyyppisiä PNG-muodossa. Mukana on mustavalkoinen, väri, paletted, alpha-kanava, avoimuuden muodossa. Kaikki bit-syvyydessä mukaan sallittua spec on ​​läsnä.',
              translatedKeyword: 'Kuvaus',
              type: 'iTXt',
            },
            {
              keyword: 'Software',
              languageTag: 'fi',
              text: 'Luotu NeXTstation väriä "pnmtopng".',
              translatedKeyword: 'Ohjelmistot',
              type: 'iTXt',
            },
            {
              keyword: 'Disclaimer',
              languageTag: 'fi',
              text: 'Freeware.',
              translatedKeyword: 'Vastuuvapauslauseke',
              type: 'iTXt',
            }
          ]
        }
      }],
      ['ctgn0g04', 'international UTF-8, greek', {
        includesMetadata: {
          iTXt: [
            {
              keyword: 'Title',
              languageTag: 'el',
              text: 'PngSuite',
              translatedKeyword: 'Τίτλος',
              type: 'iTXt',
            },
            {
              keyword: 'Author',
              languageTag: 'el',
              text: 'Willem van Schaik (willem@schaik.com)',
              translatedKeyword: 'Συγγραφέας',
              type: 'iTXt',
            },
            {
              keyword: 'Copyright',
              languageTag: 'el',
              text: 'Πνευματικά δικαιώματα Schaik van Willem, Καναδάς 2011',
              translatedKeyword: 'Πνευματικά δικαιώματα',
              type: 'iTXt',
            },
            {
              keyword: 'Description',
              languageTag: 'el',
              text: 'Μια συλλογή από ένα σύνολο εικόνων που δημιουργήθηκαν για τη δοκιμή των διαφόρων χρωμάτων-τύπων του μορφή PNG. Περιλαμβάνονται οι ασπρόμαυρες, χρώμα, paletted, με άλφα κανάλι, με μορφές της διαφάνειας. Όλοι λίγο-βάθη επιτρέπεται σύμφωνα με το spec είναι παρόντες.',
              translatedKeyword: 'Περιγραφή',
              type: 'iTXt',
            },
            {
              keyword: 'Software',
              languageTag: 'el',
              text: 'Δημιουργήθηκε σε ένα χρώμα NeXTstation χρησιμοποιώντας "pnmtopng".',
              translatedKeyword: 'Λογισμικό',
              type: 'iTXt',
            },
            {
              keyword: 'Disclaimer',
              languageTag: 'el',
              text: 'Δωρεάν λογισμικό.',
              translatedKeyword: 'Αποποίηση',
              type: 'iTXt',
            }
          ]
        }
      }],
      ['cthn0g04', 'international UTF-8, hindi', {
        includesMetadata: {
          iTXt: [
            {
              keyword: 'Title',
              languageTag: 'hi',
              text: 'PngSuite',
              translatedKeyword: 'शीर्षक',
              type: 'iTXt',
            },
            {
              keyword: 'Author',
              languageTag: 'hi',
              text: 'Willem van Schaik (willem@schaik.com)',
              translatedKeyword: 'लेखक',
              type: 'iTXt',
            },
            {
              keyword: 'Copyright',
              languageTag: 'hi',
              text: 'कॉपीराइट Willem van Schaik, 2011 कनाडा',
              translatedKeyword: 'कॉपीराइट',
              type: 'iTXt',
            },
            {
              keyword: 'Description',
              languageTag: 'hi',
              text: 'करने के लिए PNG प्रारूप के विभिन्न रंग प्रकार परीक्षण बनाया छवियों का एक सेट का एक संकलन. शामिल काले और सफेद, रंग, पैलेटेड हैं, अल्फा चैनल के साथ पारदर्शिता स्वरूपों के साथ. सभी बिट गहराई कल्पना के अनुसार की अनुमति दी मौजूद हैं.',
              translatedKeyword: 'विवरण',
              type: 'iTXt',
            },
            {
              keyword: 'Software',
              languageTag: 'hi',
              text: 'एक NeXTstation "pnmtopng \'का उपयोग कर रंग पर बनाया गया.',
              translatedKeyword: 'सॉफ्टवेयर',
              type: 'iTXt',
            },
            {
              keyword: 'Disclaimer',
              languageTag: 'hi',
              text: 'फ्रीवेयर.',
              translatedKeyword: 'अस्वीकरण',
              type: 'iTXt',
            }
          ]
        }
      }],
      ['ctjn0g04', 'international UTF-8, japanese', {
        includesMetadata: {
          iTXt: [
            {
              keyword: 'Title',
              languageTag: 'ja',
              text: 'PngSuite',
              translatedKeyword: 'タイトル',
              type: 'iTXt',
            },
            {
              keyword: 'Author',
              languageTag: 'ja',
              text: 'Willem van Schaik (willem@schaik.com)',
              translatedKeyword: '著者',
              type: 'iTXt',
            },
            {
              keyword: 'Copyright',
              languageTag: 'ja',
              text: '著作権ウィレムヴァンシャイク、カナダ2011',
              translatedKeyword: '本文へ',
              type: 'iTXt',
            },
            {
              keyword: 'Description',
              languageTag: 'ja',
              text: 'PNG形式の様々な色の種類をテストするために作成されたイメージのセットのコンパイル。含まれているのは透明度のフォーマットで、アルファチャネルを持つ、白黒、カラー、パレットです。すべてのビット深度が存在している仕様に従ったことができました。',
              translatedKeyword: '概要',
              type: 'iTXt',
            },
            {
              keyword: 'Software',
              languageTag: 'ja',
              text: '"pnmtopng"を使用してNeXTstation色上に作成されます。',
              translatedKeyword: 'ソフトウェア',
              type: 'iTXt',
            },
            {
              keyword: 'Disclaimer',
              languageTag: 'ja',
              text: 'フリーウェア。',
              translatedKeyword: '免責事項',
              type: 'iTXt',
            }
          ]
        }
      }],
      ['exif2c08', 'chunk with jpeg exif data', { includesMetadata: { eXIf: e => e.type === 'eXIf' && e.value.byteLength === 978 } }],
    ], pngSuiteRoot);
  });
  describe('Chunk ordering', () => {
    createTests([
      ['oi1n0g16', 'grayscale mother image with 1 idat-chunk'],
      ['oi1n0g16', 'grayscale mother image with 1 idat-chunk [converted to 8 bit]', { forceBitDepth8: true, customFile: 'oi1n0g16_to8' }],
      ['oi1n2c16', 'color mother image with 1 idat-chunk'],
      ['oi1n2c16', 'color mother image with 1 idat-chunk [converted to 8 bit]', { forceBitDepth8: true, customFile: 'oi1n2c16_to8' }],
      ['oi2n0g16', 'grayscale image with 2 idat-chunks'],
      ['oi2n0g16', 'grayscale image with 2 idat-chunks [converted to 8 bit]', { forceBitDepth8: true, customFile: 'oi2n0g16_to8' }],
      ['oi2n2c16', 'color image with 2 idat-chunks'],
      ['oi2n2c16', 'color image with 2 idat-chunks [converted to 8 bit]', { forceBitDepth8: true, customFile: 'oi2n2c16_to8' }],
      ['oi4n0g16', 'grayscale image with 4 unequal sized idat-chunks'],
      ['oi4n0g16', 'grayscale image with 4 unequal sized idat-chunks [converted to 8 bit]', { forceBitDepth8: true, customFile: 'oi4n0g16_to8' }],
      ['oi4n2c16', 'color image with 4 unequal sized idat-chunks'],
      ['oi4n2c16', 'color image with 4 unequal sized idat-chunks [converted to 8 bit]', { forceBitDepth8: true, customFile: 'oi4n2c16_to8' }],
      ['oi9n0g16', 'grayscale image with all idat-chunks length one'],
      ['oi9n0g16', 'grayscale image with all idat-chunks length one [converted to 8 bit]', { forceBitDepth8: true, customFile: 'oi9n0g16_to8' }],
      ['oi9n2c16', 'color image with all idat-chunks length one'],
      ['oi9n2c16', 'color image with all idat-chunks length one [converted to 8 bit]', { forceBitDepth8: true, customFile: 'oi9n2c16_to8' }],
    ], pngSuiteRoot);
  });
  describe('Zlib compression level', () => {
    createTests([
      ['z00n2c08', 'color, no interlacing, compression level 0 (none)'],
      ['z03n2c08', 'color, no interlacing, compression level 3'],
      ['z06n2c08', 'color, no interlacing, compression level 6 (default)'],
      ['z09n2c08', 'color, no interlacing, compression level 9 (maximum)'],
    ], pngSuiteRoot);
  });
  describe('Corrupted files', () => {
    createTests([
      ['xs1n0g01', 'signature byte 1 MSBit reset to zero', { shouldThrow: true }],
      ['xs2n0g01', 'signature byte 2 is a \'Q\'', { shouldThrow: true }],
      ['xs4n0g01', 'signature byte 4 lowercase', { shouldThrow: true }],
      ['xs7n0g01', '7th byte a space instead of control-Z', { shouldThrow: true }],
      ['xcrn0g04', 'added cr bytes', { shouldThrow: true }],
      ['xlfn0g04', 'added lf bytes', { shouldThrow: true }],
      ['xhdn0g08', 'incorrect IHDR checksum', { shouldThrow: true, strictMode: true }],
      ['xhdn0g08', 'incorrect IHDR checksum', { expectedWarnings: ['CRC for chunk "IHDR" at offset 0x8 doesn\'t match (0x4353554d !== 0x56112528)'] }],
      ['xc1n0g08', 'color type 1', { shouldThrow: true }],
      ['xc9n2c08', 'color type 9', { shouldThrow: true }],
      ['xd0n2c08', 'bit-depth 0', { shouldThrow: true }],
      ['xd3n2c08', 'bit-depth 3', { shouldThrow: true }],
      ['xd9n2c08', 'bit-depth 99', { shouldThrow: true }],
      ['xdtn0g01', 'missing IDAT chunk', { shouldThrow: true }],
      ['xcsn0g01', 'incorrect IDAT checksum', { shouldThrow: true, strictMode: true }],
      ['xcsn0g01', 'incorrect IDAT checksum', { expectedWarnings: ['CRC for chunk "IDAT" at offset 0x31 doesn\'t match (0x4353554d !== 0xd02f14c9)'] }],
    ], pngSuiteRoot);
  });
});
