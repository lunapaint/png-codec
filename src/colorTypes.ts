/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { ColorType } from './types.js';

export function getChannelsForColorType(colorType: ColorType): number {
  switch (colorType) {
    case ColorType.Grayscale:         return 1;
    case ColorType.Truecolor:         return 3;
    case ColorType.Indexed:           return 1;
    case ColorType.GrayscaleAndAlpha: return 2;
    case ColorType.TruecolorAndAlpha: return 4;
  }
}
