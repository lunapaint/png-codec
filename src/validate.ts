/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { BitDepth, ColorType, FilterMethod, InterlaceMethod } from './types.js';

export function isValidBitDepth(bitDepth: number): bitDepth is BitDepth {
  return (
    bitDepth === 1 ||
    bitDepth === 2 ||
    bitDepth === 4 ||
    bitDepth === 8 ||
    bitDepth === 16
  );
}

export function isValidColorType(colorType: number, bitDepth: number): colorType is ColorType {
  return (
    (colorType === ColorType.Grayscale         && bitDepth >= 1 && bitDepth <= 16) ||
    (colorType === ColorType.Truecolor         && bitDepth >= 8 && bitDepth <= 16) ||
    (colorType === ColorType.Indexed           && bitDepth >= 1 && bitDepth <=  8) ||
    (colorType === ColorType.GrayacaleAndAlpha && bitDepth >= 8 && bitDepth <= 16) ||
    (colorType === ColorType.TruecolorAndAlpha && bitDepth >= 8 && bitDepth <= 16)
  );
}

export function isValidFilterMethod(filterMethod: number): filterMethod is FilterMethod {
  return filterMethod === FilterMethod.Adaptive;
}

export function isValidInterlaceMethod(interlaceMethod: number): interlaceMethod is InterlaceMethod {
  return (
    interlaceMethod === InterlaceMethod.None ||
    interlaceMethod === InterlaceMethod.Adam7
  );
}
