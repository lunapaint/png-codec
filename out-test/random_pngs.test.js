"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const testUtil_js_1 = require("./testUtil.js");
const suiteRoot = 'test/random_pngs';
function getNumberAtIndex(file, index) {
    let text = '^rand';
    for (let i = 0; i < 7; i++) {
        text += '_';
        if (i === index)
            text += '(';
        text += '[0-9]+';
        if (i === index)
            text += ')';
    }
    const regex = new RegExp(text);
    return parseInt(file.match(regex)[1]);
}
function colorTypeIdToName(id) {
    switch (id) {
        case 0: return 'greyscale';
        case 2: return 'truecolor';
        case 3: return 'indexed';
        case 4: return 'greyscale and alpha';
        case 6: return 'truecolor and alpha';
    }
}
describe('random_pngs', () => {
    const testFiles = fs.readdirSync(suiteRoot);
    const testsByColorType = new Map();
    const colorTypes = [0, 2, 3, 4, 6];
    for (const colorType of colorTypes) {
        testsByColorType.set(colorType, []);
    }
    for (const file of testFiles) {
        if (file.endsWith('png')) {
            const colorType = getNumberAtIndex(file, 3);
            testsByColorType.get(colorType).push(file.replace('.png', ''));
        }
    }
    for (const colorType of colorTypes) {
        describe(`Color type ${colorTypeIdToName(colorType)} (${colorType})`, () => {
            const colorTypeCases = testsByColorType.get(colorType);
            for (const file of colorTypeCases) {
                const expectedWidth = getNumberAtIndex(file, 0);
                const expectedHeight = getNumberAtIndex(file, 1);
                const expectedInterlacing = getNumberAtIndex(file, 6);
                (0, testUtil_js_1.createTests)([
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
//# sourceMappingURL=random_pngs.test.js.map