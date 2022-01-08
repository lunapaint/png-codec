# @lunapaint/png

This is a PNG decoder library for JavaScript that runs in both the browser and in Node.js. It is used in [Luna Paint](https://marketplace.visualstudio.com/items?itemName=Tyriar.luna-paint) (an image editor for VS Code) to works with PNG files.

You can try it out on [`vscode.dev`](https://vscode.dev/) by installing the Luna Paint extension and opening a png file.


## Features

- **Performance**: Just like Luna Paint, performance is a priority. This includes code splitting such that code that parses optional chunks are only loaded as needed.
- **Correctness**: The library passes [PngSuite](http://www.schaik.com/pngsuite/), the "official" test suite for PNG files.
- **Quality API**: The API is a well documented [TypeScript declaration file](./types.d.ts).
- **Metadata**: All supported metadata is exposed on the API such as text, gamma, default background color, etc.
- **Readable Codebase**: A big part of this was a learning exercise for me so I put some effort in to make the code as readable as possible to help others on the same journey.


## Install

The supported way of installing the project is through npm:

```
npm install @lunapaint/png
```

Alternatively you could use it as a submodule in git, or download the source from the releases page on GitHub.


## Why does this exist?

These are the main reasons:

- To deeply understand the format, I learn best by doing.
- To integrate better with Luna Paint and my other existing and future decoders that depend on png (like ico).
- The scope is limited, this project will eventually be "done" and need minimal maintenance.
- I didn't want to go the wasm route in Luna Paint (yet?).
- As an educational resource.
- To have some fun.


## Dependencies

The library has the single dependency [pako](https://github.com/nodeca/pako) which provides the compression/decompression capabilities needed to read various png chunks.


## References

- https://www.w3.org/TR/2003/REC-PNG-20031110
- http://www.libpng.org/pub/png/spec/1.2/PNG-Contents.html
