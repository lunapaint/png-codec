/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

import { deepStrictEqual } from 'assert';
import { decodePng } from '../../out-dev/pngDecoder.js';
import { encodePng } from '../../out-dev/pngEncoder.js';
import { IDecodedPng, IEncodePngOptions, IImage32 } from '../../typings/api.js';


const white = [0xFF, 0xFF, 0xFF, 0xFF];

async function testAncillaryChunks(encodeAncillaryChunks: IEncodePngOptions['ancillaryChunks'], expectedMetadata: IDecodedPng<IImage32>['metadata']) {
  const result = await encodePng({
    data: new Uint8Array(white),
    width: 1,
    height: 1
  }, { ancillaryChunks: encodeAncillaryChunks });
  const decoded = await decodePng(result.data, { parseChunkTypes: '*' });
  deepStrictEqual(decoded.metadata, expectedMetadata);
}

describe('ancillary chunks', () => {
  describe('tEXt', () => {
    it('should write a tEXt Software=@lunapaint/png-codec chunk by default', async () => {
      await testAncillaryChunks(undefined, [{
        type: 'tEXt',
        keyword: 'Software',
        text: '@lunapaint/png-codec'
      }]);
    });
    it('should suppress default tEXt chunk when using []', async () => {
      await testAncillaryChunks([], undefined);
    });
    it('should write a custom tEXt chunk', async () => {
      await testAncillaryChunks([{
        type: 'tEXt',
        keyword: 'Foo',
        text: 'Bar'
      }], [{
        type: 'tEXt',
        keyword: 'Foo',
        text: 'Bar'
      }]);
    });
    it('should write multiple custom tEXt chunk', async () => {
      await testAncillaryChunks([{
        type: 'tEXt',
        keyword: 'Foo1',
        text: 'Bar1'
      }, {
        type: 'tEXt',
        keyword: 'Foo2',
        text: 'Bar2'
      }], [{
        type: 'tEXt',
        keyword: 'Foo1',
        text: 'Bar1'
      }, {
        type: 'tEXt',
        keyword: 'Foo2',
        text: 'Bar2'
      }]);
    });
  });
});
