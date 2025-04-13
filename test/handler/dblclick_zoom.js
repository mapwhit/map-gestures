import test from 'node:test';
import { createMap, createWindow, simulate } from '../helper.js';

test('DoubleClickZoomHandler does not zoom if preventDefault is called on the dblclick event', t => {
  let globalWindow;
  t.before(() => {
    globalWindow = globalThis.window;
    globalThis.window = createWindow();
  });
  t.after(() => {
    globalThis.window.close();
    globalThis.window = globalWindow;
  });

  const map = createMap();

  map.on('dblclick', e => e.preventDefault());

  const zoom = t.mock.fn();
  map.on('zoom', zoom);

  simulate.dblclick(map.getCanvas());

  t.assert.equal(zoom.mock.callCount(), 0);

  map.remove();
});
