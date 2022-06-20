"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataArraysEqual = exports.assertPixel = exports.createTests = void 0;
const assert_1 = require("assert");
const fs = require("fs");
const path_1 = require("path");
const png_js_1 = require("../out-dev/png.js");
function createTests(testCases, fixture) {
    for (const t of testCases) {
        const name = t[0];
        const description = t[1];
        const shouldSkip = typeof t[2] === 'boolean' ? t[2] : false;
        const options = typeof t[2] === 'object' ? t[2] : {};
        let annotation = '';
        if (options.strictMode) {
            annotation += ' [strict]';
        }
        if (options.skipDataAssertion) {
            annotation += ' [DATA CHECK SKIPPED]';
        }
        (shouldSkip ? it.skip : it)(`${name}${annotation} - ${description}`, async () => {
            const data = new Uint8Array(await fs.promises.readFile((0, path_1.join)(fixture, `${name}.png`)));
            if (options.shouldThrow) {
                try {
                    await (0, png_js_1.decodePng)(data, { parseChunkTypes: '*', strictMode: options.strictMode });
                }
                catch (e) {
                    if (typeof options.shouldThrow === 'string') {
                        (0, assert_1.strictEqual)(e.message, options.shouldThrow);
                    }
                    return;
                }
                (0, assert_1.fail)('Exception expected');
            }
            const decoded = await (options.forceBitDepth8
                ? (0, png_js_1.decodePng)(data, { parseChunkTypes: '*', strictMode: options.strictMode, force32: true })
                : (0, png_js_1.decodePng)(data, { parseChunkTypes: '*', strictMode: options.strictMode }));
            if (options.includesMetadata) {
                (0, assert_1.ok)(decoded.metadata);
                for (const expectedEntryType of Object.keys(options.includesMetadata)) {
                    const expectedEntry = options.includesMetadata[expectedEntryType];
                    if (Array.isArray(expectedEntry)) {
                        const actualEntries = decoded.metadata.filter(e => e.type === expectedEntryType);
                        (0, assert_1.deepStrictEqual)(actualEntries, expectedEntry);
                    }
                    else {
                        const actualEntry = decoded.metadata.find(e => e.type === expectedEntryType);
                        if (typeof expectedEntry === 'function') {
                            (0, assert_1.ok)(expectedEntry(actualEntry));
                        }
                        else {
                            (0, assert_1.deepStrictEqual)(actualEntry, expectedEntry);
                        }
                    }
                }
            }
            (0, assert_1.deepStrictEqual)(decoded.info, options.expectedInfo || []);
            if (options.expectedWarnings) {
                const actualWarnings = decoded.warnings?.map(e => e.message).sort();
                (0, assert_1.deepStrictEqual)(actualWarnings, options.expectedWarnings.sort());
            }
            if (options.expectedDetails) {
                if (options.expectedDetails.bitDepth !== undefined) {
                    (0, assert_1.strictEqual)(decoded.details.bitDepth, options.expectedDetails.bitDepth);
                }
                if (options.expectedDetails.colorType !== undefined) {
                    (0, assert_1.strictEqual)(decoded.details.colorType, options.expectedDetails.colorType);
                }
                if (options.expectedDetails.interlaceMethod !== undefined) {
                    (0, assert_1.strictEqual)(decoded.details.interlaceMethod, options.expectedDetails.interlaceMethod);
                }
            }
            const size = name.startsWith('s') ? parseInt(name.substring(1, 3)) : 32;
            (0, assert_1.strictEqual)(decoded.image.width, options.expectedDimensions?.width || size);
            (0, assert_1.strictEqual)(decoded.image.height, options.expectedDimensions?.height || size);
            if (options.skipDataAssertion) {
                return;
            }
            const actual = Array.from(decoded.image.data);
            let expected;
            try {
                expected = require(`../${fixture}/json/${options.customFile || name}.json`);
            }
            catch {
                expected = require(`../${fixture}/../json/${options.customFile || name}.json`);
            }
            if (options.forceBitDepth8) {
                for (let i = 0; i < actual.length; i += 4) {
                    assertPixel(actual, expected, i, options);
                }
            }
            else {
                dataArraysEqual(actual, expected);
            }
        });
    }
}
exports.createTests = createTests;
function assertPixel(actual, expected, i, options) {
    for (let c = 0; c < 4; c++) {
        const success = ((options.forceBitDepth8 && Math.abs(actual[i] - expected[i]) <= 1) ||
            actual[i + c] === expected[i + c]);
        if (!success) {
            throw new Error(`Channel value for pixel ${i / 4} (index=${i}).\n\n` +
                `  actual=${Array.prototype.slice.call(actual, i, i + 4)}\n` +
                `  expected=${Array.prototype.slice.call(expected, i, i + 4)}`);
        }
    }
}
exports.assertPixel = assertPixel;
function dataArraysEqual(actual, expected) {
    (0, assert_1.strictEqual)(actual.length, expected.length);
    const padCount = actual.length.toString(16).length;
    const failures = [];
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
        (0, assert_1.fail)(`Data arrays differ at ${failures.length} offsets:\n\n${failures.slice(0, Math.min(5, failures.length)).join('\n\n')}${failures.length > 5 ? `\n\n...${failures.length - 5} more...\n` : ''}`);
    }
    (0, assert_1.deepStrictEqual)(actual, expected);
}
exports.dataArraysEqual = dataArraysEqual;
//# sourceMappingURL=testUtil.js.map