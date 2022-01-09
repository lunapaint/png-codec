import { deepStrictEqual, fail, ok, strictEqual } from 'assert';
import * as fs from 'fs';
import { createRequire } from 'module';
import { join } from 'path';
import { decodePng } from '../out/png.js';
import { PngMetadata } from '../typings/api';

const imageTestSuiteRoot = 'test/imagetestsuite/png';

// TODO: Move test functions into a shared helper file
interface ITestOptions {
  /**
   * Whether the test should throw, if this is a string the Error.message will be checked.
   */
  shouldThrow?: boolean | string;
  includesMetadata?: { [type: string]: PngMetadata | PngMetadata[] | ((e: PngMetadata) => boolean) | undefined };
  expectedDimensions?: { width: number, height: number };
  /**
   * Whether to skip the data assertion of the test, this is only meant to be used temporarily.
   *
   * TODO: Fix any usages of this allowance.
   */
  skipDataAssertion?: boolean;
  /**
   * A custom expected data file to load instead of the default test case name.
   */
  customFile?: string;
  /**
   * Whether to convert the image to bit depth 8.
   *
   * Additionally, this will allow 16-bit -> 8-bit conversion "rounding errors" in the data
   * assertion, +/-1 is allowed for all channels in the image. This happens because a different
   * algorithm was used to generate the .bmp/.json reference files. It's not so important to be
   * exact here as it the image fidelity was reduced and there's no canonical way of doing this.
   */
  forceBitDepth8?: boolean;
  /**
   * Ignore rgb channels when alpha is set to 0.
   *
   * TODO: Fix any usages of this allowance when hue information is retained.
   */
  ignoreTransparentHue?: boolean;
}

type TestCase = [name: string, description: string, skip?: boolean] | [name: string, description: string, options: ITestOptions];

function createTests(testCases: TestCase[], fixture: string) {
  for (const t of testCases) {
    const name = t[0];
    const description = t[1];
    const shouldSkip = typeof t[2] === 'boolean' ? t[2] : false;
    const options = typeof t[2] === 'object' ? t[2] : undefined;
    (shouldSkip ? it.skip : it)(`${name} - ${description}`, async () => {
      const data = new Uint8Array(await fs.promises.readFile(join(fixture, `${name}.png`)));
      if (options?.shouldThrow) {
        try {
          await decodePng(data, { parseChunkTypes: '*' });
        } catch (e: unknown) {
          if (typeof options.shouldThrow === 'string') {
            strictEqual((e as Error).message, options.shouldThrow);
          }
          return;
        }
        fail('Exception expected');
      }
      const decoded = await (options?.forceBitDepth8
        ? decodePng(data, { parseChunkTypes: '*', force32: true })
        : decodePng(data, { parseChunkTypes: '*' })
      );

      if (options?.includesMetadata) {
        ok(decoded.metadata);
        for (const expectedEntryType of Object.keys(options.includesMetadata)) {
          const expectedEntry = options.includesMetadata[expectedEntryType] as PngMetadata | PngMetadata[] | ((e: PngMetadata) => boolean);
          if (Array.isArray(expectedEntry)) {
            const actualEntries = decoded.metadata.filter(e => e.type === expectedEntryType) as PngMetadata[] | undefined;
            deepStrictEqual(actualEntries, expectedEntry);
          } else {
            const actualEntry = decoded.metadata.find(e => e.type === expectedEntryType) as PngMetadata | undefined;
            if (typeof expectedEntry === 'function') {
              ok(expectedEntry(actualEntry!));
            } else {
              deepStrictEqual(actualEntry, expectedEntry);
            }
          }
        }
      }
      if (options?.skipDataAssertion) {
        return;
      }

      // Assert dimensions
      const size = name.startsWith('s') ? parseInt(name.substring(1, 3)) : 32;
      strictEqual(decoded.image.width, options?.expectedDimensions?.width || size);
      strictEqual(decoded.image.height, options?.expectedDimensions?.height || size);

      const actual = Array.from(decoded.image.data);
      const require = createRequire(import.meta.url);
      const expected = require(`../test/pngsuite/json/${options?.customFile || name}.json`);
      if (options?.forceBitDepth8 || options?.ignoreTransparentHue) {
        for (let i = 0; i < actual.length; i += 4) {
          assertPixel(actual, expected, i, options);
        }
      } else {
        dataArraysEqual(actual, expected);
      }
    });
  }
}

function assertPixel(actual: ArrayLike<number>, expected: ArrayLike<number>, i: number, options?: ITestOptions) {
  if (options?.ignoreTransparentHue) {
    if (expected[i + 3] === 0) {
      if (actual[i + 3] !== expected[i + 3]) {
        throw new Error(
          `Alpha value for pixel ${i / 4} differs (index=${i}).\n\n` +
          `  actual=${Array.prototype.slice.call(actual, i, i + 4)}\n` +
          `  expected=${Array.prototype.slice.call(expected, i, i + 4)}`
        );
      }
      return;
    }
  }
  for (let c = 0; c < 4; c++) {
    const success = (
      (options?.forceBitDepth8 && Math.abs(actual[i] - expected[i]) <= 1) ||
      actual[i + c] === expected[i + c]
    );
    if (!success) {
      throw new Error(
        `Channel value for pixel ${i / 4} (index=${i}).\n\n` +
        `  actual=${Array.prototype.slice.call(actual, i, i + 4)}\n` +
        `  expected=${Array.prototype.slice.call(expected, i, i + 4)}`
      );
    }
  }
}

export function dataArraysEqual(actual: ArrayLike<number>, expected: ArrayLike<number>) {
  strictEqual(actual.length, expected.length);

  const padCount = actual.length.toString(16).length;

  const failures: string[] = [];
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      failures.push([
        `Offset 0x${i.toString(16).toUpperCase().padStart(padCount, '0')} (${i})`,
        `          |   Actual  Expected`,
        ` ---------+--------------------`,
        `  binary: | ${actual[i].toString(2).padStart(8, '0')}  ${expected[i].toString(2).padStart(8, '0')}`,
        `  dec:    | ${actual[i].toString(10).padStart(8)}  ${expected[i].toString(10).padStart(8)}`,
        `  hex:    | ${('0x' + actual[i].toString(16)).padStart(8)}  ${('0x' + expected[i].toString(16)).padStart(8)}`,
      ].join('\n'));
    }
  }

  if (failures.length > 0) {
    fail(`Data arrays differ at ${failures.length} offsets:\n\n${failures.slice(0, Math.min(5, failures.length)).join('\n\n')}${failures.length > 5 ? `\n\n...${failures.length - 5} more...\n` : ''}`);
  }

  // Double check using node's assert lib
  deepStrictEqual(actual, expected);
}

describe('pngParser.integration Image Test Suite', () => {
  createTests([
    ['008b8bb75b8a487dc5aac86c9abb06fb', 'multiple sBIT not allowed', { shouldThrow: true }],
  ], imageTestSuiteRoot);
  createTests([
    ['0132cfdbd8ca323574a2072e7ed5014c', 'multiple chunks not allowed', { shouldThrow: 'sRGB: Multiple sRGB chunks not allowed' }],
  ], imageTestSuiteRoot);
  createTests([
    ['0301fde58080883e938b604cab9768ea', 'sRGB must precede PLTE', { shouldThrow: 'sRGB: Must precede PLTE' }],
  ], imageTestSuiteRoot);
  createTests([
    // TODO: Should this test returned problems?
    // private (invalid?) IDAT row-filter type (255) (warning)
    // zlib: inflate error = -3 (data error)
    // private, critical chunk IyND (warning)
    ['m1-04c2707d63235dd5ab2c66ee98a36521', 'Image is damaged beyond recognition, some french text is visible', { shouldThrow: true }],
  ], imageTestSuiteRoot);
  createTests([
    // invalid pHYs unit specifier (147)
    // tEXt text contains NULL character(s)
    // zlib: inflate error = -3 (data error)
    // illegal (unless recently approved) unknown, public chunk iEND
    ['c-m2-0699098e769a2d80e60f33dbb3332b61', 'Image is damaged beyond recognition', { shouldThrow: true }],
    // first chunk must be IHDR
    // illegal (unless recently approved) unknown, public chunk sHDR
    // first chunk must be IHDR
    // EOF while reading pHYs data
    ['m1-0699098e769a2d80e60f33dbb3332b61', 'Image is damaged beyond recognition', { shouldThrow: true }],
    // invalid pHYs unit specifier (147)
    // CRC error in chunk pHYs (computed ccdc8c94, expected d2dd7efc)
    // tEXt text contains NULL character(s)
    // zlib: inflate error = -3 (data error)
    // illegal (unless recently approved) unknown, public chunk iEND
    ['m2-0699098e769a2d80e60f33dbb3332b61', 'Image is damaged beyond recognition', { shouldThrow: true }],
  ], imageTestSuiteRoot);
  createTests([
    ['073c98872b81d1004d750f18a4b5f732.png', 'invalid sTER length', true] // TODO: Support sTER?
  ], imageTestSuiteRoot);
  // TODO: Combine well behaving images into single describe?
  createTests([
    ['0839d93f8e77e21acd0ac40a80b14b7b', '350x490, 24-bit RGB, non-interlaced, -2.5% (Adobe Photoshop CS2 Windows)', true] // TODO: Create result image
  ], imageTestSuiteRoot);
  createTests([
    ['0b7d50ac449fd59eb3de00647636d0c9', 'invalid cHRM length', { shouldThrow: 'cHRM: Invalid data length: 31 !== 32' }]
  ], imageTestSuiteRoot);
  createTests([
    ['0d466db9067b719df0b06ef441bf1ee7', 'multiple iCCP not allowed', true] // TODO: Support iCCP
  ], imageTestSuiteRoot);
  createTests([
    // private (invalid?) IDAT row-filter type (141) (warning)
    // private (invalid?) IDAT row-filter type (242) (warning)
    // private (invalid?) IDAT row-filter type (255) (warning)
    // invalid IDAT row-filter type (7)
    // private (invalid?) IDAT row-filter type (227) (warning)
    // invalid IDAT row-filter type (14)
    // invalid IDAT row-filter type (9)
    // zlib: inflate error = -3 (data error)
    // EOF while reading tIME data
    ['c-m1-125cdc39e13ce7c237b7b4a9e1d8f21c', 'Images are damaged beyond recognition', { shouldThrow: true }],
    // CRC error in chunk IDAT (computed dae1adb2, expected 1132e69e)
    // CRC error in chunk IDAT (computed 0a15515f, expected 9dbadf56)
    // CRC error in chunk IDAT (computed 4fc1e207, expected 3f04b634)
    // private (invalid?) IDAT row-filter type (141) (warning)
    // private (invalid?) IDAT row-filter type (242) (warning)
    // private (invalid?) IDAT row-filter type (255) (warning)
    // invalid IDAT row-filter type (7)
    // CRC error in chunk IDAT (computed 6d2ad651, expected 8001598b)
    // private (invalid?) IDAT row-filter type (227) (warning)
    // invalid IDAT row-filter type (14)
    // CRC error in chunk IDAT (computed ed29880b, expected 1d9b84e6)
    // invalid IDAT row-filter type (9)
    // CRC error in chunk IDAT (computed b6e19be7, expected 3e0634d3)
    // zlib: inflate error = -3 (data error)
    // EOF while reading tIME data
    ['m1-125cdc39e13ce7c237b7b4a9e1d8f21c', 'Images are damaged beyond recognition', { shouldThrow: true }],
  ], imageTestSuiteRoot);
  // TODO: Combine invalid x entries describes
  createTests([
    ['138331052d7c6e4acebfaa92af314e12', 'invalid number of hIST entries', { shouldThrow: 'hIST: Invalid data length: 28 !== 30' }]
  ], imageTestSuiteRoot);
  // TODO: Combine multiple x chunks not allowed describes
  createTests([
    ['13f665c09e4b03cdbe2fff3015ec8aa7', 'multiple bKGD not allowed', { shouldThrow: 'bKGD: Multiple bKGD chunks not allowed' }]
  ], imageTestSuiteRoot);
  // TODO: Combine damaged beyond recognition describes
  createTests([
    ['18288f761922f9b9b00e927eaeb9e707', 'Damaged beyond recognition', { shouldThrow: true }]
  ], imageTestSuiteRoot);
  createTests([
    ['18bd8bf75e7a9b40b961dd501654ce0e', 'hIST must precede IDAT', { shouldThrow: 'hIST: Must precede IDAT' }],
  ], imageTestSuiteRoot);
  createTests([
    ['0839d93f8e77e21acd0ac40a80b14b7b', '118x79, 24-bit RGB, interlaced, 62.3% (Software: ULead System)', true], // TODO: Fix
  ], imageTestSuiteRoot);
  createTests([
    // TODO: Assert other CRC error messages
    // CRC error in chunk mkBT (computed 28db6e2e, expected 52da2a66)
    // zlib: inflate error = -3 (data error)
    ['c-m1-19e0d1d0dfe97dca39e9d449c6b8b3d2', 'damaged image', { shouldThrow: 'CRC for chunk "mkBT" at offset 0x3c02 doesn\'t match (0x52da2a66 !== 0x28db6e2e)' }],
    // CRC error in chunk IHDR (computed e0d16056, expected 97d650c0)
    // CRC error in chunk mkTS (computed 844a7acb, expected 052610e6)
    // CRC error in chunk mkBT (computed a083d4c3, expected e0bf25a3)
    // CRC error in chunk mkBT (computed 80d73f6d, expected eb77bd16)
    // CRC error in chunk mkBT (computed 6c1f44fb, expected d93b8e9c)
    // CRC error in chunk mkBT (computed 28db6e2e, expected 52da2a66)
    // CRC error in chunk mkBT (computed ecd1c296, expected 7729a6f7)
    ['m1-19e0d1d0dfe97dca39e9d449c6b8b3d2', 'damaged image', { shouldThrow: 'CRC for chunk "IHDR" at offset 0x8 doesn\'t match (0x97d650c0 !== 0xe0d16056)' }],
  ], imageTestSuiteRoot);
  createTests([
    // invalid IDAT row-filter type (119)
    // private (invalid?) IDAT row-filter type (173) (warning)
    // private (invalid?) IDAT row-filter type (224) (warning)
    // invalid IDAT row-filter type (90)
    // invalid IDAT row-filter type (107)
    // zlib: inflate error = -3 (data error)
    ['m1-1b5df699719c4a7cc8314ab9af139405', 'Image is damaged beyond recognition, an outline of a face is visible', { shouldThrow: 'CRC for chunk "IDAT" at offset 0xa2 doesn\'t match (0xb4be58e1 !== 0x6275f80e)' }],
  ], imageTestSuiteRoot);
  createTests([
    // sCAL must precede IDAT
    // pHYs must precede IDAT
    // pCAL must precede IDAT
    ['1b9a48cf04466108f6f2d225d100edbf', 'sCAL must precede IDAT', true], // TODO: Support sCAL?
  ], imageTestSuiteRoot);
  createTests([
    ['1bcc34d49e56a2fba38490db206328b8', 'multiple sCAL not allowed', true], // TODO: Support sCAL?
  ], imageTestSuiteRoot);
  createTests([
    // Contains the text "leeroy" and photograph of a man.
    ['1ebd73c1d3fbc89782f29507364128fc', '110x110, 24-bit RGB, non-interlaced, -54.6%', true], // TODO: Fix
  ], imageTestSuiteRoot);
  // TODO: This suite has some typos in the wiki description
  createTests([
    // TODO: "Imag" typo
    // illegal (unless recently approved) unknown, public chunk aDAT
    // invalid sCAL length
    // EOF while reading Imag data
    ['c-m1-1f97f040d0b6b26faeb0a1a7f1499590', 'Damaged beyond recognition', true],
    // illegal (unless recently approved) unknown, public chunk aDAT
    // invalid chunk name " by " (20 62 79 20)
    // EOF while reading  by  data
    ['c-m2-1f97f040d0b6b26faeb0a1a7f1499590', 'Damaged beyond recognition', true],
    // illegal (unless recently approved) unknown, public chunk aDAT
    // invalid sCAL unit specifier (67)
    // invalid chunk name " by " (20 62 79 20)
    // EOF while reading  by  data
    ['c-m3-1f97f040d0b6b26faeb0a1a7f1499590', 'Damaged beyond recognition', true],
    // illegal (unless recently approved) unknown, public chunk aDAT
    // invalid chunk name " by " (20 62 79 20)
    // EOF while reading  by  data
    ['c-m5-1f97f040d0b6b26faeb0a1a7f1499590', 'Damaged beyond recognition', true],
    // illegal (unless recently approved) unknown, public chunk aDAT
    // illegal (unless recently approved) unknown, public chunk IFND
    ['c-m6-1f97f040d0b6b26faeb0a1a7f1499590', 'Damaged beyond recognition', true],
    // illegal (unless recently approved) unknown, public chunk aDAT
    // invalid chunk name " by " (20 62 79 20)
    // EOF while reading  by  data
    ['c-m7-1f97f040d0b6b26faeb0a1a7f1499590', 'Damaged beyond recognition', true],
    // illegal (unless recently approved) unknown, public chunk aDAT
    // invalid chunk name " by " (20 62 79 20)
    // EOF while reading  by  data
    ['c-m8-1f97f040d0b6b26faeb0a1a7f1499590', 'Damaged beyond recognition', true],
    // CRC error in chunk IHDR (computed dd10c7bd, expected f87b9861)
    // illegal (unless recently approved) unknown, public chunk aDAT
    // invalid sCAL length
    // EOF while reading Imag data
    ['m1-1f97f040d0b6b26faeb0a1a7f1499590', 'Damaged beyond recognition', true],
    // CRC error in chunk IHDR (computed dd10c7bd, expected f87b9861)
    // CRC error in chunk pHYs (computed 91a71c6f, expected 9df55a60)
    // CRC error in chunk vpAg (computed 0d8f0029, expected 09c59193)
    // illegal (unless recently approved) unknown, public chunk aDAT
    // invalid chunk name " by " (20 62 79 20)
    // EOF while reading  by  data
    ['m2-1f97f040d0b6b26faeb0a1a7f1499590', 'Damaged beyond recognition', true],
    // CRC error in chunk IHDR (computed dd10c7bd, expected f87b9861)
    // CRC error in chunk pHYs (computed 91a71c6f, expected 9df55a60)
    // CRC error in chunk vpAg (computed 0d8f0029, expected 09c59193)
    // illegal (unless recently approved) unknown, public chunk aDAT
    // invalid sCAL unit specifier (67)
    // invalid chunk name " by " (20 62 79 20)
    // EOF while reading  by  data
    ['m3-1f97f040d0b6b26faeb0a1a7f1499590', 'Damaged beyond recognition', true],
    // first chunk must be IHDR
    // illegal (unless recently approved) unknown, public chunk dHDR
    // first chunk must be IHDR
    // illegal (unless recently approved) unknown, public chunk bHYs
    // first chunk must be IHDR
    // illegal (unless recently approved) unknown, public chunk aDAT
    // first chunk must be IHDR
    // invalid sCAL unit specifier (67)
    // invalid chunk name " by " (20 62 79 20)
    // first chunk must be IHDR
    // EOF while reading  by  data
    ['m4-1f97f040d0b6b26faeb0a1a7f1499590', 'Damaged beyond recognition', true],
    // CRC error in chunk IHDR (computed dd10c7bd, expected f87b9861)
    // CRC error in chunk oFFs (computed ec472581, expected 45a5f521)
    // CRC error in chunk pHYs (computed 91a71c6f, expected 9df55a60)
    // CRC error in chunk vpAg (computed 0d8f0029, expected 09c59193)
    // illegal (unless recently approved) unknown, public chunk aDAT
    // invalid chunk name " by " (20 62 79 20)
    // EOF while reading  by  data
    ['m5-1f97f040d0b6b26faeb0a1a7f1499590', 'Damaged beyond recognition', true],
    // CRC error in chunk vpAg (computed cda26ea1, expected 09c59193)
    // illegal (unless recently approved) unknown, public chunk aDAT
    // illegal (unless recently approved) unknown, public chunk IFND
    ['m6-1f97f040d0b6b26faeb0a1a7f1499590', 'Damaged beyond recognition', true],
    // CRC error in chunk IHDR (computed dd10c7bd, expected f87b9861)
    // CRC error in chunk pHYs (computed 91a71c6f, expected 9df55a60)
    // CRC error in chunk vpAg (computed 0d8f0029, expected 09c59193)
    // illegal (unless recently approved) unknown, public chunk aDAT
    // invalid chunk name " by " (20 62 79 20)
    // EOF while reading  by  data
    ['m7-1f97f040d0b6b26faeb0a1a7f1499590', 'Damaged beyond recognition', true],
    // CRC error in chunk IHDR (computed dd10c7bd, expected f87b9861)
    // CRC error in chunk pHYs (computed 91a71c6f, expected 9df55a60)
    // CRC error in chunk vpAg (computed 0d8f0029, expected 09c59193)
    // illegal (unless recently approved) unknown, public chunk aDAT
    // invalid chunk name " by " (20 62 79 20)
    // EOF while reading  by  data
    ['m8-1f97f040d0b6b26faeb0a1a7f1499590', 'Damaged beyond recognition', true],
  ], imageTestSuiteRoot);
  createTests([
    // tEXt keyword is longer than 79 characters
    // iTXt keyword is longer than 79 characters
    // private, critical chunk IdND (warning)
    // file doesn't end with an IEND chunk
    ['c-m1-1fc0c0de88608a9445d6f98a544b5abc', 'Last chunk is not IEND', { shouldThrow: 'Last chunk is not IEND' }],
    // tEXt keyword is longer than 79 characters
    // CRC error in chunk mkTS (computed 0e7e8c98, expected eda6716d)
    // CRC error in chunk mkBT (computed 6c7f5095, expected 3f7455f9)
    // CRC error in chunk mkBT (computed fd3d7288, expected add7a3c2)
    // CRC error in chunk mkBT (computed e206b6a6, expected 7729a6f7)
    // iTXt keyword is longer than 79 characters
    // CRC error in chunk iTXt (computed 32bfd0de, expected aa50e890)
    // private, critical chunk IdND (warning)
    // CRC error in chunk IdND (computed 97cd4c55, expected ae426082)
    // file doesn't end with an IEND chunk
    ['m1-1fc0c0de88608a9445d6f98a544b5abc', 'CRC error', { shouldThrow: 'CRC for chunk "mkTS" at offset 0x202 doesn\'t match (0xeda6716d !== 0xe7e8c98)' }],
  ], imageTestSuiteRoot);
  createTests([
    // private (invalid?) IDAT row-filter type (213) (warning)
    // invalid IDAT row-filter type (124)
    // invalid zTXt compression method (120)
    // illegal reserved-bit-set chunk zTot
    // illegal (unless recently approved) unknown, public chunk zTXE
    // invalid chunk name "I�ND" (49 ffffffd0 4e 44)
    // illegal (unless recently approved) unknown, public chunk I�ND
    ['c-m2-272ae9468b7883e5cf61873a17271fb4', 'Damaged beyond recognition', true],
    // illegal (unless recently approved) unknown, public chunk sRGd
    // private (invalid?) IDAT row-filter type (208) (warning)
    // private (invalid?) IDAT row-filter type (211) (warning)
    // private (invalid?) IDAT row-filter type (206) (warning)
    // private (invalid?) IDAT row-filter type (153) (warning)
    // invalid IDAT row-filter type (37)
    // invalid zTXt compression method (120)
    // illegal reserved-bit-set chunk zTot
    // illegal (unless recently approved) unknown, public chunk zTXE
    // invalid chunk name "I�ND" (49 ffffffd0 4e 44)
    // illegal (unless recently approved) unknown, public chunk I�ND
    ['m1-272ae9468b7883e5cf61873a17271fb4', 'Damaged beyond recognition', true],
    // private (invalid?) IDAT row-filter type (213) (warning)
    // invalid IDAT row-filter type (124)
    // CRC error in chunk IDAT (computed bc293aba, expected 81be9b02)
    // CRC error in chunk zTXt (computed a6ccd434, expected 98310798)
    // CRC error in chunk zTXt (computed 62b9ea06, expected 0c12e284)
    // CRC error in chunk zTXt (computed 810f8596, expected 810fd196)
    // invalid zTXt compression method (120)
    // CRC error in chunk zTXt (computed 5fc2f3c2, expected 5f3947e2)
    // illegal reserved-bit-set chunk zTot
    // illegal (unless recently approved) unknown, public chunk zTXE
    // invalid chunk name "I�ND" (49 ffffffd0 4e 44)
    // illegal (unless recently approved) unknown, public chunk I�ND
    ['m2-272ae9468b7883e5cf61873a17271fb4', 'Damaged beyond recognition', true],
  ], imageTestSuiteRoot);
  createTests([
    ['2a6ff5f8106894b22dad3ce99673481a', 'iCCP not allowed with sRGB', true], // TODO: Support iCCP
  ], imageTestSuiteRoot);
  createTests([
    ['2d641a11233385bb37a524ff010a8531', '162x159, 32-bit RGB+alpha, non-interlaced, 75.2%', true],
  ], imageTestSuiteRoot);
  createTests([
    // invalid cHRM green point 13422.1 0.6
    // invalid bKGD length
    // illegal reserved-bit-set chunk pHrs
    // invalid chunk length (too large)
    ['c-m1-2dc3bdd9274b121b851fa536b0e35b6a', 'Damaged', { shouldThrow: true }],
    // invalid cHRM blue point 168.296 0.42352
    // illegal reserved-bit-set chunk pHrs
    // invalid chunk length (too large)
    ['c-m2-2dc3bdd9274b121b851fa536b0e35b6a', 'Damaged', { shouldThrow: true }],
    // CRC error in chunk IHDR (computed bb0c65a7, expected 3c0171e2)
    // CRC error in chunk gAMA (computed f37bf9ba, expected 0bfc6105)
    // invalid cHRM green point 13422.1 0.6
    // CRC error in chunk cHRM (computed 8d71aff8, expected 9cba513c)
    // invalid bKGD length
    // illegal reserved-bit-set chunk pHrs
    // invalid chunk length (too large)
    ['m1-2dc3bdd9274b121b851fa536b0e35b6a', 'Damaged', { shouldThrow: true }],
    // CRC error in chunk IHDR (computed 03b002c2, expected 3c0171e2)
    // CRC error in chunk gAMA (computed f37bf9ba, expected 0bfc6105)
    // invalid cHRM blue point 168.296 0.42352
    // CRC error in chunk cHRM (computed 42518ab3, expected 9cba513c)
    // CRC error in chunk oFFs (computed 70136083, expected fe75e54a)
    // illegal reserved-bit-set chunk pHrs
    // invalid chunk length (too large)
    ['m2-2dc3bdd9274b121b851fa536b0e35b6a', 'Damaged', { shouldThrow: true }],
  ], imageTestSuiteRoot);
  createTests([
    ['31e3bc3eb811cff582b5feee2494fed8', 'sBIT: Must precede IDAT', { shouldThrow: 'sBIT: Must precede IDAT' }],
  ], imageTestSuiteRoot);
  createTests([
    // first chunk must be IHDR
    // zero length sPLT palette name
    // CRC error in chunk sPLT (computed 88723087, expected 8e000000)
    // invalid chunk name "A" (41 00 01 ffffff86)
    // first chunk must be IHDR
    // EOF while reading A data
    ['3625f98e00148cdc136c53bdcd2d2e1e', 'Damaged', { shouldThrow: true }],
    // first chunk must be IHDR
    // zero length sPLT palette name
    // invalid chunk name "A" (41 00 01 ffffff86)
    // first chunk must be IHDR
    // EOF while reading A data
    ['c-3625f98e00148cdc136c53bdcd2d2e1e', 'Damaged', { shouldThrow: true }],
    // first chunk must be IHDR
    // EOF while reading gAMA data
    ['c-m1-3625f98e00148cdc136c53bdcd2d2e1e', 'Damaged', { shouldThrow: true }],
    // first chunk must be IHDR
    // CRC error in chunk srLT (computed 158471d7, expected ce66668e)
    // first chunk must be IHDR
    // EOF while reading gAMA data
    ['m1-3625f98e00148cdc136c53bdcd2d2e1e', 'Damaged', { shouldThrow: true }],
    // first chunk must be IHDR
    // illegal reserved-bit-set chunk sPuT
    // first chunk must be IHDR
    // PLTE not allowed in INVALID image
    // first chunk must be IHDR
    // zlib: inflate error = -3 (data error)
    // first chunk must be IHDR
    ['m2-3625f98e00148cdc136c53bdcd2d2e1e', 'Damaged', { shouldThrow: true }],
  ], imageTestSuiteRoot);
  createTests([
    ['429104334d1fb6a58e17307883c17608', 'sBIT must precede PLTE', { shouldThrow: 'sBIT: Must precede PLTE' }],
  ], imageTestSuiteRoot);
  createTests([
    ['42ec8668adb5dbc6581393f463976510', 'tRNS must precede IDAT', { shouldThrow: 'tRNS: Must precede IDAT' }],
  ], imageTestSuiteRoot);
  createTests([
    ['4389427591c18bf36e748172640862c3', 'invalid sTER layout mode', true], // TODO: Support sTER
  ], imageTestSuiteRoot);
  createTests([
    ['463d3570f92a6b6ecba0cc4fd9a7a384', 'multiple PLTE not allowed', { shouldThrow: 'PLTE: Multiple PLTE chunks not allowed' }],
  ], imageTestSuiteRoot);
  createTests([
    // tRNS not allowed in grayscale+alpha image
    // zlib: inflate error = -3 (data error)
    // illegal (unless recently approved) unknown, public chunk tEND
    ['c-m1-49e39033e275de9786d8c41f834c710b', 'Damaged', { shouldThrow: true }],
    // CRC error in chunk IHDR (computed dd8baef7, expected 4d9f902b)
    // tRNS not allowed in grayscale+alpha image
    // zlib: inflate error = -3 (data error)
    // illegal (unless recently approved) unknown, public chunk tEND
    ['m1-49e39033e275de9786d8c41f834c710b', 'Damaged', { shouldThrow: true }],
  ], imageTestSuiteRoot);
  createTests([
    // invalid IHDR image dimensions (0x0)
    // file doesn't end with an IEND chunk
    ['4aae896ba900c48c63cffc0cc9f8c4dc', 'Damaged', { shouldThrow: 'Last chunk is not IEND' }],
  ], imageTestSuiteRoot);
  createTests([
    // invalid tIME year (0)
    // invalid IDAT row-filter type (45)
    // private (invalid?) IDAT row-filter type (150) (warning)
    // invalid IDAT row-filter type (124)
    // invalid IDAT row-filter type (114)
    // invalid IDAT row-filter type (127)
    // private (invalid?) IDAT row-filter type (131) (warning)
    // private (invalid?) IDAT row-filter type (255) (warning)
    // invalid IDAT row-filter type (22)
    // private (invalid?) IDAT row-filter type (133) (warning)
    // invalid IDAT row-filter type (36)
    // private (invalid?) IDAT row-filter type (199) (warning)
    // private (invalid?) IDAT row-filter type (242) (warning)
    // private (invalid?) IDAT row-filter type (255) (warning)
    // invalid IDAT row-filter type (6)
    // zlib: inflate error = -3 (data error)
    ['c-m1-4bdd87fd0324f0a3d84d6905d17e1731', 'Damaged', { shouldThrow: true }],
    // invalid tIME year (0)
    // invalid IDAT row-filter type (45)
    // private (invalid?) IDAT row-filter type (150) (warning)
    // invalid IDAT row-filter type (124)
    // invalid IDAT row-filter type (114)
    // invalid IDAT row-filter type (127)
    // private (invalid?) IDAT row-filter type (131) (warning)
    // private (invalid?) IDAT row-filter type (255) (warning)
    // invalid IDAT row-filter type (22)
    // CRC error in chunk IDAT (computed 1c93886a, expected 3577897a)
    // private (invalid?) IDAT row-filter type (133) (warning)
    // invalid IDAT row-filter type (36)
    // private (invalid?) IDAT row-filter type (199) (warning)
    // private (invalid?) IDAT row-filter type (242) (warning)
    // private (invalid?) IDAT row-filter type (255) (warning)
    // invalid IDAT row-filter type (6)
    // zlib: inflate error = -3 (data error)
    ['m1-4bdd87fd0324f0a3d84d6905d17e1731', 'Damaged', { shouldThrow: true }],
  ], imageTestSuiteRoot);
  createTests([
    ['4c5b82ba0a9c12356007bd71e52185b2', 'invalid sRGB length', { shouldThrow: 'sRGB: Invalid data length: 0 !== 1' }],
  ], imageTestSuiteRoot);
  createTests([
    ['4f14b7aab3a41855378c5517342598b9', 'invalid tRNS length for palette image', { shouldThrow: 'tRNS: Invalid data length for color type 3: 174 > 173' }],
  ], imageTestSuiteRoot);
  createTests([
    ['51a4d21670dc8dfa8ffc9e54afd62f5f', '160x278, 16-bit grayscale+alpha, interlaced, 71.4%', true],
  ], imageTestSuiteRoot);
  createTests([
    ['c-m1-559dcf17d281e285b7f09f943b9706de', 'invalid IDAT row-filter type (9)', true],
    // invalid sBIT length
    // PLTE not allowed in grayscale image
    // zlib: inflate error = -3 (data error)
    ['c-m2-559dcf17d281e285b7f09f943b9706de', 'Damaged', true],
    // CRC error in chunk IHDR (computed ed8067bf, expected 9a875729)
    // CRC error in chunk tRNS (computed 425e370a, expected f4381a37)
    // invalid IDAT row-filter type (9)
    ['m1-559dcf17d281e285b7f09f943b9706de', 'Damaged', true],
    // CRC error in chunk IHDR (computed 8832f8c7, expected 9a875729)
    // invalid sBIT length
    // PLTE not allowed in grayscale image
    // zlib: inflate error = -3 (data error)
    ['m2-559dcf17d281e285b7f09f943b9706de', 'Damaged', true],
  ], imageTestSuiteRoot);
  createTests([
    ['579294d4d8110fc64980dd72a5066780', 'invalid number of PLTE entries (257)', { shouldThrow: 'PLTE: Too many entries (257 > 256)' }],
  ], imageTestSuiteRoot);
  createTests([
    // invalid gAMA length
    // zlib: inflate error = -3 (data error)
    // illegal reserved-bit-set chunk IEmD
    ['c-m1-585dd0ac594e8226c49ae7986b8f47d3', 'Damaged', { shouldThrow: true }],
    // CRC error in chunk IHDR (computed d0f6e06c, expected 498bc8ef)
    // invalid gAMA length
    // zlib: inflate error = -3 (data error)
    // illegal reserved-bit-set chunk IEmD
    ['m1-585dd0ac594e8226c49ae7986b8f47d3', 'Damaged', { shouldThrow: true }],
  ], imageTestSuiteRoot);
  createTests([
    // CRC error in chunk bKGD (computed dfe780ae, expected 1f5dec03)
    // zlib: inflate error = -3 (data error)
    ['586914b5d01d3889fb7bb5c44fe29771', 'Damaged', { shouldThrow: true }],
    // zlib: inflate error = -3 (data error)
    ['c-586914b5d01d3889fb7bb5c44fe29771', 'Damaged', { shouldThrow: true }],
  ], imageTestSuiteRoot);
  createTests([
    // invalid IHDR image type (11)
    // zlib: inflate error = -3 (data error)
    ['c-m1-58d30745083f25952342caafb6ee5f37', 'Damaged', { shouldThrow: true }],
    // invalid IHDR image type (11)
    // CRC error in chunk IHDR (computed 164b6bd8, expected e421b305)
    // zlib: inflate error = -3 (data error)
    ['m1-58d30745083f25952342caafb6ee5f37', 'Damaged', { shouldThrow: true }],
  ], imageTestSuiteRoot);
  createTests([
    // private (invalid?) IDAT row-filter type (255) (warning)
    // invalid IDAT row-filter type (28)
    // private (invalid?) IDAT row-filter type (250) (warning)
    // invalid IDAT row-filter type (73)
    // invalid IDAT row-filter type (121)
    ['c-m2-593d4b1a0b5d13b539c6c098dc5797ca', 'Damaged', { shouldThrow: true }],
    // private (invalid?) IDAT row-filter type (255) (warning)
    // invalid IDAT row-filter type (28)
    // private (invalid?) IDAT row-filter type (250) (warning)
    // invalid IDAT row-filter type (73)
    // invalid IDAT row-filter type (121)
    ['c-m3-593d4b1a0b5d13b539c6c098dc5797ca', 'Damaged', { shouldThrow: true }],
    // first chunk must be IHDR
    // illegal (unless recently approved) unknown, public chunk vHDR
    // first chunk must be IHDR
    // invalid chunk name "IDA�" (49 44 41 ffffffaf)
    // first chunk must be IHDR
    // illegal critical, safe-to-copy chunk IDA�
    // first chunk must be IHDR
    // no IDAT chunks
    ['m1-593d4b1a0b5d13b539c6c098dc5797ca', 'Damaged', { shouldThrow: true }],
    // private (invalid?) IDAT row-filter type (255) (warning)
    // invalid IDAT row-filter type (28)
    // private (invalid?) IDAT row-filter type (250) (warning)
    // invalid IDAT row-filter type (73)
    // invalid IDAT row-filter type (121)
    // CRC error in chunk IDAT (computed 4c13f9e8, expected 5542ce25)
    ['m2-593d4b1a0b5d13b539c6c098dc5797ca', 'Damaged', { shouldThrow: true }],
    // private (invalid?) IDAT row-filter type (255) (warning)
    // invalid IDAT row-filter type (28)
    // private (invalid?) IDAT row-filter type (250) (warning)
    // invalid IDAT row-filter type (73)
    // invalid IDAT row-filter type (121)
    // CRC error in chunk IDAT (computed 0deb5053, expected 5542ce25)
    ['m3-593d4b1a0b5d13b539c6c098dc5797ca', 'Damaged', { shouldThrow: true }],
  ], imageTestSuiteRoot);
  createTests([
    // private (invalid?) IDAT row-filter type (185) (warning)
    // invalid IDAT row-filter type (9)
    // zlib: inflate error = -3 (data error)
    // illegal (unless recently approved) unknown, public chunk sTXt
    ['m1-5ae377bebf643e2e53ba7038103e48c4', 'Damaged', { shouldThrow: true }],
  ], imageTestSuiteRoot);











  // createTests([
  //   ['', '', true],
  // ], imageTestSuiteRoot);
});
