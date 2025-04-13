import test from 'node:test';
import { createMap, createWindow, simulate } from './helper.js';

test('Map#isZooming', async t => {
  let globalWindow;
  t.before(() => {
    globalWindow = globalThis.window;
    globalThis.window = createWindow();
  });
  t.after(() => {
    globalThis.window.close();
    globalThis.window = globalWindow;
  });

  await t.test('Map#isZooming returns false by default', t => {
    const map = createMap();
    t.assert.equal(map.isZooming(), false);
    map.remove();
  });

  await t.test('Map#isZooming returns true during a camera zoom animation', async t => {
    const { promise, resolve } = Promise.withResolvers();
    const map = createMap();

    map.on('zoomstart', () => {
      t.assert.equal(map.isZooming(), true);
    });

    map.on('zoomend', () => {
      t.assert.equal(map.isZooming(), false);
      resolve();
    });

    map.zoomTo(5, { duration: 0 });

    await promise;
    map.remove();
  });

  await t.test('Map#isZooming returns true when scroll zooming', async t => {
    const { promise, resolve } = Promise.withResolvers();
    const map = createMap();

    map.on('zoomstart', () => {
      t.assert.equal(map.isZooming(), true);
    });

    map.on('zoomend', () => {
      t.assert.equal(map.isZooming(), false);
      resolve();
    });

    let now = 0;
    t.mock.method(performance, 'now', () => now);

    simulate.wheel(map.getCanvas(), { type: 'wheel', deltaY: -simulate.magicWheelZoomDelta });
    map._renderTaskQueue.run();

    now += 400;
    map._renderTaskQueue.run();

    await promise;
    map.remove();
  });

  await t.test('Map#isZooming returns true when double-click zooming', async t => {
    const { promise, resolve } = Promise.withResolvers();
    const map = createMap();

    map.on('zoomstart', () => {
      t.assert.equal(map.isZooming(), true);
    });

    map.on('zoomend', () => {
      t.assert.equal(map.isZooming(), false);
      resolve();
    });

    let now = 0;
    t.mock.method(performance, 'now', () => now);

    simulate.dblclick(map.getCanvas());
    map._renderTaskQueue.run();

    now += 500;
    map._renderTaskQueue.run();

    await promise;
    map.remove();
  });
});
