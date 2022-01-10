/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { deepStrictEqual, fail, ok, strictEqual } from 'assert';
import * as fs from 'fs';
import { createRequire } from 'module';
import { join } from 'path';
import { decodePng } from '../out/png.js';
import { PngMetadata } from '../typings/api';

export interface ITestOptions {
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

export type TestCase = [name: string, description: string, skip?: boolean] | [name: string, description: string, options: ITestOptions];

export function createTests(testCases: TestCase[], fixture: string) {
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

export function assertPixel(actual: ArrayLike<number>, expected: ArrayLike<number>, i: number, options?: ITestOptions) {
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