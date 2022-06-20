"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testUtil_js_1 = require("./testUtil.js");
const imageTestSuiteRoot = 'test/imagetestsuite/png';
describe('Image Test Suite', () => {
    describe('chunk ordering', () => {
        (0, testUtil_js_1.createTests)([
            ['0301fde58080883e938b604cab9768ea', 'sRGB must precede PLTE', { shouldThrow: 'sRGB: Must precede PLTE', strictMode: true }],
            ['0301fde58080883e938b604cab9768ea', 'should decode with warnings', { expectedWarnings: ['sRGB: Must precede PLTE'], expectedDimensions: { width: 48, height: 48 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['18bd8bf75e7a9b40b961dd501654ce0e', 'hIST must precede IDAT', { shouldThrow: 'hIST: Must precede IDAT', strictMode: true }],
            ['18bd8bf75e7a9b40b961dd501654ce0e', 'should decode with warnings', { expectedWarnings: ['hIST: Must precede IDAT'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['1b9a48cf04466108f6f2d225d100edbf', 'sCAL must precede IDAT', { shouldThrow: 'sCAL: Must precede IDAT', strictMode: true }],
            ['1b9a48cf04466108f6f2d225d100edbf', 'sCAL must precede IDAT', { expectedWarnings: [
                        'pHYs: Must precede IDAT',
                        'sCAL: Must precede IDAT',
                        'pCAL: Must precede IDAT'
                    ], expectedDimensions: { width: 91, height: 69 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['31e3bc3eb811cff582b5feee2494fed8', 'sBIT must precede IDAT', { shouldThrow: 'sBIT: Must precede IDAT', strictMode: true }],
            ['31e3bc3eb811cff582b5feee2494fed8', 'should decode with warnings', { expectedWarnings: ['sBIT: Must precede IDAT'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['429104334d1fb6a58e17307883c17608', 'sBIT must precede PLTE', { shouldThrow: 'sBIT: Must precede PLTE', strictMode: true }],
            ['429104334d1fb6a58e17307883c17608', 'should decode with warnings', { expectedWarnings: ['sBIT: Must precede PLTE'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['42ec8668adb5dbc6581393f463976510', 'tRNS must precede IDAT', { shouldThrow: 'tRNS: Must precede IDAT', strictMode: true }],
            ['42ec8668adb5dbc6581393f463976510', 'should decode with warnings', { expectedWarnings: ['tRNS: Must precede IDAT'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['5b689479bd7e527c2385a40437272607', 'sRGB must precede IDAT', { shouldThrow: 'sRGB: Must precede IDAT', strictMode: true }],
            ['5b689479bd7e527c2385a40437272607', 'should decode with warnings', { expectedWarnings: ['sRGB: Must precede IDAT'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['71714b783e01aec455b5a4a760326ccc', 'iCCP must precede PLTE', { shouldThrow: 'iCCP: Must precede PLTE', strictMode: true }],
            ['71714b783e01aec455b5a4a760326ccc', 'should decode with warnings', { expectedWarnings: ['iCCP: Must precede PLTE'], expectedDimensions: { width: 48, height: 48 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['7b9abb94ace0278f943a6df29d0ca652', 'gAMA must precede PLTE', { shouldThrow: 'gAMA: Must precede PLTE', strictMode: true }],
            ['7b9abb94ace0278f943a6df29d0ca652', 'should decode with warnings', { expectedWarnings: ['gAMA: Must precede PLTE'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['829b05b759b2977bc3eb970ab256d867', 'iCCP must precede IDAT', { shouldThrow: 'iCCP: Must precede IDAT', strictMode: true }],
            ['829b05b759b2977bc3eb970ab256d867', 'should decode with warnings', { expectedWarnings: ['iCCP: Must precede IDAT'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['b3ac9fdb7239f42c734921dfe790291b', 'cHRM must precede PLTE', { shouldThrow: 'cHRM: Must precede PLTE', strictMode: true }],
            ['b3ac9fdb7239f42c734921dfe790291b', 'should decode with warnings', { expectedWarnings: ['cHRM: Must precede PLTE'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c1a4baf5d7c68d366d4d4f948f7295be', 'gAMA must precede IDAT', { shouldThrow: 'gAMA: Must precede IDAT', strictMode: true }],
            ['c1a4baf5d7c68d366d4d4f948f7295be', 'should decode with warnings', { expectedWarnings: ['gAMA: Must precede IDAT'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c5c030bf52b9b2d8c45c88988fafff4f', 'bKGD must precede IDAT', { shouldThrow: 'bKGD: Must precede IDAT', strictMode: true }],
            ['c5c030bf52b9b2d8c45c88988fafff4f', 'should decode with warnings', { expectedWarnings: ['bKGD: Must precede IDAT'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['ed5f2464fcaadd4e0a5e905e3ac41ad5', 'pHYs must precede IDAT', { shouldThrow: 'pHYs: Must precede IDAT', strictMode: true }],
            ['ed5f2464fcaadd4e0a5e905e3ac41ad5', 'should decode with warnings', { expectedWarnings: [
                        'pHYs: Must precede IDAT',
                        'sCAL: Must precede IDAT'
                    ], expectedDimensions: { width: 91, height: 69 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['f6266c0e9c2f7db9fab0f84562f63b6c', 'sTER must precede IDAT', { shouldThrow: 'sTER: Must precede IDAT', strictMode: true }],
            ['f6266c0e9c2f7db9fab0f84562f63b6c', 'should decode with warnings', { expectedWarnings: ['sTER: Must precede IDAT'] }],
        ], imageTestSuiteRoot);
    });
    describe('invalid duplicate chunks', () => {
        (0, testUtil_js_1.createTests)([
            ['008b8bb75b8a487dc5aac86c9abb06fb', 'multiple sBIT not allowed', { shouldThrow: 'sBIT: Multiple sBIT chunks not allowed', strictMode: true }],
            ['008b8bb75b8a487dc5aac86c9abb06fb', 'should decode with warnings', { expectedWarnings: ['sBIT: Multiple sBIT chunks not allowed'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['0132cfdbd8ca323574a2072e7ed5014c', 'multiple sRGB not allowed', { shouldThrow: 'sRGB: Multiple sRGB chunks not allowed', strictMode: true }],
            ['0132cfdbd8ca323574a2072e7ed5014c', 'should decode with warnings', { expectedWarnings: ['sRGB: Multiple sRGB chunks not allowed'], expectedDimensions: { width: 48, height: 48 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['0d466db9067b719df0b06ef441bf1ee7', 'multiple iCCP not allowed', { shouldThrow: 'iCCP: Multiple iCCP chunks not allowed', strictMode: true }],
            ['0d466db9067b719df0b06ef441bf1ee7', 'should decode with warnings', { expectedWarnings: ['iCCP: Multiple iCCP chunks not allowed'], expectedDimensions: { width: 48, height: 48 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['13f665c09e4b03cdbe2fff3015ec8aa7', 'multiple bKGD not allowed', { shouldThrow: 'bKGD: Multiple bKGD chunks not allowed', strictMode: true }],
            ['13f665c09e4b03cdbe2fff3015ec8aa7', 'should decode with warnings', { expectedWarnings: ['bKGD: Multiple bKGD chunks not allowed'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['1bcc34d49e56a2fba38490db206328b8', 'multiple sCAL not allowed', { shouldThrow: 'sCAL: Multiple sCAL chunks not allowed', strictMode: true }],
            ['1bcc34d49e56a2fba38490db206328b8', 'should decode with warnings', { expectedWarnings: ['sCAL: Multiple sCAL chunks not allowed'], expectedDimensions: { width: 91, height: 69 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['463d3570f92a6b6ecba0cc4fd9a7a384', 'multiple PLTE not allowed', { shouldThrow: 'PLTE: Multiple PLTE chunks not allowed', strictMode: true }],
            ['463d3570f92a6b6ecba0cc4fd9a7a384', 'should decode with warnings', { expectedWarnings: ['PLTE: Multiple PLTE chunks not allowed'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['5beaadc10dfdbf61124e98fdf8a5c191', 'multiple sTER not allowed', { shouldThrow: 'sTER: Multiple sTER chunks not allowed', strictMode: true }],
            ['5beaadc10dfdbf61124e98fdf8a5c191', 'should decode with warnings', { expectedWarnings: ['sTER: Multiple sTER chunks not allowed'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['611b294df9cf794eeaa1ffcc620bf6a4', 'multiple oFFs not allowed', { shouldThrow: 'oFFs: Multiple oFFs chunks not allowed', strictMode: true }],
            ['611b294df9cf794eeaa1ffcc620bf6a4', 'multiple oFFs not allowed', { expectedWarnings: ['oFFs: Multiple oFFs chunks not allowed'], expectedDimensions: { width: 91, height: 69 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['64221ffc9050c92b8980326acc0e4194', 'multiple pCAL not allowed', { shouldThrow: 'pCAL: Multiple pCAL chunks not allowed', strictMode: true }],
            ['64221ffc9050c92b8980326acc0e4194', 'multiple pCAL not allowed', { expectedWarnings: ['pCAL: Multiple pCAL chunks not allowed'], expectedDimensions: { width: 91, height: 69 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['9bd8a9ed81c5a9190f74496197da7249', 'multiple tIME not allowed', { shouldThrow: 'tIME: Multiple tIME chunks not allowed', strictMode: true }],
            ['9bd8a9ed81c5a9190f74496197da7249', 'should decode with warnings', { expectedWarnings: ['tIME: Multiple tIME chunks not allowed'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['a1d54c960686558901e320a52a967158', 'multiple hIST not allowed', { shouldThrow: 'hIST: Multiple hIST chunks not allowed', strictMode: true }],
            ['a1d54c960686558901e320a52a967158', 'should decode with warnings', { expectedWarnings: ['hIST: Multiple hIST chunks not allowed'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['a24a39e69554a701412b3ed0c009e7f6', 'multiple cHRM not allowed', { shouldThrow: 'cHRM: Multiple cHRM chunks not allowed', strictMode: true }],
            ['a24a39e69554a701412b3ed0c009e7f6', 'should decode with warnings', { expectedWarnings: ['cHRM: Multiple cHRM chunks not allowed'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['f757de9794666c3d14985210679bc98c', 'multiple pHYs not allowed', { shouldThrow: 'pHYs: Multiple pHYs chunks not allowed', strictMode: true }],
            ['f757de9794666c3d14985210679bc98c', 'should decode with warnings', { expectedWarnings: ['pHYs: Multiple pHYs chunks not allowed'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['fa9f6aa9bcc679d20e171dbf07a628fd', 'multiple gAMA not allowed', { shouldThrow: 'gAMA: Multiple gAMA chunks not allowed', strictMode: true }],
            ['fa9f6aa9bcc679d20e171dbf07a628fd', 'should decode with warnings', { expectedWarnings: ['gAMA: Multiple gAMA chunks not allowed'] }],
        ], imageTestSuiteRoot);
    });
    describe('mutually exclusive chunks', () => {
        (0, testUtil_js_1.createTests)([
            ['2a6ff5f8106894b22dad3ce99673481a', 'iCCP not allowed with sRGB', { shouldThrow: 'iCCP: Should not be present alongside sRGB', strictMode: true }],
            ['2a6ff5f8106894b22dad3ce99673481a', 'iCCP not allowed with sRGB', { expectedWarnings: ['iCCP: Should not be present alongside sRGB'], expectedDimensions: { width: 52, height: 30 } }],
        ], imageTestSuiteRoot);
    });
    describe('invalid chunk length', () => {
        (0, testUtil_js_1.createTests)([
            ['073c98872b81d1004d750f18a4b5f732', 'invalid sTER length', { shouldThrow: 'sTER: Invalid data length: 2 !== 1', strictMode: true }],
            ['073c98872b81d1004d750f18a4b5f732', 'should decode with warnings', { expectedWarnings: ['sTER: Invalid data length: 2 !== 1'] }]
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['0b7d50ac449fd59eb3de00647636d0c9', 'invalid cHRM length', { shouldThrow: 'cHRM: Invalid data length: 31 !== 32', strictMode: true }],
            ['0b7d50ac449fd59eb3de00647636d0c9', 'should decode with warnings', { expectedWarnings: ['cHRM: Invalid data length: 31 !== 32'] }]
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['138331052d7c6e4acebfaa92af314e12', 'invalid number of hIST entries', { shouldThrow: 'hIST: Invalid data length: 28 !== 30', strictMode: true }],
            ['138331052d7c6e4acebfaa92af314e12', 'should decode with warnings', { expectedWarnings: ['hIST: Invalid data length: 28 !== 30'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['4c5b82ba0a9c12356007bd71e52185b2', 'invalid sRGB length', { shouldThrow: 'sRGB: Invalid data length: 0 !== 1', strictMode: true }],
            ['4c5b82ba0a9c12356007bd71e52185b2', 'should decode with warnings', { expectedWarnings: ['sRGB: Invalid data length: 0 !== 1'], expectedDimensions: { width: 212, height: 141 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['4f14b7aab3a41855378c5517342598b9', 'invalid tRNS length for palette image', { shouldThrow: 'tRNS: Invalid data length for color type 3: 174 > 173', strictMode: true }],
            ['4f14b7aab3a41855378c5517342598b9', 'should decode with warnings', { expectedWarnings: ['tRNS: Invalid data length for color type 3: 174 > 173'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['579294d4d8110fc64980dd72a5066780', 'invalid number of PLTE entries (257)', { shouldThrow: 'PLTE: Too many entries (257 > 256)', strictMode: true }],
            ['579294d4d8110fc64980dd72a5066780', 'invalid number of PLTE entries (257)', { expectedWarnings: [
                        'PLTE: Too many entries (257 > 256)',
                        'PLTE: Too many entries for bit depth (257 > 2^8)'
                    ] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['8711007ea5e351755a80cba913d16a32', 'invalid number of sPLT entries (0.6)', { shouldThrow: 'sPLT: Invalid data length: 6 should be divisible by entry size 10', strictMode: true }],
            ['8711007ea5e351755a80cba913d16a32', 'should decode with warnings', { expectedWarnings: ['sPLT: Invalid data length: 6 should be divisible by entry size 10'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['b583e48e218193e4c287f033931a6314', 'invalid number of PLTE entries (0)', { shouldThrow: 'PLTE: Cannot have 0 entries' }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c0a76d267196727887d45de4889bec33', 'invalid oFFs length', { shouldThrow: 'oFFs: Invalid data length: 8 !== 9', strictMode: true }],
            ['c0a76d267196727887d45de4889bec33', 'should decode with warnings', { expectedWarnings: ['oFFs: Invalid data length: 8 !== 9'], expectedDimensions: { width: 91, height: 69 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['d92428f3fc9c806b0a4373b54e06785e', 'invalid tIME length', { shouldThrow: 'tIME: Invalid data length: 9 !== 7', strictMode: true }],
            ['d92428f3fc9c806b0a4373b54e06785e', 'should decode with warnings', { expectedWarnings: ['tIME: Invalid data length: 9 !== 7'], expectedDimensions: { width: 400, height: 310 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['dd18aac055d531e0e4ff8979458dbaa3', 'invalid number of sPLT entries (1.66667)', { shouldThrow: 'sPLT: Invalid data length: 10 should be divisible by entry size 6', strictMode: true }],
            ['dd18aac055d531e0e4ff8979458dbaa3', 'should decode with warnings', { expectedWarnings: ['sPLT: Invalid data length: 10 should be divisible by entry size 6'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['e76546768d4a8f2f4c39339345c7614c', 'invalid pHYs length', { shouldThrow: 'pHYs: Invalid data length: 8 !== 9', strictMode: true }],
            ['e76546768d4a8f2f4c39339345c7614c', 'should decode with warnings', { expectedWarnings: ['pHYs: Invalid data length: 8 !== 9'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['f427b6bee1acd1fea3ec953bc556a18a', 'invalid number of PLTE entries (0)', { shouldThrow: 'PLTE: Cannot have 0 entries' }],
        ], imageTestSuiteRoot);
    });
    describe('invalid chunk data property value', () => {
        (0, testUtil_js_1.createTests)([
            ['4389427591c18bf36e748172640862c3', 'invalid sTER layout mode', { shouldThrow: 'sTER: Invalid layout mode "2"', strictMode: true }],
            ['4389427591c18bf36e748172640862c3', 'invalid sTER layout mode', { expectedWarnings: ['sTER: Invalid layout mode "2"'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['6399623892b45aa4901aa6e702c7a62d', 'invalid negative sCAL value(s)', { shouldThrow: 'sCAL: Values cannot be negative (1, -1)', strictMode: true }],
            ['6399623892b45aa4901aa6e702c7a62d', 'should decode with warnings', { expectedWarnings: ['sCAL: Values cannot be negative (1, -1)'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['8905ba870cd5d3327a8310fa437aa076', 'invalid character (\'Q\' = 0x51) in sCAL', { shouldThrow: 'sCAL: Invalid character in floating point number ("Q.527777777778e-04")', strictMode: true }],
            ['8905ba870cd5d3327a8310fa437aa076', 'should decode with warnings', { expectedWarnings: ['sCAL: Invalid character in floating point number ("Q.527777777778e-04")'], expectedDimensions: { width: 91, height: 69 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['7ce702ec69b7af26b3218d1278520bce', 'IHDR: Filter method "128" is not valid', { shouldThrow: 'IHDR: Filter method "128" is not valid', strictMode: true }],
            ['7ce702ec69b7af26b3218d1278520bce', 'should decode with warnings', { expectedWarnings: ['IHDR: Filter method \"128\" is not valid'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['a1d1aafb5bca660229f8e9fc65291eab', 'private (invalid?) IHDR compression method (128) (warning)', { shouldThrow: 'IHDR: Unknown compression method "128"', strictMode: true }],
            ['a1d1aafb5bca660229f8e9fc65291eab', 'should decode with warnings', { expectedWarnings: ['IHDR: Unknown compression method "128"'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['d45b0dbbb808df6486f8a13ea44ea174', 'invalid oFFs unit specifier (2)', { shouldThrow: 'oFFs: Invalid oFFs unit type ("2")', strictMode: true }],
            ['d45b0dbbb808df6486f8a13ea44ea174', 'should decode with warnings', { expectedWarnings: ['oFFs: Invalid oFFs unit type ("2")'], expectedDimensions: { width: 91, height: 69 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['f5e7b9db8e8d002a26304f5c81889ee1', 'EOF while reading IHDR data', { shouldThrow: 'EOF while reading chunk "IHDR"' }],
        ], imageTestSuiteRoot);
    });
    describe('badly damaged files (multiple problems)', () => {
        (0, testUtil_js_1.createTests)([
            ['m1-04c2707d63235dd5ab2c66ee98a36521', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m2-0699098e769a2d80e60f33dbb3332b61', 'should throw', { shouldThrow: true }],
            ['m1-0699098e769a2d80e60f33dbb3332b61', 'should throw', { shouldThrow: true }],
            ['m2-0699098e769a2d80e60f33dbb3332b61', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-125cdc39e13ce7c237b7b4a9e1d8f21c', 'should throw', { shouldThrow: true }],
            ['m1-125cdc39e13ce7c237b7b4a9e1d8f21c', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['18288f761922f9b9b00e927eaeb9e707', 'should throw', { shouldThrow: true }]
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-19e0d1d0dfe97dca39e9d449c6b8b3d2', 'should throw', { shouldThrow: 'CRC for chunk "mkBT" at offset 0x3c02 doesn\'t match (0x52da2a66 !== 0x28db6e2e)', strictMode: true }],
            ['c-m1-19e0d1d0dfe97dca39e9d449c6b8b3d2', 'should throw', { shouldThrow: 'IDAT: Inflate error: incorrect data check' }],
            ['m1-19e0d1d0dfe97dca39e9d449c6b8b3d2', 'should throw', { shouldThrow: 'CRC for chunk "IHDR" at offset 0x8 doesn\'t match (0x97d650c0 !== 0xe0d16056)', strictMode: true }],
            ['m1-19e0d1d0dfe97dca39e9d449c6b8b3d2', 'should throw', { shouldThrow: 'IDAT: Inflate error: incorrect data check' }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['m1-1b5df699719c4a7cc8314ab9af139405', 'should throw', { shouldThrow: 'CRC for chunk "IDAT" at offset 0xa2 doesn\'t match (0xb4be58e1 !== 0x6275f80e)', strictMode: true }],
            ['m1-1b5df699719c4a7cc8314ab9af139405', 'should throw', { shouldThrow: 'IDAT: Inflate error: incorrect data check' }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-1f97f040d0b6b26faeb0a1a7f1499590', 'should throw', { shouldThrow: true }],
            ['c-m2-1f97f040d0b6b26faeb0a1a7f1499590', 'should throw', { shouldThrow: true }],
            ['c-m3-1f97f040d0b6b26faeb0a1a7f1499590', 'should throw', { shouldThrow: true }],
            ['c-m5-1f97f040d0b6b26faeb0a1a7f1499590', 'should throw', { shouldThrow: true }],
            ['c-m6-1f97f040d0b6b26faeb0a1a7f1499590', 'should throw', { shouldThrow: true }],
            ['c-m7-1f97f040d0b6b26faeb0a1a7f1499590', 'should throw', { shouldThrow: true }],
            ['c-m8-1f97f040d0b6b26faeb0a1a7f1499590', 'should throw', { shouldThrow: true }],
            ['m1-1f97f040d0b6b26faeb0a1a7f1499590', 'should throw', { shouldThrow: true }],
            ['m2-1f97f040d0b6b26faeb0a1a7f1499590', 'should throw', { shouldThrow: true }],
            ['m3-1f97f040d0b6b26faeb0a1a7f1499590', 'should throw', { shouldThrow: true }],
            ['m4-1f97f040d0b6b26faeb0a1a7f1499590', 'should throw', { shouldThrow: true }],
            ['m5-1f97f040d0b6b26faeb0a1a7f1499590', 'should throw', { shouldThrow: true }],
            ['m6-1f97f040d0b6b26faeb0a1a7f1499590', 'should throw', { shouldThrow: true }],
            ['m7-1f97f040d0b6b26faeb0a1a7f1499590', 'should throw', { shouldThrow: true }],
            ['m8-1f97f040d0b6b26faeb0a1a7f1499590', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-1fc0c0de88608a9445d6f98a544b5abc', 'should throw', { shouldThrow: 'Last chunk is not IEND', strictMode: true }],
            ['c-m1-1fc0c0de88608a9445d6f98a544b5abc', 'should throw', { shouldThrow: 'Unrecognized critical chunk type "IdND"' }],
            ['m1-1fc0c0de88608a9445d6f98a544b5abc', 'should throw', { shouldThrow: 'CRC for chunk "mkTS" at offset 0x202 doesn\'t match (0xeda6716d !== 0xe7e8c98)', strictMode: true }],
            ['m1-1fc0c0de88608a9445d6f98a544b5abc', 'should throw', { shouldThrow: 'Unrecognized critical chunk type "IdND"' }]
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m2-272ae9468b7883e5cf61873a17271fb4', 'should throw', { shouldThrow: true }],
            ['m1-272ae9468b7883e5cf61873a17271fb4', 'should throw', { shouldThrow: true }],
            ['m2-272ae9468b7883e5cf61873a17271fb4', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-2dc3bdd9274b121b851fa536b0e35b6a', 'should throw', { shouldThrow: true }],
            ['c-m2-2dc3bdd9274b121b851fa536b0e35b6a', 'should throw', { shouldThrow: true }],
            ['m1-2dc3bdd9274b121b851fa536b0e35b6a', 'should throw', { shouldThrow: true }],
            ['m2-2dc3bdd9274b121b851fa536b0e35b6a', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['3625f98e00148cdc136c53bdcd2d2e1e', 'should throw', { shouldThrow: true }],
            ['c-3625f98e00148cdc136c53bdcd2d2e1e', 'should throw', { shouldThrow: true }],
            ['c-m1-3625f98e00148cdc136c53bdcd2d2e1e', 'should throw', { shouldThrow: true }],
            ['m1-3625f98e00148cdc136c53bdcd2d2e1e', 'should throw', { shouldThrow: true }],
            ['m2-3625f98e00148cdc136c53bdcd2d2e1e', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-49e39033e275de9786d8c41f834c710b', 'should throw', { shouldThrow: true }],
            ['m1-49e39033e275de9786d8c41f834c710b', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['4aae896ba900c48c63cffc0cc9f8c4dc', 'should throw', { shouldThrow: 'Last chunk is not IEND', strictMode: true }],
            ['4aae896ba900c48c63cffc0cc9f8c4dc', 'should throw', { shouldThrow: 'No IDAT chunk' }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-4bdd87fd0324f0a3d84d6905d17e1731', 'should throw', { shouldThrow: true }],
            ['m1-4bdd87fd0324f0a3d84d6905d17e1731', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-559dcf17d281e285b7f09f943b9706de', 'should throw', { shouldThrow: true }],
            ['c-m2-559dcf17d281e285b7f09f943b9706de', 'should throw', { shouldThrow: true }],
            ['m1-559dcf17d281e285b7f09f943b9706de', 'should throw', { shouldThrow: true }],
            ['m2-559dcf17d281e285b7f09f943b9706de', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-585dd0ac594e8226c49ae7986b8f47d3', 'should throw', { shouldThrow: true }],
            ['m1-585dd0ac594e8226c49ae7986b8f47d3', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['586914b5d01d3889fb7bb5c44fe29771', 'should throw', { shouldThrow: true }],
            ['c-586914b5d01d3889fb7bb5c44fe29771', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-58d30745083f25952342caafb6ee5f37', 'should throw', { shouldThrow: true }],
            ['m1-58d30745083f25952342caafb6ee5f37', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m2-593d4b1a0b5d13b539c6c098dc5797ca', 'should throw', { shouldThrow: true }],
            ['c-m3-593d4b1a0b5d13b539c6c098dc5797ca', 'should throw', { shouldThrow: true }],
            ['m1-593d4b1a0b5d13b539c6c098dc5797ca', 'should throw', { shouldThrow: true }],
            ['m2-593d4b1a0b5d13b539c6c098dc5797ca', 'should throw', { shouldThrow: true }],
            ['m3-593d4b1a0b5d13b539c6c098dc5797ca', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['m1-5ae377bebf643e2e53ba7038103e48c4', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-5e149c14dc7b7c16ff6bcedd1625ca31', 'should throw', { shouldThrow: true }],
            ['m1-5e149c14dc7b7c16ff6bcedd1625ca31', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['5e2b64196b9e014e0ed0a27873cafdb3', 'should throw', { shouldThrow: 'CRC for chunk "sRGB" at offset 0x31 doesn\'t match (0xaece1ce9 !== 0xa9a3d8f0)', strictMode: true }],
            ['5e2b64196b9e014e0ed0a27873cafdb3', 'should decode with warnings', { expectedWarnings: [
                        'CRC for chunk "cHRM" at offset 0x3e doesn\'t match (0x9cba513c !== 0x1d9f341b)',
                        'CRC for chunk "sRGB" at offset 0x31 doesn\'t match (0xaece1ce9 !== 0xa9a3d8f0)',
                        'cHRM: Invalid red (168.41216,0.33)',
                        'sRGB: Invalid rendering intent "4"',
                    ], expectedInfo: ['Unrecognized chunk type "vpAg"'], expectedDimensions: { width: 200, height: 250 } }],
            ['c-5e2b64196b9e014e0ed0a27873cafdb3', 'should throw', { shouldThrow: 'sRGB: Invalid rendering intent "4"', strictMode: true }],
            ['c-5e2b64196b9e014e0ed0a27873cafdb3', 'should decode with warnings', { expectedWarnings: [
                        'cHRM: Invalid red (168.41216,0.33)',
                        'sRGB: Invalid rendering intent "4"'
                    ], expectedInfo: ['Unrecognized chunk type "vpAg"'], expectedDimensions: { width: 200, height: 250 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['m1-5efba06832cc674ae5d290ba7ebc2533', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-6593e140dba21ccb8c8724f8fe88fdb6', 'should throw', { shouldThrow: true }],
            ['m1-6593e140dba21ccb8c8724f8fe88fdb6', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-6e3914f26bcc8f9d004ffeac71656c01', 'should throw', { shouldThrow: true }],
            ['m1-6e3914f26bcc8f9d004ffeac71656c01', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m2-71915ab0b1cc7350091ef7073a312d16', 'should throw', { shouldThrow: true }],
            ['m1-71915ab0b1cc7350091ef7073a312d16', 'should throw', { shouldThrow: true }],
            ['m2-71915ab0b1cc7350091ef7073a312d16', 'should throw', { shouldThrow: true }],
            ['m3-71915ab0b1cc7350091ef7073a312d16', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['71dd006377602359ebd2cbe7b9eaab09', 'should throw', { shouldThrow: true }],
            ['c-71dd006377602359ebd2cbe7b9eaab09', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['743b8442c69efbc457af7376af71b44c', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['m1-7dc9db3d3e510156c619273f8f913cbe', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-80e163ebface8b0d2fbf9823bca02936', 'should throw', { shouldThrow: true }],
            ['c-m2-80e163ebface8b0d2fbf9823bca02936', 'should throw', { shouldThrow: true }],
            ['m1-80e163ebface8b0d2fbf9823bca02936', 'should throw', { shouldThrow: true }],
            ['m2-80e163ebface8b0d2fbf9823bca02936', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['m1-814fcedc62fe4e43923c042ff1d6747f', 'should throw', { shouldThrow: true }],
            ['m2-814fcedc62fe4e43923c042ff1d6747f', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['817f96555e2d683e7b12f778c4e38022', 'should throw', { shouldThrow: true }],
            ['c-817f96555e2d683e7b12f778c4e38022', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-8f2b481b7fd9bd745e620b7c01a18df2', 'should throw', { shouldThrow: 'CRC for chunk "wEND" at offset 0x7d9 doesn\'t match (0xae426082 !== 0xbeb6ef10)', strictMode: true }],
            ['c-m1-8f2b481b7fd9bd745e620b7c01a18df2', 'should decode with warnings', { expectedWarnings: [
                        'CRC for chunk "wEND" at offset 0x7d9 doesn\'t match (0xae426082 !== 0xbeb6ef10)',
                        'Last chunk is not IEND',
                        'tEXt: No null character after text'
                    ], expectedInfo: ['Unrecognized chunk type "wEND"'], expectedDimensions: { width: 73, height: 31 } }],
            ['c-m2-8f2b481b7fd9bd745e620b7c01a18df2', 'should throw', { shouldThrow: 'IDAT: Failed to decompress data chunks' }],
            ['m1-8f2b481b7fd9bd745e620b7c01a18df2', 'should throw', { shouldThrow: 'CRC for chunk "tEXt" at offset 0x67 doesn\'t match (0xeede1190 !== 0x53f53b16)', strictMode: true }],
            ['m1-8f2b481b7fd9bd745e620b7c01a18df2', 'should decode with warnings', { expectedWarnings: [
                        'CRC for chunk "tEXt" at offset 0x67 doesn\'t match (0xeede1190 !== 0x53f53b16)',
                        'CRC for chunk "wEND" at offset 0x7d9 doesn\'t match (0xae426082 !== 0xbeb6ef10)',
                        'Last chunk is not IEND',
                        'tEXt: No null character after text'
                    ], expectedInfo: ['Unrecognized chunk type "wEND"'], expectedDimensions: { width: 73, height: 31 } }],
            ['m2-8f2b481b7fd9bd745e620b7c01a18df2', 'should throw', { shouldThrow: 'IDAT: Failed to decompress data chunks' }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['9032e447e32e09aef5b7de2fab42494d', 'should throw', { shouldThrow: 'CRC for chunk "IHDR" at offset 0x89 doesn\'t match (0xae426082 !== 0xa8a1ae0a)', strictMode: true }],
            ['9032e447e32e09aef5b7de2fab42494d', 'should decode with warnings', { expectedWarnings: [
                        'CRC for chunk "IHDR" at offset 0x89 doesn\'t match (0xae426082 !== 0xa8a1ae0a)',
                        'IHDR: Multiple IHDR chunks not allowed',
                        'Last chunk is not IEND'
                    ], expectedDimensions: { width: 8, height: 8 } }],
            ['c-9032e447e32e09aef5b7de2fab42494d', 'should throw', { shouldThrow: 'Last chunk is not IEND', strictMode: true }],
            ['c-9032e447e32e09aef5b7de2fab42494d', 'should decode with warnings', { expectedWarnings: [
                        'IHDR: Multiple IHDR chunks not allowed',
                        'Last chunk is not IEND'
                    ], expectedDimensions: { width: 8, height: 8 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['94e1bdbb03c42581d8407602634636ea', 'should throw', { shouldThrow: 'CRC for chunk "sPLT" at offset 0x89 doesn\'t match (0xae426082 !== 0x4b86b3a)', strictMode: true }],
            ['94e1bdbb03c42581d8407602634636ea', 'should decode with warnings', { expectedWarnings: [
                        'CRC for chunk "sPLT" at offset 0x89 doesn\'t match (0xae426082 !== 0x4b86b3a)',
                        'Last chunk is not IEND',
                        'sPLT: EOF while reading text',
                        'sPLT: Must precede IDAT'
                    ], expectedDimensions: { width: 8, height: 8 } }],
            ['c-94e1bdbb03c42581d8407602634636ea', 'should throw', { shouldThrow: 'Last chunk is not IEND', strictMode: true }],
            ['c-94e1bdbb03c42581d8407602634636ea', 'should decode with warnings', { expectedWarnings: [
                        'Last chunk is not IEND',
                        'sPLT: EOF while reading text',
                        'sPLT: Must precede IDAT'
                    ], expectedDimensions: { width: 8, height: 8 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['m1-94f94e608d647b1b433f4d0ecc21e023', 'should throw', { shouldThrow: true }],
            ['m2-94f94e608d647b1b433f4d0ecc21e023', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['9540743374e1fdb273b6a6ca625eb7a3', 'should throw', { shouldThrow: 'gAMA: A value of 0 is meaningless', strictMode: true }],
            ['9540743374e1fdb273b6a6ca625eb7a3', 'should decode with warnings', { expectedWarnings: [
                        'gAMA: A value of 0 is meaningless',
                        'cHRM: Invalid white point (42949.67295,42949.67295)'
                    ], expectedDimensions: { width: 400, height: 528 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m2-96b70653ba3f8a83b7cfd48749bed8b1', 'should throw', { shouldThrow: true }],
            ['c-m4-96b70653ba3f8a83b7cfd48749bed8b1', 'should throw', { shouldThrow: true }],
            ['m1-96b70653ba3f8a83b7cfd48749bed8b1', 'should throw', { shouldThrow: true }],
            ['m3-96b70653ba3f8a83b7cfd48749bed8b1', 'should throw', { shouldThrow: true }],
            ['m2-96b70653ba3f8a83b7cfd48749bed8b1', 'should throw', { shouldThrow: true }],
            ['m4-96b70653ba3f8a83b7cfd48749bed8b1', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['9a3e0c7b687b526987e2270541002d47', 'should throw', { shouldThrow: true }],
            ['c-9a3e0c7b687b526987e2270541002d47', 'should throw', { shouldThrow: true }],
            ['c-m1-9a3e0c7b687b526987e2270541002d47', 'should throw', { shouldThrow: true }],
            ['c-m2-9a3e0c7b687b526987e2270541002d47', 'should throw', { shouldThrow: true }],
            ['m1-9a3e0c7b687b526987e2270541002d47', 'should throw', { shouldThrow: true }],
            ['m2-9a3e0c7b687b526987e2270541002d47', 'should throw', { shouldThrow: true }],
            ['m3-9a3e0c7b687b526987e2270541002d47', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['m1-9bec9d0461c0ef0f5faf16d0d4bdcc13', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['m1-9eb5b67f01da30f0e16062004c343e4a', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m2-a1f9d85a8243b884d40e74f656c55e75', 'should throw', { shouldThrow: true }],
            ['m1-a1f9d85a8243b884d40e74f656c55e75', 'should throw', { shouldThrow: true }],
            ['m2-a1f9d85a8243b884d40e74f656c55e75', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m2-a46ce91d8975a017917156b8824f936e', 'should throw', { shouldThrow: true }],
            ['c-m3-a46ce91d8975a017917156b8824f936e', 'should throw', { shouldThrow: true }],
            ['c-m4-a46ce91d8975a017917156b8824f936e', 'should throw', { shouldThrow: true }],
            ['c-m5-a46ce91d8975a017917156b8824f936e', 'should throw', { shouldThrow: true }],
            ['c-m6-a46ce91d8975a017917156b8824f936e', 'should throw', { shouldThrow: true }],
            ['c-m7-a46ce91d8975a017917156b8824f936e', 'should throw', { shouldThrow: true }],
            ['c-m8-a46ce91d8975a017917156b8824f936e', 'should throw', { shouldThrow: true }],
            ['m1-a46ce91d8975a017917156b8824f936e', 'should throw', { shouldThrow: true }],
            ['m2-a46ce91d8975a017917156b8824f936e', 'should throw', { shouldThrow: true }],
            ['m3-a46ce91d8975a017917156b8824f936e', 'should throw', { shouldThrow: true }],
            ['m4-a46ce91d8975a017917156b8824f936e', 'should throw', { shouldThrow: true }],
            ['m5-a46ce91d8975a017917156b8824f936e', 'should throw', { shouldThrow: true }],
            ['m6-a46ce91d8975a017917156b8824f936e', 'should throw', { shouldThrow: true }],
            ['m7-a46ce91d8975a017917156b8824f936e', 'should throw', { shouldThrow: true }],
            ['m8-a46ce91d8975a017917156b8824f936e', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['m1-a4842373fc20cc42b8e023a329761915', 'should throw', { shouldThrow: 'CRC for chunk "IHDR" at offset 0x8 doesn\'t match (0x815467c7 !== 0x93e1c829)', strictMode: true }],
            ['m1-a4842373fc20cc42b8e023a329761915', 'should throw', { shouldThrow: 'hIST: Must follow PLTE' }],
            ['c-m1-a4842373fc20cc42b8e023a329761915', 'should throw', { shouldThrow: 'CRC for chunk "sBIT" at offset 0x31 doesn\'t match (0x77f8fca3 !== 0x77f8b5a3)', strictMode: true }],
            ['c-m1-a4842373fc20cc42b8e023a329761915', 'should throw', { shouldThrow: 'hIST: Must follow PLTE' }],
            ['c-m2-a4842373fc20cc42b8e023a329761915', 'should throw', { shouldThrow: true }],
            ['m2-a4842373fc20cc42b8e023a329761915', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-aded9dc1dc9361363ad0b426c2ff1846', 'should throw', { shouldThrow: true }],
            ['m1-aded9dc1dc9361363ad0b426c2ff1846', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['m2-b68163a6a8e2ccf3c8ad2c70a26c1150', 'should throw', { shouldThrow: true }],
            ['c-m3-b68163a6a8e2ccf3c8ad2c70a26c1150', 'should throw', { shouldThrow: true }],
            ['m1-b68163a6a8e2ccf3c8ad2c70a26c1150', 'should throw', { shouldThrow: true }],
            ['m3-b68163a6a8e2ccf3c8ad2c70a26c1150', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['m1-b977e74d9de1f6689fdd84c4e38830f5', 'should throw', { shouldThrow: true }],
            ['c-m1-b977e74d9de1f6689fdd84c4e38830f5', 'should throw', { shouldThrow: true }],
            ['c-m2-b977e74d9de1f6689fdd84c4e38830f5', 'should throw', { shouldThrow: true }],
            ['m2-b977e74d9de1f6689fdd84c4e38830f5', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['bd927c8547634cdbdd22af0afe818a9b', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['bf203e765c98b12f6c2b2c33577c730d', 'should throw', { shouldThrow: 'pCAL: Must precede IDAT', strictMode: true }],
            ['bf203e765c98b12f6c2b2c33577c730d', 'should decode with warnings', { expectedWarnings: [
                        'oFFs: Must precede IDAT',
                        'pCAL: Must precede IDAT',
                        'pHYs: Must precede IDAT',
                        'sCAL: Must precede IDAT'
                    ], expectedDimensions: { width: 91, height: 69 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-bfce28c0e44bc8d1824d48fbec5075e2', 'should throw', { shouldThrow: true }],
            ['m1-bfce28c0e44bc8d1824d48fbec5075e2', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c53911b0385c34a8204c30fdc14ea5cc', 'should throw', { shouldThrow: 'CRC for chunk "IDAT" at offset 0x89 doesn\'t match (0xae426082 !== 0x35af061e)', strictMode: true }],
            ['c53911b0385c34a8204c30fdc14ea5cc', 'should decode with warnings', { expectedWarnings: [
                        'CRC for chunk "IDAT" at offset 0x89 doesn\'t match (0xae426082 !== 0x35af061e)',
                        'Last chunk is not IEND'
                    ], expectedDimensions: { width: 8, height: 8 } }],
            ['c-c53911b0385c34a8204c30fdc14ea5cc', 'should throw', { shouldThrow: 'Last chunk is not IEND', strictMode: true }],
            ['c-c53911b0385c34a8204c30fdc14ea5cc', 'should decode with warnings', { expectedWarnings: [
                        'Last chunk is not IEND'
                    ], expectedDimensions: { width: 8, height: 8 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-c5a372c145ce25ce712959cd3b6df35e', 'should throw', { shouldThrow: true }],
            ['m1-c5a372c145ce25ce712959cd3b6df35e', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['m1-cb265e4ae8967567fca5b0ecd58b90cb', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-d3ffec5786387c590721e674d705f16e', 'should throw', { shouldThrow: 'CRC for chunk "aEND" at offset 0x19b doesn\'t match (0xae426082 !== 0xcbc4e753)', strictMode: true }],
            ['c-d3ffec5786387c590721e674d705f16e', 'should throw', { expectedWarnings: [
                        'CRC for chunk "aEND" at offset 0x19b doesn\'t match (0xae426082 !== 0xcbc4e753)',
                        'Last chunk is not IEND'
                    ], expectedInfo: ['Unrecognized chunk type "aEND"'], expectedDimensions: { width: 1, height: 418 } }],
            ['d3ffec5786387c590721e674d705f16e', 'should throw', { shouldThrow: 'CRC for chunk "IHDR" at offset 0x8 doesn\'t match (0x6e096d3c !== 0x51ed9ceb)', strictMode: true }],
            ['d3ffec5786387c590721e674d705f16e', 'should throw', { expectedWarnings: [
                        'CRC for chunk "IHDR" at offset 0x8 doesn\'t match (0x6e096d3c !== 0x51ed9ceb)',
                        'CRC for chunk "aEND" at offset 0x19b doesn\'t match (0xae426082 !== 0xcbc4e753)',
                        'Last chunk is not IEND'
                    ], expectedInfo: ['Unrecognized chunk type "aEND"'], expectedDimensions: { width: 1, height: 418 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['m1-d4b25a2b8b5fcec0a3e284579d539f35', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-d87a07bdc461bf81e43447ca0620d71d', 'should throw', { shouldThrow: true }],
            ['m1-d87a07bdc461bf81e43447ca0620d71d', 'should throw', { shouldThrow: true }],
            ['m2-d87a07bdc461bf81e43447ca0620d71d', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['m1-e275d32a37943b0d5eeb86ffb04b7cf2', 'should throw', { shouldThrow: true }],
            ['m2-e275d32a37943b0d5eeb86ffb04b7cf2', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-e585afb2ecf50c04eaf0dedb71602cb8', 'should throw', { shouldThrow: true }],
            ['e585afb2ecf50c04eaf0dedb71602cb8', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-ea01d6c175bb25dc75757cf8a5793822', 'should throw', { shouldThrow: true }],
            ['ea01d6c175bb25dc75757cf8a5793822', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['edf5c1b0aa5b01eea5017290a286a173', 'should throw', { shouldThrow: 'Could not parse chunk after IEND: EOF while reading chunk length', strictMode: true }],
            ['edf5c1b0aa5b01eea5017290a286a173', 'should decode with warnings', { expectedWarnings: [
                        'Could not parse chunk after IEND: EOF while reading chunk length'
                    ], expectedDimensions: { width: 103, height: 125 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-f23a99688fa66359f6186678e6b2f14a', 'should throw', { shouldThrow: true }],
            ['f23a99688fa66359f6186678e6b2f14a', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['f85c09bb72db5a572d24b8d3a0d56542', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['m1-fcac2d6a6a739e8ceb946ac99200d9f1', 'should throw', { shouldThrow: true }],
            ['c-m1-fcac2d6a6a739e8ceb946ac99200d9f1', 'should throw', { shouldThrow: true }],
            ['c-m2-fcac2d6a6a739e8ceb946ac99200d9f1', 'should throw', { shouldThrow: true }],
            ['m2-fcac2d6a6a739e8ceb946ac99200d9f1', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['fde6410fe7fb87f095bc855279d5beab', 'should throw', { shouldThrow: true }],
        ], imageTestSuiteRoot);
    });
    describe('invalid and repaired', () => {
        (0, testUtil_js_1.createTests)([
            ['66ac49ef3f48ac9482049e1ab57a53e9', '80x15, 32-bit RGB+alpha, non-interlaced, 16.0%', { expectedDimensions: { width: 80, height: 15 } }],
            ['c-m1-66ac49ef3f48ac9482049e1ab57a53e9', 'should throw', { shouldThrow: 'zTXt: Inflate error: invalid distance too far back', strictMode: true }],
            ['c-m1-66ac49ef3f48ac9482049e1ab57a53e9', '80x15, 32-bit RGB+alpha, non-interlaced, 16.0%', { expectedWarnings: [
                        'zTXt: Inflate error: invalid distance too far back'
                    ], expectedDimensions: { width: 80, height: 15 } }],
            ['c-m2-66ac49ef3f48ac9482049e1ab57a53e9', 'should throw', { shouldThrow: 'CRC for chunk "IDAT" at offset 0xd49 doesn\'t match (0xc7923abe !== 0x8c52e0a)', strictMode: true }],
            ['c-m2-66ac49ef3f48ac9482049e1ab57a53e9', 'should throw', { shouldThrow: 'IDAT: Inflate error: incorrect data check' }],
            ['c-m3-66ac49ef3f48ac9482049e1ab57a53e9', 'should throw', { shouldThrow: 'zTXt: Inflate error: incorrect data check', strictMode: true }],
            ['c-m3-66ac49ef3f48ac9482049e1ab57a53e9', 'should decode with warnings', { expectedWarnings: [
                        'zTXt: Inflate error: incorrect data check'
                    ], expectedDimensions: { width: 80, height: 15 } }],
            ['m1-66ac49ef3f48ac9482049e1ab57a53e9', 'should throw', { shouldThrow: 'CRC for chunk "gAMA" at offset 0x21 doesn\'t match (0xbfc6105 !== 0xf41078d0)', strictMode: true }],
            ['m1-66ac49ef3f48ac9482049e1ab57a53e9', 'should decode with warnings', { expectedWarnings: [
                        'CRC for chunk "gAMA" at offset 0x21 doesn\'t match (0xbfc6105 !== 0xf41078d0)',
                        'CRC for chunk "zTXt" at offset 0x91 doesn\'t match (0xbb0815b0 !== 0x565f2318)',
                        'zTXt: Inflate error: invalid distance too far back'
                    ], expectedDimensions: { width: 80, height: 15 } }],
            ['m2-66ac49ef3f48ac9482049e1ab57a53e9', 'should throw', { shouldThrow: true }],
            ['m3-66ac49ef3f48ac9482049e1ab57a53e9', 'should throw', { shouldThrow: 'CRC for chunk "zTXt" at offset 0x91 doesn\'t match (0xbb0815b0 !== 0xf6421cb4)', strictMode: true }],
            ['m3-66ac49ef3f48ac9482049e1ab57a53e9', 'should decode with warnings', { expectedWarnings: [
                        'CRC for chunk "zTXt" at offset 0x91 doesn\'t match (0xbb0815b0 !== 0xf6421cb4)',
                        'zTXt: Inflate error: incorrect data check'
                    ], expectedDimensions: { width: 80, height: 15 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-6bfb149151f58d124d6fa76eaad75520', 'PLTE not allowed in grayscale image', { shouldThrow: 'PLTE: Color type "0" cannot have a palette' }],
            ['c-m4-6bfb149151f58d124d6fa76eaad75520', '16x16, 1-bit palette, non-interlaced, -750.0%', { expectedInfo: [
                        'Unrecognized chunk type "ubUC"',
                        'Unrecognized chunk type "ubSc"',
                        'Unrecognized chunk type "vpAg"',
                        'Unrecognized chunk type "ueUC"',
                        'Unrecognized chunk type "ueSc"'
                    ], expectedDimensions: { width: 16, height: 16 } }],
            ['m1-6bfb149151f58d124d6fa76eaad75520', 'should throw', { shouldThrow: true }],
            ['m2-6bfb149151f58d124d6fa76eaad75520', 'should throw', { shouldThrow: true }],
            ['m3-6bfb149151f58d124d6fa76eaad75520', 'should throw', { shouldThrow: true }],
            ['m4-6bfb149151f58d124d6fa76eaad75520', 'should throw', { shouldThrow: 'CRC for chunk "IHDR" at offset 0x8 doesn\'t match (0x253d4f22 !== 0x253d6d22)', strictMode: true }],
            ['m4-6bfb149151f58d124d6fa76eaad75520', 'should decode with warnings', { expectedWarnings: [
                        'CRC for chunk "IEND" at offset 0x104 doesn\'t match (0xae8d6082 !== 0xae426082)',
                        'CRC for chunk "IHDR" at offset 0x8 doesn\'t match (0x253d4f22 !== 0x253d6d22)',
                        'CRC for chunk "tEXt" at offset 0xa2 doesn\'t match (0xdc930890 !== 0x344d4d5b)',
                        'CRC for chunk "tEXt" at offset 0xd3 doesn\'t match (0x83227ea4 !== 0x3ff9cdcd)',
                    ], expectedInfo: [
                        'Unrecognized chunk type "ubUC"',
                        'Unrecognized chunk type "ubSc"',
                        'Unrecognized chunk type "vpAg"',
                        'Unrecognized chunk type "ueUC"',
                        'Unrecognized chunk type "ueSc"'
                    ], expectedDimensions: { width: 16, height: 16 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c-m1-e0f25ec3373dfdca79ba7bcc3ad366f3', '621x174, 32-bit RGB+alpha, non-interlaced, 52.5%', { expectedInfo: ['Unrecognized chunk type "vpAg"'], expectedDimensions: { width: 621, height: 174 } }],
            ['m1-e0f25ec3373dfdca79ba7bcc3ad366f3', 'should throw', { shouldThrow: 'CRC for chunk "zTXt" at offset 0xa91 doesn\'t match (0x9ced0937 !== 0x8e5143e2)', strictMode: true }],
            ['m1-e0f25ec3373dfdca79ba7bcc3ad366f3', 'should decode with warnings', { expectedWarnings: [
                        'CRC for chunk "zTXt" at offset 0xa91 doesn\'t match (0x9ced0937 !== 0x8e5143e2)',
                        'zTXt: Inflate error: incorrect data check'
                    ], expectedInfo: ['Unrecognized chunk type "vpAg"'], expectedDimensions: { width: 621, height: 174 } }],
        ], imageTestSuiteRoot);
    });
    describe('valid files', () => {
        (0, testUtil_js_1.createTests)([
            ['0839d93f8e77e21acd0ac40a80b14b7b', '350x490, 24-bit RGB, non-interlaced, -2.5% (Adobe Photoshop CS2 Windows)', { expectedDimensions: { width: 350, height: 490 }, expectedInfo: ['Unrecognized chunk type "vpAg"'] }]
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['18f9baf3834980f4b80a3e82ad45be48', '118x79, 24-bit RGB, interlaced, 62.3% (Software: ULead System)', { expectedDimensions: { width: 118, height: 79 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['1ebd73c1d3fbc89782f29507364128fc', '110x110, 24-bit RGB, non-interlaced, -54.6%', { expectedDimensions: { width: 110, height: 110 }, expectedInfo: ['Unrecognized chunk type "vpAg"'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['2d641a11233385bb37a524ff010a8531', '162x159, 32-bit RGB+alpha, non-interlaced, 75.2%', { expectedDimensions: { width: 162, height: 159 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['51a4d21670dc8dfa8ffc9e54afd62f5f', '160x278, 16-bit grayscale+alpha, interlaced, 71.4%', { expectedDimensions: { width: 160, height: 278 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['6c853ed9dacd5716bc54eb59cec30889', '724x1024, 48-bit RGB, non-interlaced, 35.6%', { expectedDimensions: { width: 724, height: 1024 }, expectedInfo: ['Unrecognized chunk type "vpAg"'] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['93e6127b9c4e7a99459c558b81d31bc5', '50x50, 32-bit grayscale+alpha, interlaced, 54.1%', { expectedDimensions: { width: 50, height: 50 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['ac6343a98f8edabfcc6e536dd75aacb0', '75x74, 8-bit palette+trns, interlaced, -58.5%', { expectedDimensions: { width: 75, height: 74 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['affc57dfffa5ec448a0795738d456018', '435x235, 8-bit palette+trns, non-interlaced, 91.5%', { expectedDimensions: { width: 435, height: 235 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['b59d7a023a8dcd112da2eb859004199a', '470x551, 32-bit RGB+alpha, non-interlaced, 96.8%', { expectedDimensions: { width: 470, height: 551 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['ba2b2b6e72ca0e4683bb640e2d5572f8', '218x265, 32-bit RGB+alpha, non-interlaced, 83.2%', { expectedDimensions: { width: 218, height: 265 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['c636287a4d7cb1a36362f7f236564cef', '32x32, 8-bit palette, non-interlaced, -29.9%', { expectedDimensions: { width: 32, height: 32 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['d2e515cfdabae699301dcf290382474d', '120x126, 32-bit RGB+alpha, non-interlaced, -81.2%', { expectedDimensions: { width: 120, height: 126 }, expectedInfo: [
                        'Unrecognized chunk type "cmOD"',
                        'Unrecognized chunk type "cpIp"',
                        'Unrecognized chunk type "meTa"'
                    ] }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['e59ec0cfb8ab64558099543dc19f8378', '18x11, 1-bit palette+trns, interlaced, -672.7%', { expectedDimensions: { width: 18, height: 11 } }],
        ], imageTestSuiteRoot);
        (0, testUtil_js_1.createTests)([
            ['ebfb1cd42314a557e72d4da75c21fc1c', '202x158, 32-bit RGB+alpha, non-interlaced, 84.2%', { expectedDimensions: { width: 202, height: 158 }, expectedInfo: [
                        'Unrecognized chunk type "vpAg"'
                    ] }],
        ], imageTestSuiteRoot);
    });
});
//# sourceMappingURL=imagetestsuite.test.js.map