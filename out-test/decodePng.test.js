"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const path_1 = require("path");
const png_js_1 = require("../out-dev/png.js");
const assert_js_1 = require("../out-dev/assert.js");
const fs = require("fs");
const pngSuiteRoot = 'test/pngsuite/png';
describe('decodePng', () => {
    describe('Buffer.byteOffset, Buffer.byteLength', () => {
        it('should decoded an array with byteOffset and byteLength set', async () => {
            const originalTypedArray = await fs.promises.readFile((0, path_1.join)(pngSuiteRoot, `cs3n2c16.png`));
            const newArrayBuffer = new ArrayBuffer(originalTypedArray.length + 100);
            const newDataView = new DataView(newArrayBuffer, 50, originalTypedArray.length);
            for (let i = 0; i < originalTypedArray.length; i++) {
                newDataView.setUint8(i, originalTypedArray[i]);
            }
            const copiedTypedArray = new Uint8Array(newArrayBuffer, 50, originalTypedArray.length);
            await (0, png_js_1.decodePng)(copiedTypedArray);
        });
    });
    describe('optionalChunks', () => {
        it('should not load sBIT when not specified', async () => {
            const data = new Uint8Array(await fs.promises.readFile((0, path_1.join)(pngSuiteRoot, `cs3n2c16.png`)));
            const result = await (0, png_js_1.decodePng)(data);
            (0, assert_1.deepStrictEqual)(result.metadata, undefined);
        });
        it('should load sBIT when specified', async () => {
            const data = new Uint8Array(await fs.promises.readFile((0, path_1.join)(pngSuiteRoot, `cs3n2c16.png`)));
            const result = await (0, png_js_1.decodePng)(data, { parseChunkTypes: ["sBIT"] });
            (0, assert_1.deepStrictEqual)(result.metadata, [
                {
                    type: 'sBIT',
                    value: [13, 13, 13]
                }
            ]);
        });
    });
    describe('palette', () => {
        it('should be able to fetch all palette entries', async () => {
            const data = new Uint8Array(await fs.promises.readFile((0, path_1.join)(pngSuiteRoot, `s05n3p02.png`)));
            const result = await (0, png_js_1.decodePng)(data);
            const p = result.palette;
            (0, assert_1.strictEqual)(p.size, 3);
            (0, assert_1.deepStrictEqual)(Array.from(p.getRgb(0)), [0, 255, 255]);
            (0, assert_1.deepStrictEqual)(Array.from(p.getRgb(1)), [119, 0, 255]);
            (0, assert_1.deepStrictEqual)(Array.from(p.getRgb(2)), [255, 0, 0]);
        });
        it('should throw when accessing invalid color indexes', async () => {
            const data = new Uint8Array(await fs.promises.readFile((0, path_1.join)(pngSuiteRoot, `s05n3p02.png`)));
            const result = await (0, png_js_1.decodePng)(data);
            const p = result.palette;
            (0, assert_1.strictEqual)(p.size, 3);
            (0, assert_1.throws)(() => p.getRgb(-1));
            (0, assert_1.throws)(() => p.getRgb(3));
        });
    });
    describe('details', () => {
        it('should decode correct values', async () => {
            const data = new Uint8Array(await fs.promises.readFile((0, path_1.join)(pngSuiteRoot, `s05n3p02.png`)));
            const result = await (0, png_js_1.decodePng)(data);
            (0, assert_1.deepStrictEqual)(result.details, {
                width: 5,
                height: 5,
                bitDepth: 2,
                colorType: 3,
                interlaceMethod: 0
            });
        });
    });
    describe('errors', () => {
        it('should throw a DecodeError without details when failing in header', async () => {
            const data = new Uint8Array([1, 2, 3]);
            try {
                await (0, png_js_1.decodePng)(data);
            }
            catch (e) {
                if (!(e instanceof assert_js_1.DecodeError)) {
                    (0, assert_1.fail)('error not an instance of DecodeError');
                }
                (0, assert_1.strictEqual)(e.message, 'Not enough bytes in file for png signature (3)');
                (0, assert_1.strictEqual)(e.offset, 0);
                (0, assert_1.deepStrictEqual)(e.partiallyDecodedImage, {
                    details: undefined,
                    info: [],
                    metadata: [],
                    rawChunks: undefined,
                    warnings: []
                });
                return;
            }
            (0, assert_1.fail)('exception expected');
        });
    });
});
//# sourceMappingURL=decodePng.test.js.map