/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

/**
 * Converts a 16-bit buffer to a 8-bit buffer by dropping the least significant byte from each
 * 16-bit word.
 * @param data The data array to convert.
 */
export function convert16BitTo8BitData(data: Uint16Array): Uint8Array {
  const view8Bit = new Uint8Array(data.buffer);
  const result = new Uint8Array(data.length);
  for (let i = 0; i < result.length; i++) {
    // Typed arrays use little endian by default
    result[i] = view8Bit[i * 2 + 1];
  }
  return result;
}
