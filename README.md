# @lunapaint/png-codec

This is a PNG decoder library for JavaScript that runs in both the browser and in Node.js. It is used in [Luna Paint](https://marketplace.visualstudio.com/items?itemName=Tyriar.luna-paint) (an image editor for VS Code) to work with PNG files.

You can try it out on [`vscode.dev`](https://vscode.dev/) by installing the Luna Paint extension and opening a png file.


## Features

- **Performance**: Just like Luna Paint, performance is a priority. This includes code splitting such that code that parses optional chunks are only loaded as needed.
- **Correctness**: The library passes [PngSuite](http://www.schaik.com/pngsuite/), the "official" test suite for PNG files.
- **Simple API**: The API is a well documented [TypeScript declaration file](https://github.dev/lunapaint/png-codec/blob/main/typings/api.d.ts).
- **Metadata**: All supported metadata is exposed on the API such as text, gamma, default background color, etc.
- **Readable Codebase**: A big part of this was a learning exercise for me so I put some effort in to make the code as readable as possible to help others on the same journey.
- **Error tolerant**: Some images with errors can still be opened with warnings.


## Install

The supported way of installing the project is through npm:

```
npm install @lunapaint/png-codec
```

Alternatively you could use it as a submodule in git, or download the source from the releases page on GitHub.


## API

The API is documented as a TypeScript declaration file. The API is best viewed on [github.dev](https://github.dev/lunapaint/png-codec/blob/main/typings/api.d.ts) which has symbol support out of the box or can be viewed on [github.com](https://github.com/lunapaint/png-codec/blob/main/typings/api.d.ts).


## Chunk support

PNGs are made up of a fixed signature followed by a series of chunks. The following chunks are supported, with some notes provided where applicable:

**Critical chunks:**

| Chunk   | Name          | Notes
|---------|---------------|-------
| [IHDR]  | Image header  |
| [PLTE]  | Palette       |
| [IDAT]  | Image data    | Full filtering and interlacing support for all bit depths (1, 2, 4, 8, 16) are supported.
| [IEND]  | Image trailer |

**Ancillary chunks:**

| Chunk   | Name                                   | Notes
|---------|----------------------------------------|-------
| [bKGD]  | Background color                       |
| [cHRM]  | Primary chromaticities and white point |
| [eXIf]  | Exchangeable image file format         | Approved 2017/7
| [gAMA]  | Image gamma                            | Gamma values are provided, but are not applied to the resulting image.
| [hIST]  | Image histogram                        |
| [iTXt]  | International textual data             |
| [pHYs]  | Physical pixel dimensions              |
| [sBIT]  | Significant bits                       | Since the decoded buffer uses a minimum of uint8, this is only when the significant bits are in the range of 9-15.
| [sPLT]  | Suggested palette                      |
| [sRGB]  | Standard RGB colour space              |
| [tEXt]  | Textual data                           |
| [tIME]  | Image last-modification time           |
| [tRNS]  | Transparency                           | Since this chunk modifies the resulting image, you cannot skip this chunk.
| [zTXt]  | Compressed textual data                |


## Why does this exist?

These are the main reasons:

- To deeply understand the format, I learn best by doing.
- To integrate better with Luna Paint and my other existing and future decoders that depend on png (like ico).
- The scope is limited, this project will eventually be "done" and need minimal maintenance.
- I didn't want to go the wasm route in Luna Paint (yet?).
- To have full control over how the code is loaded, Luna Paint uses dynamic imports extensively to reduce the amount of code loaded to combat slow startup times.
- As an educational resource.
- To have some fun.


## Dependencies

The library has the single dependency [pako](https://github.com/nodeca/pako) which provides the compression/decompression capabilities needed to read various png chunks.


## References

- https://www.w3.org/TR/2003/REC-PNG-20031110
- http://www.libpng.org/pub/png/spec/1.2/PNG-Contents.html


[IHDR]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11IHDR
[PLTE]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11PLTE
[IDAT]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11IDAT
[IEND]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11IEND

[bKGD]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11bKGD
[cHRM]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11cHRM
[eXIf]: http://ftp-osl.osuosl.org/pub/libpng/documents/proposals/eXIf/png-proposed-eXIf-chunk-2017-06-15.html#C.eXIf
[gAMA]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11gAMA
[hIST]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11hIST
[iTXt]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11iTXt
[pHYs]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11pHYs
[sBIT]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11sBIT
[sPLT]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11sPLT
[sRGB]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11sRGB
[tEXt]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11tEXt
[tIME]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11tIME
[tRNS]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11tRNS
[zTXt]: https://www.w3.org/TR/2003/REC-PNG-20031110/#11zTXt
