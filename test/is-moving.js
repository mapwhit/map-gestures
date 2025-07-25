import test from 'node:test';
import { createMap, createWindow, simulate } from './helper.js';

test('Map#isMoving', async t => {
  let globalWindow;
  t.before(() => {
    globalWindow = globalThis.window;
    globalThis.window = createWindow();
  });
  t.after(() => {
    globalThis.window.close();
    globalThis.window = globalWindow;
  });

  await t.test('Map#isMoving returns false by default', t => {
    const { map } = createMap();
    t.assert.equal(map.isMoving(), false);
    map.remove();
  });

  await t.test('Map#isMoving returns true during a camera zoom animation', (t, done) => {
    const { map } = createMap();

    map.on('zoomstart', () => {
      t.assert.equal(map.isMoving(), true);
    });

    map.on('zoomend', () => {
      t.assert.equal(map.isMoving(), false);
      map.remove();
      done();
    });

    map.zoomTo(5, { duration: 0 });
  });

  await t.test('Map#isMoving returns true when drag panning', (t, done) => {
    const { map } = createMap();

    map.on('dragstart', () => {
      t.assert.equal(map.isMoving(), true);
    });

    map.on('dragend', () => {
      t.assert.equal(map.isMoving(), false);
      map.remove();
      done();
    });

    simulate.mousedown(map.getCanvas());
    map._renderTaskQueue.run();

    simulate.mousemove(map.getCanvas());
    map._renderTaskQueue.run();

    simulate.mouseup(map.getCanvas());
    map._renderTaskQueue.run();
  });

  await t.test('Map#isMoving returns true when drag rotating', (t, done) => {
    const { map } = createMap();

    map.on('rotatestart', () => {
      t.assert.equal(map.isMoving(), true);
    });

    map.on('rotateend', () => {
      t.assert.equal(map.isMoving(), false);
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

  await t.test('Map#isMoving returns true when scroll zooming', (t, done) => {
    const { map } = createMap();

    map.on('zoomstart', () => {
      t.assert.equal(map.isMoving(), true);
    });

    map.on('zoomend', () => {
      t.assert.equal(map.isMoving(), false);
      map.remove();
      done();
    });

    let now = 0;
    t.mock.method(performance, 'now', () => now);

    simulate.wheel(map.getCanvas(), { type: 'wheel', deltaY: -simulate.magicWheelZoomDelta });
    map._renderTaskQueue.run();

    now += 400;
    map._renderTaskQueue.run();
  });

  await t.test('Map#isMoving returns true when drag panning and scroll zooming interleave', (t, done) => {
    const { map } = createMap();

    map.on('dragstart', () => {
      t.assert.equal(map.isMoving(), true);
    });

    map.on('zoomstart', () => {
      t.assert.equal(map.isMoving(), true);
    });

    map.on('zoomend', () => {
      t.assert.equal(map.isMoving(), true);
      simulate.mouseup(map.getCanvas());
      map._renderTaskQueue.run();
    });

    map.on('dragend', () => {
      t.assert.equal(map.isMoving(), false);
      map.remove();
      done();
    });

    // The following should trigger the above events, where a zoomstart/zoomend
    // pair is nested within a dragstart/dragend pair.

    simulate.mousedown(map.getCanvas());
    map._renderTaskQueue.run();

    simulate.mousemove(map.getCanvas());
    map._renderTaskQueue.run();

    let now = 0;
    t.mock.method(performance, 'now', () => now);

    simulate.wheel(map.getCanvas(), { type: 'wheel', deltaY: -simulate.magicWheelZoomDelta });
    map._renderTaskQueue.run();

    now += 400;
    map._renderTaskQueue.run();
  });
});
