import test from 'node:test';
import { createMap, createWindow, simulate } from '../helper.js';

test('DoubleClickZoomHandler', async t => {
  let globalWindow;
  t.before(() => {
    globalWindow = globalThis.window;
    globalThis.window = createWindow();
  });
  t.after(() => {
    globalThis.window.close();
    globalThis.window = globalWindow;
  });

  await t.test('DoubleClickZoomHandler zooms on the dblclick event', t => {
    const { map } = createMap();

    const zoom = t.mock.fn();
    map.on('zoomstart', zoom);

    simulate.dblclick(map.getCanvas());

    t.assert.equal(zoom.mock.callCount(), 1);

    map.remove();
  });

  await t.test('DoubleClickZoomHandler does not zoom if preventDefault is called on the dblclick event', t => {
    const { map, gestures } = createMap();

    gestures.on('dblclick', e => e.preventDefault());

    const zoom = t.mock.fn();
    map.on('zoomstart', zoom);

    simulate.dblclick(map.getCanvas());

    t.assert.equal(zoom.mock.callCount(), 0);

    map.remove();
  });

  await t.test(
    'DoubleClickZoomHandler does not zoom if preventDefault is called on the bubbled to map dblclick event',
    t => {
      const { map } = createMap({ bubbleEventsToMap: true });

      map.on('dblclick', e => e.preventDefault());

      const zoom = t.mock.fn();
      map.on('zoomstart', zoom);

      simulate.dblclick(map.getCanvas());

      t.assert.equal(zoom.mock.callCount(), 0);

      map.remove();
    }
  );

  await t.test('DoubleClickZoomHandler zooms if preventDefault is called on map without bubbling', t => {
    const { map } = createMap();

    map.on('dblclick', e => e.preventDefault());

    const zoom = t.mock.fn();
    map.on('zoomstart', zoom);

    simulate.dblclick(map.getCanvas());

    t.assert.equal(zoom.mock.callCount(), 1);

    map.remove();
  });
});
