import test from 'node:test';
import { createMap, createWindow, simulate } from '../helper.js';

test('BoxZoomHandler', async t => {
  let globalWindow;
  t.before(() => {
    globalWindow = globalThis.window;
    globalThis.window = createWindow();
  });
  t.after(() => {
    globalThis.window.close();
    globalThis.window = globalWindow;
  });

  await t.test('BoxZoomHandler fires boxzoomstart and boxzoomend events at appropriate times', t => {
    const { map, gestures } = createMap();

    const boxzoomstart = t.mock.fn();
    const boxzoomend = t.mock.fn();

    gestures.on('boxzoomstart', boxzoomstart);
    gestures.on('boxzoomend', boxzoomend);

    simulate.mousedown(map.getCanvas(), { shiftKey: true, clientX: 0, clientY: 0 });
    map._renderTaskQueue.run();
    t.assert.equal(boxzoomstart.mock.callCount(), 0);
    t.assert.equal(boxzoomend.mock.callCount(), 0);

    simulate.mousemove(map.getCanvas(), { shiftKey: true, clientX: 5, clientY: 5 });
    map._renderTaskQueue.run();
    t.assert.equal(boxzoomstart.mock.callCount(), 1);
    t.assert.equal(boxzoomend.mock.callCount(), 0);

    simulate.mouseup(map.getCanvas(), { shiftKey: true, clientX: 5, clientY: 5 });
    map._renderTaskQueue.run();
    t.assert.equal(boxzoomstart.mock.callCount(), 1);
    t.assert.equal(boxzoomend.mock.callCount(), 1);

    map.remove();
  });

  await t.test('BoxZoomHandler bubbles boxzoomstart and boxzoomend events', t => {
    const { map } = createMap({ bubbleEventsToMap: true });

    const boxzoomstart = t.mock.fn();
    const boxzoomend = t.mock.fn();

    map.on('boxzoomstart', boxzoomstart);
    map.on('boxzoomend', boxzoomend);

    simulate.mousedown(map.getCanvas(), { shiftKey: true, clientX: 0, clientY: 0 });
    map._renderTaskQueue.run();
    t.assert.equal(boxzoomstart.mock.callCount(), 0);
    t.assert.equal(boxzoomend.mock.callCount(), 0);

    simulate.mousemove(map.getCanvas(), { shiftKey: true, clientX: 5, clientY: 5 });
    map._renderTaskQueue.run();
    t.assert.equal(boxzoomstart.mock.callCount(), 1);
    t.assert.equal(boxzoomend.mock.callCount(), 0);

    simulate.mouseup(map.getCanvas(), { shiftKey: true, clientX: 5, clientY: 5 });
    map._renderTaskQueue.run();
    t.assert.equal(boxzoomstart.mock.callCount(), 1);
    t.assert.equal(boxzoomend.mock.callCount(), 1);

    map.remove();
  });

  await t.test('BoxZoomHandler avoids conflicts with DragPanHandler when disabled and reenabled (#2237)', t => {
    const { map, gestures } = createMap();

    gestures.boxZoom.disable();
    gestures.boxZoom.enable();

    const boxzoomstart = t.mock.fn();
    const boxzoomend = t.mock.fn();

    gestures.on('boxzoomstart', boxzoomstart);
    gestures.on('boxzoomend', boxzoomend);

    const dragstart = t.mock.fn();
    const drag = t.mock.fn();
    const dragend = t.mock.fn();

    gestures.on('dragstart', dragstart);
    gestures.on('drag', drag);
    gestures.on('dragend', dragend);

    simulate.mousedown(map.getCanvas(), { shiftKey: true, clientX: 0, clientY: 0 });
    map._renderTaskQueue.run();
    t.assert.equal(boxzoomstart.mock.callCount(), 0);
    t.assert.equal(boxzoomend.mock.callCount(), 0);

    simulate.mousemove(map.getCanvas(), { shiftKey: true, clientX: 5, clientY: 5 });
    map._renderTaskQueue.run();
    t.assert.equal(boxzoomstart.mock.callCount(), 1);
    t.assert.equal(boxzoomend.mock.callCount(), 0);

    simulate.mouseup(map.getCanvas(), { shiftKey: true, clientX: 5, clientY: 5 });
    map._renderTaskQueue.run();
    t.assert.equal(boxzoomstart.mock.callCount(), 1);
    t.assert.equal(boxzoomend.mock.callCount(), 1);

    t.assert.equal(dragstart.mock.callCount(), 0);
    t.assert.equal(drag.mock.callCount(), 0);
    t.assert.equal(dragend.mock.callCount(), 0);

    map.remove();
  });

  await t.test('BoxZoomHandler does not begin a box zoom if preventDefault is called on the mousedown event', t => {
    const { map, gestures } = createMap();

    gestures.on('mousedown', e => e.preventDefault());

    const boxzoomstart = t.mock.fn();
    const boxzoomend = t.mock.fn();

    gestures.on('boxzoomstart', boxzoomstart);
    gestures.on('boxzoomend', boxzoomend);

    simulate.mousedown(map.getCanvas(), { shiftKey: true, clientX: 0, clientY: 0 });
    map._renderTaskQueue.run();

    simulate.mousemove(map.getCanvas(), { shiftKey: true, clientX: 5, clientY: 5 });
    map._renderTaskQueue.run();

    simulate.mouseup(map.getCanvas(), { shiftKey: true, clientX: 5, clientY: 5 });
    map._renderTaskQueue.run();

    t.assert.equal(boxzoomstart.mock.callCount(), 0);
    t.assert.equal(boxzoomend.mock.callCount(), 0);

    map.remove();
  });

  await t.test(
    'BoxZoomHandler does not begin a box zoom when bubbling events to map if preventDefault is called on the mousedown event',
    t => {
      const { map } = createMap({ bubbleEventsToMap: true });

      map.on('mousedown', e => e.preventDefault());

      const boxzoomstart = t.mock.fn();
      const boxzoomend = t.mock.fn();

      map.on('boxzoomstart', boxzoomstart);
      map.on('boxzoomend', boxzoomend);

      simulate.mousedown(map.getCanvas(), { shiftKey: true, clientX: 0, clientY: 0 });
      map._renderTaskQueue.run();

      simulate.mousemove(map.getCanvas(), { shiftKey: true, clientX: 5, clientY: 5 });
      map._renderTaskQueue.run();

      simulate.mouseup(map.getCanvas(), { shiftKey: true, clientX: 5, clientY: 5 });
      map._renderTaskQueue.run();

      t.assert.equal(boxzoomstart.mock.callCount(), 0);
      t.assert.equal(boxzoomend.mock.callCount(), 0);

      map.remove();
    }
  );
});
