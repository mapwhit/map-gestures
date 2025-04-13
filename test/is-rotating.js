import test from 'node:test';
import { createMap, createWindow, simulate } from './helper.js';

test('Map#isRotating', async t => {
  let globalWindow;
  t.before(() => {
    globalWindow = globalThis.window;
    globalThis.window = createWindow();
  });
  t.after(() => {
    globalThis.window.close();
    globalThis.window = globalWindow;
  });

  await t.test('Map#isRotating returns false by default', t => {
    const map = createMap();
    t.assert.equal(map.isRotating(), false);
    map.remove();
  });

  await t.test('Map#isRotating returns true during a camera rotate animation', (t, done) => {
    const map = createMap();

    map.on('rotatestart', () => {
      t.assert.equal(map.isRotating(), true);
    });

    map.on('rotateend', () => {
      t.assert.equal(map.isRotating(), false);
      map.remove();
      done();
    });

    map.rotateTo(5, { duration: 0 });
  });

  await t.test('Map#isRotating returns true when drag rotating', (t, done) => {
    const map = createMap();

    map.on('rotatestart', () => {
      t.assert.equal(map.isRotating(), true);
    });

    map.on('rotateend', () => {
      t.assert.equal(map.isRotating(), false);
      map.remove();
      done();
    });

    simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
    map._renderTaskQueue.run();

    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    map._renderTaskQueue.run();

    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 2 });
    map._renderTaskQueue.run();
  });
});
