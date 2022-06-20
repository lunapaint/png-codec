"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const path_1 = require("path");
const pngDecoder_js_1 = require("../out-dev/pngDecoder.js");
const fs = require("fs");
const pngSuiteRoot = 'test/pngsuite/png';
function dataViewFromArray(data) {
    return new DataView(new Uint8Array(data).buffer);
}
async function dataViewFromFile(file) {
    return new DataView(new Uint8Array(await fs.promises.readFile(file)).buffer);
}
describe('verifyPngSignature', () => {
    it('should throw when the data doesn\'t match the fixed 8-byte header', () => {
        (0, assert_1.throws)(() => {
            (0, pngDecoder_js_1.verifyPngSignature)({ view: dataViewFromArray([0x41, 0x4D]), warnings: [], info: [], metadata: [], options: null, parsedChunks: new Set() });
        }, new Error('Not enough bytes in file for png signature (2)'));
        (0, assert_1.throws)(() => {
            (0, pngDecoder_js_1.verifyPngSignature)({ view: dataViewFromArray([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), warnings: [], info: [], metadata: [], options: null, parsedChunks: new Set() });
        }, new Error('Png signature is not correct (0x0000000000000000 !== 0x89504e470d0a1a0a)'));
    });
    it('should verify for valid headers', () => {
        (0, pngDecoder_js_1.verifyPngSignature)({ view: dataViewFromArray([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), warnings: [], info: [], metadata: [], options: null, parsedChunks: new Set() });
    });
    it('should verify the header of valid png suite entries', async () => {
        const testFiles = fs.readdirSync((0, path_1.join)(pngSuiteRoot));
        for (const file of testFiles) {
            if (file.endsWith('png') && !file.startsWith('x')) {
                (0, pngDecoder_js_1.verifyPngSignature)({ view: await dataViewFromFile((0, path_1.join)(pngSuiteRoot, file)), warnings: [], info: [], metadata: [], options: null, parsedChunks: new Set() });
            }
        }
    });
    it('should throw for corrupt headers in png suite', async () => {
        const testFiles = [
            'xcrn0g04.png',
            'xlfn0g04.png',
            'xs1n0g01.png',
            'xs2n0g01.png',
            'xs4n0g01.png',
            'xs7n0g01.png',
        ];
        for (const file of testFiles) {
            const view = await dataViewFromFile((0, path_1.join)(pngSuiteRoot, file));
            (0, assert_1.throws)(() => (0, pngDecoder_js_1.verifyPngSignature)({ view, warnings: [], info: [], metadata: [], options: null, parsedChunks: new Set() }));
        }
    });
});
//# sourceMappingURL=signature.test.js.map