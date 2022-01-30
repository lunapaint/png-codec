/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

export class ByteStream {
  readonly array: Uint8Array;
  readonly view: DataView;

  offset: number = 0;

  constructor(length: number) {
    this.array = new Uint8Array(length);
    this.view = new DataView(this.array.buffer, this.array.byteOffset, this.array.byteLength);
  }

  writeUint8(value: number) {
    this.view.setUint8(this.offset, value);
    this.offset += 1;
  }

  writeUint32(value: number) {
    this.view.setUint32(this.offset, value);
    this.offset += 4;
  }

  assertAtEnd() {
    if (this.offset !== this.array.length) {
      throw new Error('Writing finished before expected length of stream');
    }
  }
}
