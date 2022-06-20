import { IPngDetails, PngMetadata } from '../typings/api';
export interface ITestOptions {
    shouldThrow?: boolean | string;
    strictMode?: boolean;
    includesMetadata?: {
        [type: string]: PngMetadata | PngMetadata[] | ((e: PngMetadata) => boolean) | undefined;
    };
    expectedDimensions?: {
        width: number;
        height: number;
    };
    expectedDetails?: Partial<IPngDetails>;
    expectedInfo?: string[];
    expectedWarnings?: string[];
    skipDataAssertion?: boolean;
    customFile?: string;
    forceBitDepth8?: boolean;
}
export declare type TestCase = [name: string, description: string, skip?: boolean] | [name: string, description: string, options: ITestOptions];
export declare function createTests(testCases: TestCase[], fixture: string): void;
export declare function assertPixel(actual: ArrayLike<number>, expected: ArrayLike<number>, i: number, options: ITestOptions): void;
export declare function dataArraysEqual(actual: ArrayLike<number>, expected: ArrayLike<number>): void;
