import test from 'node:test';
import { createMap, createWindow, simulate } from '../helper.js';

test('DragPanHandler', async t => {
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
    'DragPanHandler fires dragstart, drag, and dragend events at appropriate times in response to a mouse-triggered drag',
    t => {
      const { map } = createMap();

      const dragstart = t.mock.fn();
      const drag = t.mock.fn();
      const dragend = t.mock.fn();

      map.on('dragstart', dragstart);
      map.on('drag', drag);
      map.on('dragend', dragend);

      simulate.mousedown(map.getCanvas());
      map._renderTaskQueue.run();
      t.assert.equal(dragstart.mock.callCount(), 0);
      t.assert.equal(drag.mock.callCount(), 0);
      t.assert.equal(dragend.mock.callCount(), 0);

      simulate.mousemove(map.getCanvas());
      map._renderTaskQueue.run();
      t.assert.equal(dragstart.mock.callCount(), 1);
      t.assert.equal(drag.mock.callCount(), 1);
      t.assert.equal(dragend.mock.callCount(), 0);

      simulate.mouseup(map.getCanvas());
      map._renderTaskQueue.run();
      t.assert.equal(dragstart.mock.callCount(), 1);
      t.assert.equal(drag.mock.callCount(), 1);
      t.assert.equal(dragend.mock.callCount(), 1);

      map.remove();
    }
  );

  await t.test(
    'DragPanHandler captures mousemove events during a mouse-triggered drag (receives them even if they occur outside the map)',
    t => {
      const { map } = createMap();

      const dragstart = t.mock.fn();
      const drag = t.mock.fn();
      const dragend = t.mock.fn();

      map.on('dragstart', dragstart);
      map.on('drag', drag);
      map.on('dragend', dragend);

      simulate.mousedown(map.getCanvas());
      map._renderTaskQueue.run();
      t.assert.equal(dragstart.mock.callCount(), 0);
      t.assert.equal(drag.mock.callCount(), 0);
      t.assert.equal(dragend.mock.callCount(), 0);

      simulate.mousemove(window.document.body);
      map._renderTaskQueue.run();
      t.assert.equal(dragstart.mock.callCount(), 1);
      t.assert.equal(drag.mock.callCount(), 1);
      t.assert.equal(dragend.mock.callCount(), 0);

      simulate.mouseup(map.getCanvas());
      map._renderTaskQueue.run();
      t.assert.equal(dragstart.mock.callCount(), 1);
      t.assert.equal(drag.mock.callCount(), 1);
      t.assert.equal(dragend.mock.callCount(), 1);

      map.remove();
    }
  );

  await t.test(
    'DragPanHandler fires dragstart, drag, and dragend events at appropriate times in response to a touch-triggered drag',
    t => {
      const { map } = createMap();

      const dragstart = t.mock.fn();
      const drag = t.mock.fn();
      const dragend = t.mock.fn();

      map.on('dragstart', dragstart);
      map.on('drag', drag);
      map.on('dragend', dragend);

      simulate.touchstart(map.getCanvas());
      map._renderTaskQueue.run();
      t.assert.equal(dragstart.mock.callCount(), 0);
      t.assert.equal(drag.mock.callCount(), 0);
      t.assert.equal(dragend.mock.callCount(), 0);

      simulate.touchmove(map.getCanvas());
      map._renderTaskQueue.run();
      t.assert.equal(dragstart.mock.callCount(), 1);
      t.assert.equal(drag.mock.callCount(), 1);
      t.assert.equal(dragend.mock.callCount(), 0);

      simulate.touchend(map.getCanvas());
      map._renderTaskQueue.run();
      t.assert.equal(dragstart.mock.callCount(), 1);
      t.assert.equal(drag.mock.callCount(), 1);
      t.assert.equal(dragend.mock.callCount(), 1);

      map.remove();
    }
  );

  await t.test(
    'DragPanHandler captures touchmove events during a mouse-triggered drag (receives them even if they occur outside the map)',
    t => {
      const { map } = createMap();

      const dragstart = t.mock.fn();
      const drag = t.mock.fn();
      const dragend = t.mock.fn();

      map.on('dragstart', dragstart);
      map.on('drag', drag);
      map.on('dragend', dragend);

      simulate.touchstart(map.getCanvas());
      map._renderTaskQueue.run();
      t.assert.equal(dragstart.mock.callCount(), 0);
      t.assert.equal(drag.mock.callCount(), 0);
      t.assert.equal(dragend.mock.callCount(), 0);

      simulate.touchmove(window.document.body);
      map._renderTaskQueue.run();
      t.assert.equal(dragstart.mock.callCount(), 1);
      t.assert.equal(drag.mock.callCount(), 1);
      t.assert.equal(dragend.mock.callCount(), 0);

      simulate.touchend(map.getCanvas());
      map._renderTaskQueue.run();
      t.assert.equal(dragstart.mock.callCount(), 1);
      t.assert.equal(drag.mock.callCount(), 1);
      t.assert.equal(dragend.mock.callCount(), 1);

      map.remove();
    }
  );

  await t.test('DragPanHandler prevents mousemove events from firing during a drag (#1555)', t => {
    const { map } = createMap();

    const mousemove = t.mock.fn();
    map.on('mousemove', mousemove);

    simulate.mousedown(map.getCanvasContainer());
    map._renderTaskQueue.run();

    simulate.mousemove(map.getCanvasContainer());
    map._renderTaskQueue.run();

    simulate.mouseup(map.getCanvasContainer());
    map._renderTaskQueue.run();

    t.assert.equal(mousemove.mock.callCount(), 0);

    map.remove();
  });

  await t.test('DragPanHandler ends a mouse-triggered drag if the window blurs', t => {
    const { map } = createMap();

    const dragend = t.mock.fn();
    map.on('dragend', dragend);

    simulate.mousedown(map.getCanvas());
    map._renderTaskQueue.run();

    simulate.mousemove(map.getCanvas());
    map._renderTaskQueue.run();

    simulate.blur(window);
    t.assert.equal(dragend.mock.callCount(), 1);

    map.remove();
  });

  await t.test('DragPanHandler ends a touch-triggered drag if the window blurs', t => {
    const { map } = createMap();

    const dragend = t.mock.fn();
    map.on('dragend', dragend);

    simulate.touchstart(map.getCanvas());
    map._renderTaskQueue.run();

    simulate.touchmove(map.getCanvas());
    map._renderTaskQueue.run();

    simulate.blur(window);
    t.assert.equal(dragend.mock.callCount(), 1);

    map.remove();
  });

  await t.test('DragPanHandler requests a new render frame after each mousemove event', t => {
    const { map } = createMap();
    const requestFrame = t.mock.method(map, '_requestRenderFrame');

    simulate.mousedown(map.getCanvas());
    simulate.mousemove(map.getCanvas());
    t.assert.ok(requestFrame.mock.callCount() > 0);

    map._renderTaskQueue.run();

    // https://github.com/mapbox/mapbox-gl-js/issues/6063
    requestFrame.mock.resetCalls();
    simulate.mousemove(map.getCanvas());
    t.assert.equal(requestFrame.mock.callCount(), 1);

    map.remove();
  });

  await t.test('DragPanHandler can interleave with another handler', t => {
    // https://github.com/mapbox/mapbox-gl-js/issues/6106
    const { map } = createMap();

    const dragstart = t.mock.fn();
    const drag = t.mock.fn();
    const dragend = t.mock.fn();

    map.on('dragstart', dragstart);
    map.on('drag', drag);
    map.on('dragend', dragend);

    simulate.mousedown(map.getCanvas());
    map._renderTaskQueue.run();
    t.assert.equal(dragstart.mock.callCount(), 0);
    t.assert.equal(drag.mock.callCount(), 0);
    t.assert.equal(dragend.mock.callCount(), 0);

    simulate.mousemove(map.getCanvas());
    map._renderTaskQueue.run();
    t.assert.equal(dragstart.mock.callCount(), 1);
    t.assert.equal(drag.mock.callCount(), 1);
    t.assert.equal(dragend.mock.callCount(), 0);

    // simulate a scroll zoom
    simulate.wheel(map.getCanvas(), { type: 'wheel', deltaY: -simulate.magicWheelZoomDelta });
    map._renderTaskQueue.run();
    t.assert.equal(dragstart.mock.callCount(), 1);
    t.assert.equal(drag.mock.callCount(), 1);
    t.assert.equal(dragend.mock.callCount(), 0);

    simulate.mousemove(map.getCanvas());
    map._renderTaskQueue.run();
    t.assert.equal(dragstart.mock.callCount(), 1);
    t.assert.equal(drag.mock.callCount(), 2);
    t.assert.equal(dragend.mock.callCount(), 0);

    simulate.mouseup(map.getCanvas());
    map._renderTaskQueue.run();
    t.assert.equal(dragstart.mock.callCount(), 1);
    t.assert.equal(drag.mock.callCount(), 2);
    t.assert.equal(dragend.mock.callCount(), 1);

    map.remove();
  });

  Promise.all(
    ['ctrl', 'shift'].map(async modifier => {
      await t.test(`DragPanHandler does not begin a drag if the ${modifier} key is down on mousedown`, t => {
        const { map, gestures } = createMap();
        gestures.dragRotate.disable();

        const dragstart = t.mock.fn();
        const drag = t.mock.fn();
        const dragend = t.mock.fn();

        map.on('dragstart', dragstart);
        map.on('drag', drag);
        map.on('dragend', dragend);

        simulate.mousedown(map.getCanvas(), { [`${modifier}Key`]: true });
        map._renderTaskQueue.run();
        t.assert.equal(dragstart.mock.callCount(), 0);
        t.assert.equal(drag.mock.callCount(), 0);
        t.assert.equal(dragend.mock.callCount(), 0);

        simulate.mousemove(map.getCanvas(), { [`${modifier}Key`]: true });
        map._renderTaskQueue.run();
        t.assert.equal(dragstart.mock.callCount(), 0);
        t.assert.equal(drag.mock.callCount(), 0);
        t.assert.equal(dragend.mock.callCount(), 0);

        simulate.mouseup(map.getCanvas(), { [`${modifier}Key`]: true });
        map._renderTaskQueue.run();
        t.assert.equal(dragstart.mock.callCount(), 0);
        t.assert.equal(drag.mock.callCount(), 0);
        t.assert.equal(dragend.mock.callCount(), 0);

        map.remove();
      });

      await t.test(`DragPanHandler still ends a drag if the ${modifier} key is down on mouseup`, t => {
        const { map, gestures } = createMap();
        gestures.dragRotate.disable();

        const dragstart = t.mock.fn();
        const drag = t.mock.fn();
        const dragend = t.mock.fn();

        map.on('dragstart', dragstart);
        map.on('drag', drag);
        map.on('dragend', dragend);

        simulate.mousedown(map.getCanvas());
        map._renderTaskQueue.run();
        t.assert.equal(dragstart.mock.callCount(), 0);
        t.assert.equal(drag.mock.callCount(), 0);
        t.assert.equal(dragend.mock.callCount(), 0);

        simulate.mouseup(map.getCanvas(), { [`${modifier}Key`]: true });
        map._renderTaskQueue.run();
        t.assert.equal(dragstart.mock.callCount(), 0);
        t.assert.equal(drag.mock.callCount(), 0);
        t.assert.equal(dragend.mock.callCount(), 0);

        simulate.mousemove(map.getCanvas());
        map._renderTaskQueue.run();
        t.assert.equal(dragstart.mock.callCount(), 0);
        t.assert.equal(drag.mock.callCount(), 0);
        t.assert.equal(dragend.mock.callCount(), 0);

        map.remove();
      });
    })
  );

  await t.test('DragPanHandler does not begin a drag on right button mousedown', t => {
    const { map, gestures } = createMap();
    gestures.dragRotate.disable();

    const dragstart = t.mock.fn();
    const drag = t.mock.fn();
    const dragend = t.mock.fn();

    map.on('dragstart', dragstart);
    map.on('drag', drag);
    map.on('dragend', dragend);

    simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(dragstart.mock.callCount(), 0);
    t.assert.equal(drag.mock.callCount(), 0);
    t.assert.equal(dragend.mock.callCount(), 0);

    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(dragstart.mock.callCount(), 0);
    t.assert.equal(drag.mock.callCount(), 0);
    t.assert.equal(dragend.mock.callCount(), 0);

    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(dragstart.mock.callCount(), 0);
    t.assert.equal(drag.mock.callCount(), 0);
    t.assert.equal(dragend.mock.callCount(), 0);

    map.remove();
  });

  await t.test('DragPanHandler does not end a drag on right button mouseup', t => {
    const { map, gestures } = createMap();
    gestures.dragRotate.disable();

    const dragstart = t.mock.fn();
    const drag = t.mock.fn();
    const dragend = t.mock.fn();

    map.on('dragstart', dragstart);
    map.on('drag', drag);
    map.on('dragend', dragend);

    simulate.mousedown(map.getCanvas());
    map._renderTaskQueue.run();
    t.assert.equal(dragstart.mock.callCount(), 0);
    t.assert.equal(drag.mock.callCount(), 0);
    t.assert.equal(dragend.mock.callCount(), 0);

    simulate.mousemove(map.getCanvas());
    map._renderTaskQueue.run();
    t.assert.equal(dragstart.mock.callCount(), 1);
    t.assert.equal(drag.mock.callCount(), 1);
    t.assert.equal(dragend.mock.callCount(), 0);

    simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(dragstart.mock.callCount(), 1);
    t.assert.equal(drag.mock.callCount(), 1);
    t.assert.equal(dragend.mock.callCount(), 0);

    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(dragstart.mock.callCount(), 1);
    t.assert.equal(drag.mock.callCount(), 1);
    t.assert.equal(dragend.mock.callCount(), 0);

    simulate.mousemove(map.getCanvas());
    map._renderTaskQueue.run();
    t.assert.equal(dragstart.mock.callCount(), 1);
    t.assert.equal(drag.mock.callCount(), 2);
    t.assert.equal(dragend.mock.callCount(), 0);

    simulate.mouseup(map.getCanvas());
    map._renderTaskQueue.run();
    t.assert.equal(dragstart.mock.callCount(), 1);
    t.assert.equal(drag.mock.callCount(), 2);
    t.assert.equal(dragend.mock.callCount(), 1);

    map.remove();
  });

  await t.test('DragPanHandler does not begin a drag if preventDefault is called on the mousedown event', t => {
    const { map } = createMap();

    map.on('mousedown', e => e.preventDefault());

    const dragstart = t.mock.fn();
    const drag = t.mock.fn();
    const dragend = t.mock.fn();

    map.on('dragstart', dragstart);
    map.on('drag', drag);
    map.on('dragend', dragend);

    simulate.mousedown(map.getCanvas());
    map._renderTaskQueue.run();

    simulate.mousemove(map.getCanvas());
    map._renderTaskQueue.run();

    simulate.mouseup(map.getCanvas());
    map._renderTaskQueue.run();

    t.assert.equal(dragstart.mock.callCount(), 0);
    t.assert.equal(drag.mock.callCount(), 0);
    t.assert.equal(dragend.mock.callCount(), 0);

    map.remove();
  });

  await t.test('DragPanHandler does not begin a drag if preventDefault is called on the touchstart event', t => {
    const { map } = createMap();

    map.on('touchstart', e => e.preventDefault());

    const dragstart = t.mock.fn();
    const drag = t.mock.fn();
    const dragend = t.mock.fn();

    map.on('dragstart', dragstart);
    map.on('drag', drag);
    map.on('dragend', dragend);

    simulate.touchstart(map.getCanvas());
    map._renderTaskQueue.run();

    simulate.touchmove(map.getCanvas());
    map._renderTaskQueue.run();

    simulate.touchend(map.getCanvas());
    map._renderTaskQueue.run();

    t.assert.equal(dragstart.mock.callCount(), 0);
    t.assert.equal(drag.mock.callCount(), 0);
    t.assert.equal(dragend.mock.callCount(), 0);

    map.remove();
  });

  Promise.all(
    ['dragstart', 'drag'].map(async event => {
      await t.test(`DragPanHandler can be disabled on ${event} (#2419)`, t => {
        const { map, gestures } = createMap();

        map.on(event, () => gestures.dragPan.disable());

        const dragstart = t.mock.fn();
        const drag = t.mock.fn();
        const dragend = t.mock.fn();

        map.on('dragstart', dragstart);
        map.on('drag', drag);
        map.on('dragend', dragend);

        simulate.mousedown(map.getCanvas());
        map._renderTaskQueue.run();

        simulate.mousemove(map.getCanvas());
        map._renderTaskQueue.run();

        t.assert.equal(dragstart.mock.callCount(), 1);
        t.assert.equal(drag.mock.callCount(), event === 'dragstart' ? 0 : 1);
        t.assert.equal(dragend.mock.callCount(), 1);
        t.assert.equal(map.isMoving(), false);
        t.assert.equal(gestures.dragPan.isEnabled(), false);

        simulate.mouseup(map.getCanvas());
        map._renderTaskQueue.run();

        t.assert.equal(dragstart.mock.callCount(), 1);
        t.assert.equal(drag.mock.callCount(), event === 'dragstart' ? 0 : 1);
        t.assert.equal(dragend.mock.callCount(), 1);
        t.assert.equal(map.isMoving(), false);
        t.assert.equal(gestures.dragPan.isEnabled(), false);

        map.remove();
      });
    })
  );

  await t.test('DragPanHandler can be disabled after mousedown (#2419)', t => {
    const { map, gestures } = createMap();

    const dragstart = t.mock.fn();
    const drag = t.mock.fn();
    const dragend = t.mock.fn();

    map.on('dragstart', dragstart);
    map.on('drag', drag);
    map.on('dragend', dragend);

    simulate.mousedown(map.getCanvas());
    map._renderTaskQueue.run();

    gestures.dragPan.disable();

    simulate.mousemove(map.getCanvas());
    map._renderTaskQueue.run();

    t.assert.equal(dragstart.mock.callCount(), 0);
    t.assert.equal(drag.mock.callCount(), 0);
    t.assert.equal(dragend.mock.callCount(), 0);
    t.assert.equal(map.isMoving(), false);
    t.assert.equal(gestures.dragPan.isEnabled(), false);

    simulate.mouseup(map.getCanvas());
    map._renderTaskQueue.run();

    t.assert.equal(dragstart.mock.callCount(), 0);
    t.assert.equal(drag.mock.callCount(), 0);
    t.assert.equal(dragend.mock.callCount(), 0);
    t.assert.equal(map.isMoving(), false);
    t.assert.equal(gestures.dragPan.isEnabled(), false);

    map.remove();
  });
});
