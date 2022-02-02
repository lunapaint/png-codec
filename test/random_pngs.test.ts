/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import * as fs from 'fs';
import { colorTypeIdToName, createTests } from './testUtil.js';

const suiteRoot = 'test/random_pngs';

function getNumberAtIndex(file: string, index: number): number {
  let text = '^rand';
  for (let i = 0; i < 7; i++) {
    text += '_';
    if (i === index) text += '(';
    text += '[0-9]+';
    if (i === index) text += ')';
  }
  const regex = new RegExp(text);
  return parseInt(file.match(regex)![1]);
}

// The random_pngs repo is a collection of generated lodepng encoded pngs for fuzzing purposed. The
// pixel data is random and not being tested, only ensuring images load in strict mode and have the
// expected properties.
describe('random_pngs', () => {
  const testFiles = fs.readdirSync(suiteRoot);
  const testsByColorType: Map<number, string[]> = new Map();
  const colorTypes: (0 | 2 | 3 | 4 | 6)[] = [0, 2, 3, 4, 6];
  for (const colorType of colorTypes) {
    testsByColorType.set(colorType, []);
  }
  for (const file of testFiles) {
    if (file.endsWith('png')) {
      const colorType = getNumberAtIndex(file, 3);
      testsByColorType.get(colorType)!.push(file.replace('.png', ''));
    }
  }
  for (const colorType of colorTypes) {
    describe(`color type ${colorTypeIdToName(colorType)} (${colorType})`, () => {
      const colorTypeCases = testsByColorType.get(colorType)!;
      for (const file of colorTypeCases) {
        // Note that some properties were optimized away when encoded with lodepng
        // https://github.com/richgel999/random_pngs/issues/1
        const expectedWidth = getNumberAtIndex(file, 0);
        const expectedHeight = getNumberAtIndex(file, 1);
        const expectedInterlacing = getNumberAtIndex(file, 6);
        createTests([
          [file, 'should match file specs', {
            strictMode: true,
            skipDataAssertion: true,
            expectedDimensions: {
              width: expectedWidth,
              height: expectedHeight
            },
            expectedDetails: {
              bitDepth: undefined,
              colorType: undefined,
              interlaceMethod: expectedInterlacing
            }
          }],
        ], suiteRoot);
      }
    });
  }
});
