/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

/**
 * A CRC-32 implementation (Computation of cyclic redundancy check) based on the libpng's example
 * implementation http://www.libpng.org/pub/png/spec/1.2/PNG-CRCAppendix.html
 */

/**
 * A cached table of CRCs for all 8-bit messages.
 */
let tableInternal: number[] | undefined;

/**
 * Gets the crc table cache, initializing if necessary.
 */
export function getCrcTable(): number[] {
  if (tableInternal) {
    return tableInternal;
  }
  tableInternal = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xEDB88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    tableInternal[n] = c >>> 0; // Force unsigned
  }
  return tableInternal;
}

/**
 * Update a running CRC with bytes dataView[0..len-1] -- the CRC should be initialized to all 1's
 * and the transmitted value is the 1's complement of the final running CRC (see crc32).
 */
function updateCrc(crc: number, dataView: DataView, offset: number, length: number) {
  const table = getCrcTable();
  let c = crc;
  for (let n = 0; n < length; n++) {
    c = table![(c ^ dataView.getUint8(offset + n)) & 0xFF] ^ (c >>> 8);
  }
  return c;
}

/**
 * Gets the CRC of the bytes dataView[offset..offset+length-1].
 * @param dataView The buffer.
 * @param offset The offset to start the CRC from.
 * @param length The length of the CRC.
 */
export function crc32(dataView: DataView, offset: number, length: number) {
  return (updateCrc(0xFFFFFFFF, dataView, offset, length) ^ 0xFFFFFFFF) >>> 0; // Force unsigned
}
