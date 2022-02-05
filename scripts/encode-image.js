/**
 * @license
 * Copyright (c) 2022 Daniel Imms <http://www.growingwiththeweb.com>
 * Released under MIT license. See LICENSE in the project root for details.
 */

const decoder = require('../out-dist/pngDecoder');
const encoder = require('../out-dist/pngEncoder');
const fs = require('fs/promises');
const { dirname, basename, extname, join } = require('path');

async function encode(file) {
  if (extname(file) !== '.png') {
    throw new Error('File must end with .png');
  }
  console.log('Encoding: ' + file);
  const originalData = await fs.readFile(file);
  const decoded = await decoder.decodePng(originalData);
  const encoded = await encoder.encodePng(decoded.image, { colorType: 6 });
  fs.writeFile(join(dirname(file), `${basename(file, '.png')}_png-codec.png`), encoded);
}

if (process.argv.length < 3) {
  console.error('Provide a file as the first argument');
  process.exit(1);
}

encode(process.argv[2]);
