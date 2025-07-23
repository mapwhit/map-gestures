import tilerenderer from '@mapwhit/tilerenderer';
import gl from 'gl';
import { JSDOM, VirtualConsole } from 'jsdom';
import mapGestures from '../lib/map-gestures.js';

export function createWindow() {
  const dom = new JSDOM('', {
    url: 'https://example.org/',
    // Send jsdom console output to the node console object.
    virtualConsole: new VirtualConsole().sendTo(console),
    // load images
    resources: 'usable'
  });

  const _window = dom.window;

  const originalGetContext = _window.HTMLCanvasElement.prototype.getContext;
  _window.HTMLCanvasElement.prototype.getContext = function (type, attributes) {
    if (type === 'webgl') {
      if (!this._webGLContext) {
        this._webGLContext = gl(this.width, this.height, attributes);
      }
      return this._webGLContext;
    }
    // Fallback to existing HTMLCanvasElement getContext behaviour
    return originalGetContext.call(this, type, attributes);
  };

  return _window;
}

export function createMap(options = {}) {
  const container = window.document.createElement('div');
  window.document.body.appendChild(container);
  const opts = { container, ...options };
  const map = new tilerenderer.Map(opts);
  return {
    map,
    gestures: mapGestures(map, opts)
  };
}

export const simulate = {
  click,
  drag,
  dblclick,
  // magic deltaY value that indicates the event is from a mouse wheel
  // (rather than a trackpad)
  magicWheelZoomDelta: 4.000244140625
};

function _g(target) {
  return target.ownerDocument?.defaultView || target.defaultView || target;
}

function click(target, options) {
  options = Object.assign({ bubbles: true }, options);
  const { MouseEvent } = _g(target);
  target.dispatchEvent(new MouseEvent('mousedown', options));
  target.dispatchEvent(new MouseEvent('mouseup', options));
  target.dispatchEvent(new MouseEvent('click', options));
}

function drag(target, mousedownOptions, mouseUpOptions) {
  mousedownOptions = Object.assign({ bubbles: true }, mousedownOptions);
  mouseUpOptions = Object.assign({ bubbles: true }, mouseUpOptions);
  const { MouseEvent } = _g(target);
  target.dispatchEvent(new MouseEvent('mousedown', mousedownOptions));
  target.dispatchEvent(new MouseEvent('mouseup', mouseUpOptions));
  target.dispatchEvent(new MouseEvent('click', mouseUpOptions));
}

function dblclick(target, options) {
  options = Object.assign({ bubbles: true }, options);
  const { MouseEvent } = _g(target);
  target.dispatchEvent(new MouseEvent('mousedown', options));
  target.dispatchEvent(new MouseEvent('mouseup', options));
  target.dispatchEvent(new MouseEvent('click', options));
  target.dispatchEvent(new MouseEvent('mousedown', options));
  target.dispatchEvent(new MouseEvent('mouseup', options));
  target.dispatchEvent(new MouseEvent('click', options));
  target.dispatchEvent(new MouseEvent('dblclick', options));
}

['mouseup', 'mousedown', 'mouseover', 'mousemove', 'mouseout'].forEach(event => {
  simulate[event] = function (target, options) {
    options = Object.assign({ bubbles: true }, options);
    const { MouseEvent } = _g(target);
    target.dispatchEvent(new MouseEvent(event, options));
  };
});

['wheel', 'mousewheel'].forEach(event => {
  simulate[event] = function (target, options) {
    options = Object.assign({ bubbles: true }, options);
    const { WheelEvent } = _g(target);
    target.dispatchEvent(new WheelEvent(event, options));
  };
});

['touchstart', 'touchend', 'touchmove', 'touchcancel'].forEach(event => {
  simulate[event] = function (target, options) {
    // Should be using Touch constructor here, but https://github.com/jsdom/jsdom/issues/2152.
    options = Object.assign({ bubbles: true, touches: [{ clientX: 0, clientY: 0 }] }, options);
    const { TouchEvent } = _g(target);
    target.dispatchEvent(new TouchEvent(event, options));
  };
});

['focus', 'blur'].forEach(event => {
  simulate[event] = function (target, options) {
    options = Object.assign({ bubbles: true }, options);
    const { FocusEvent } = _g(target);
    target.dispatchEvent(new FocusEvent(event, options));
  };
});

export function assertEqualWithPrecision(
  expected,
  actual,
  multiplier,
  message = `should be equal to within ${multiplier}`
) {
  const expectedRounded = Math.round(expected / multiplier) * multiplier;
  const actualRounded = Math.round(actual / multiplier) * multiplier;

  return this.equal(expectedRounded, actualRounded, message);
}
