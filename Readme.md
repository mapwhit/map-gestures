[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

# map-gestures

Handles map touch and mouse gestures: zoom, rotate, pan etc.

## Install

```sh
$ npm install --save @mapwhit/map-gestures
```

## Usage

```js

import mapGestures from '@mapwhit/map-gestures';
import tilerenderer from '@mapwhit/tilerenderer';

const container = window.document.createElement('div');
window.document.body.appendChild(container);
const map = new tilerenderer.Map({ container, mapGestures });
```

## License

[BSD-3-Clause](License.txt) © [Damian Krzeminski](https://pirxpilot.me)

[npm-image]: https://img.shields.io/npm/v/@mapwhit/map-gestures
[npm-url]: https://npmjs.org/package/@mapwhit/map-gestures

[build-url]: https://github.com/mapwhit/map-gestures/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/actions/workflow/status/mapwhit/map-gestures/check.yaml?branch=main

[deps-image]: https://img.shields.io/librariesio/release/npm/@mapwhit/map-gestures
[deps-url]: https://libraries.io/npm/@mapwhit%2Fmap-gestures
