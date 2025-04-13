import test from 'node:test';
import { createMap, createWindow, simulate } from '../helper.js';

test('TouchZoomRotateHandler', async t => {
  let globalWindow;
  t.before(() => {
    globalWindow = globalThis.window;
    globalThis.window = createWindow();
  });
  t.after(() => {
    globalThis.window.close();
    globalThis.window = globalWindow;
  });

  await t.test(
    'TouchZoomRotateHandler fires zoomstart, zoom, and zoomend events at appropriate times in response to a pinch-zoom gesture',
    t => {
      const map = createMap();

      const zoomstart = t.mock.fn();
      const zoom = t.mock.fn();
      const zoomend = t.mock.fn();

      map.on('zoomstart', zoomstart);
      map.on('zoom', zoom);
      map.on('zoomend', zoomend);

      simulate.touchstart(map.getCanvas(), {
        touches: [
          { clientX: 0, clientY: -5 },
          { clientX: 0, clientY: 5 }
        ]
      });
      map._renderTaskQueue.run();
      t.assert.equal(zoomstart.mock.callCount(), 0);
      t.assert.equal(zoom.mock.callCount(), 0);
      t.assert.equal(zoomend.mock.callCount(), 0);

      simulate.touchmove(map.getCanvas(), {
        touches: [
          { clientX: 0, clientY: -10 },
          { clientX: 0, clientY: 10 }
        ]
      });
      map._renderTaskQueue.run();
      t.assert.equal(zoomstart.mock.callCount(), 1);
      t.assert.equal(zoom.mock.callCount(), 1);
      t.assert.equal(zoomend.mock.callCount(), 0);

      simulate.touchmove(map.getCanvas(), {
        touches: [
          { clientX: 0, clientY: -5 },
          { clientX: 0, clientY: 5 }
        ]
      });
      map._renderTaskQueue.run();
      t.assert.equal(zoomstart.mock.callCount(), 1);
      t.assert.equal(zoom.mock.callCount(), 2);
      t.assert.equal(zoomend.mock.callCount(), 0);

      simulate.touchend(map.getCanvas(), { touches: [] });
      map._renderTaskQueue.run();
      t.assert.equal(zoomstart.mock.callCount(), 1);
      t.assert.equal(zoom.mock.callCount(), 2);
      t.assert.equal(zoomend.mock.callCount(), 1);

      map.remove();
    }
  );

  await t.test(
    'TouchZoomRotateHandler fires rotatestart, rotate, and rotateend events at appropriate times in response to a pinch-rotate gesture',
    t => {
      const map = createMap();

      const rotatestart = t.mock.fn();
      const rotate = t.mock.fn();
      const rotateend = t.mock.fn();

      map.on('rotatestart', rotatestart);
      map.on('rotate', rotate);
      map.on('rotateend', rotateend);

      simulate.touchstart(map.getCanvas(), {
        touches: [
          { clientX: 0, clientY: -5 },
          { clientX: 0, clientY: 5 }
        ]
      });
      map._renderTaskQueue.run();
      t.assert.equal(rotatestart.mock.callCount(), 0);
      t.assert.equal(rotate.mock.callCount(), 0);
      t.assert.equal(rotateend.mock.callCount(), 0);

      simulate.touchmove(map.getCanvas(), {
        touches: [
          { clientX: -5, clientY: 0 },
          { clientX: 5, clientY: 0 }
        ]
      });
      map._renderTaskQueue.run();
      t.assert.equal(rotatestart.mock.callCount(), 1);
      t.assert.equal(rotate.mock.callCount(), 1);
      t.assert.equal(rotateend.mock.callCount(), 0);

      simulate.touchmove(map.getCanvas(), {
        touches: [
          { clientX: 0, clientY: -5 },
          { clientX: 0, clientY: 5 }
        ]
      });
      map._renderTaskQueue.run();
      t.assert.equal(rotatestart.mock.callCount(), 1);
      t.assert.equal(rotate.mock.callCount(), 2);
      t.assert.equal(rotateend.mock.callCount(), 0);

      simulate.touchend(map.getCanvas(), { touches: [] });
      map._renderTaskQueue.run();
      t.assert.equal(rotatestart.mock.callCount(), 1);
      t.assert.equal(rotate.mock.callCount(), 2);
      t.assert.equal(rotateend.mock.callCount(), 1);

      map.remove();
    }
  );

  await t.test(
    'TouchZoomRotateHandler does not begin a gesture if preventDefault is called on the touchstart event',
    t => {
      const map = createMap();

      map.on('touchstart', e => e.preventDefault());

      const move = t.mock.fn();
      map.on('move', move);

      simulate.touchstart(map.getCanvas(), {
        touches: [
          { clientX: 0, clientY: 0 },
          { clientX: 5, clientY: 0 }
        ]
      });
      map._renderTaskQueue.run();

      simulate.touchmove(map.getCanvas(), {
        touches: [
          { clientX: 0, clientY: 0 },
          { clientX: 0, clientY: 5 }
        ]
      });
      map._renderTaskQueue.run();

      simulate.touchend(map.getCanvas(), { touches: [] });
      map._renderTaskQueue.run();

      t.assert.equal(move.mock.callCount(), 0);

      map.remove();
    }
  );

  await t.test('TouchZoomRotateHandler starts zoom immediately when rotation disabled', t => {
    const map = createMap();
    map.touchZoomRotate.disableRotation();

    const zoomstart = t.mock.fn();
    const zoom = t.mock.fn();
    const zoomend = t.mock.fn();

    map.on('zoomstart', zoomstart);
    map.on('zoom', zoom);
    map.on('zoomend', zoomend);

    simulate.touchstart(map.getCanvas(), {
      touches: [
        { clientX: 0, clientY: -5 },
        { clientX: 0, clientY: 5 }
      ]
    });
    map._renderTaskQueue.run();
    t.assert.equal(zoomstart.mock.callCount(), 0);
    t.assert.equal(zoom.mock.callCount(), 0);
    t.assert.equal(zoomend.mock.callCount(), 0);

    simulate.touchmove(map.getCanvas(), {
      touches: [
        { clientX: 0, clientY: -5 },
        { clientX: 0, clientY: 6 }
      ]
    });
    map._renderTaskQueue.run();
    t.assert.equal(zoomstart.mock.callCount(), 1);
    t.assert.equal(zoom.mock.callCount(), 1);
    t.assert.equal(zoomend.mock.callCount(), 0);

    simulate.touchmove(map.getCanvas(), {
      touches: [
        { clientX: 0, clientY: -5 },
        { clientX: 0, clientY: 5 }
      ]
    });
    map._renderTaskQueue.run();
    t.assert.equal(zoomstart.mock.callCount(), 1);
    t.assert.equal(zoom.mock.callCount(), 2);
    t.assert.equal(zoomend.mock.callCount(), 0);

    simulate.touchend(map.getCanvas(), { touches: [] });
    map._renderTaskQueue.run();
    t.assert.equal(zoomstart.mock.callCount(), 1);
    t.assert.equal(zoom.mock.callCount(), 2);
    t.assert.equal(zoomend.mock.callCount(), 1);

    map.remove();
  });
});
