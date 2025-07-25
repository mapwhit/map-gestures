import test from 'node:test';
import { createMap, createWindow, simulate } from '../helper.js';

test('DragRotateHandler', async t => {
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
    'DragRotateHandler fires rotatestart, rotate, and rotateend events at appropriate times in response to a right-click drag',
    t => {
      const { map } = createMap();

      const rotatestart = t.mock.fn();
      const rotate = t.mock.fn();
      const rotateend = t.mock.fn();

      map.on('rotatestart', rotatestart);
      map.on('rotate', rotate);
      map.on('rotateend', rotateend);

      simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
      map._renderTaskQueue.run();
      t.assert.equal(rotatestart.mock.callCount(), 0);
      t.assert.equal(rotate.mock.callCount(), 0);
      t.assert.equal(rotateend.mock.callCount(), 0);

      simulate.mousemove(map.getCanvas(), { buttons: 2 });
      map._renderTaskQueue.run();
      t.assert.equal(rotatestart.mock.callCount(), 1);
      t.assert.equal(rotate.mock.callCount(), 1);
      t.assert.equal(rotateend.mock.callCount(), 0);

      simulate.mouseup(map.getCanvas(), { buttons: 0, button: 2 });
      map._renderTaskQueue.run();
      t.assert.equal(rotatestart.mock.callCount(), 1);
      t.assert.equal(rotate.mock.callCount(), 1);
      t.assert.equal(rotateend.mock.callCount(), 1);

      map.remove();
    }
  );

  await t.test('DragRotateHandler stops firing events after mouseup', t => {
    const { map } = createMap();

    const spy = t.mock.fn();
    map.on('rotatestart', spy);
    map.on('rotate', spy);
    map.on('rotateend', spy);

    simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    map._renderTaskQueue.run();
    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 2 });
    t.assert.equal(spy.mock.callCount(), 3);

    spy.mock.resetCalls();
    simulate.mousemove(map.getCanvas(), { buttons: 0 });
    map._renderTaskQueue.run();
    t.assert.equal(spy.mock.callCount(), 0);

    map.remove();
  });

  await t.test(
    'DragRotateHandler fires rotatestart, rotate, and rotateend events at appropriate times in response to a control-left-click drag',
    t => {
      const { map } = createMap();

      const rotatestart = t.mock.fn();
      const rotate = t.mock.fn();
      const rotateend = t.mock.fn();

      map.on('rotatestart', rotatestart);
      map.on('rotate', rotate);
      map.on('rotateend', rotateend);

      simulate.mousedown(map.getCanvas(), { buttons: 1, button: 0, ctrlKey: true });
      map._renderTaskQueue.run();
      t.assert.equal(rotatestart.mock.callCount(), 0);
      t.assert.equal(rotate.mock.callCount(), 0);
      t.assert.equal(rotateend.mock.callCount(), 0);

      simulate.mousemove(map.getCanvas(), { buttons: 1, ctrlKey: true });
      map._renderTaskQueue.run();
      t.assert.equal(rotatestart.mock.callCount(), 1);
      t.assert.equal(rotate.mock.callCount(), 1);
      t.assert.equal(rotateend.mock.callCount(), 0);

      simulate.mouseup(map.getCanvas(), { buttons: 0, button: 0, ctrlKey: true });
      map._renderTaskQueue.run();
      t.assert.equal(rotatestart.mock.callCount(), 1);
      t.assert.equal(rotate.mock.callCount(), 1);
      t.assert.equal(rotateend.mock.callCount(), 1);

      map.remove();
    }
  );

  await t.test('DragRotateHandler pitches in response to a right-click drag by default', t => {
    const { map } = createMap();

    const pitchstart = t.mock.fn();
    const pitch = t.mock.fn();
    const pitchend = t.mock.fn();

    map.on('pitchstart', pitchstart);
    map.on('pitch', pitch);
    map.on('pitchend', pitchend);

    simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(pitchstart.mock.callCount(), 1);
    t.assert.equal(pitch.mock.callCount(), 1);

    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 2 });
    t.assert.equal(pitchend.mock.callCount(), 1);

    map.remove();
  });

  await t.test('DragRotateHandler pitches in response to a control-left-click drag', t => {
    const { map } = createMap();

    const pitchstart = t.mock.fn();
    const pitch = t.mock.fn();
    const pitchend = t.mock.fn();

    map.on('pitchstart', pitchstart);
    map.on('pitch', pitch);
    map.on('pitchend', pitchend);

    simulate.mousedown(map.getCanvas(), { buttons: 1, button: 0, ctrlKey: true });
    simulate.mousemove(map.getCanvas(), { buttons: 1, ctrlKey: true });
    map._renderTaskQueue.run();
    t.assert.equal(pitchstart.mock.callCount(), 1);
    t.assert.equal(pitch.mock.callCount(), 1);

    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 0, ctrlKey: true });
    t.assert.equal(pitchend.mock.callCount(), 1);

    map.remove();
  });

  await t.test('DragRotateHandler does not pitch if given pitchWithRotate: false', t => {
    const { map } = createMap({ pitchWithRotate: false });

    const spy = t.mock.fn();

    map.on('pitchstart', spy);
    map.on('pitch', spy);
    map.on('pitchend', spy);

    simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    map._renderTaskQueue.run();
    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 2 });

    simulate.mousedown(map.getCanvas(), { buttons: 1, button: 0, ctrlKey: true });
    simulate.mousemove(map.getCanvas(), { buttons: 1, ctrlKey: true });
    map._renderTaskQueue.run();
    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 0, ctrlKey: true });

    t.assert.equal(spy.mock.callCount(), 0);

    map.remove();
  });

  await t.test('DragRotateHandler does not rotate or pitch when disabled', t => {
    const { map, gestures } = createMap();

    gestures.dragRotate.disable();

    const spy = t.mock.fn();

    map.on('rotatestart', spy);
    map.on('rotate', spy);
    map.on('rotateend', spy);
    map.on('pitchstart', spy);
    map.on('pitch', spy);
    map.on('pitchend', spy);

    simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    map._renderTaskQueue.run();
    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 2 });

    t.assert.equal(spy.mock.callCount(), 0);

    map.remove();
  });

  await t.test('DragRotateHandler ensures that map.isMoving() returns true during drag', t => {
    // The bearingSnap option here ensures that the moveend event is sent synchronously.
    const { map } = createMap({ bearingSnap: 0 });

    simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    t.assert.ok(map.isMoving());

    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 2 });
    t.assert.ok(!map.isMoving());

    map.remove();
  });

  await t.test('DragRotateHandler fires move events', t => {
    // The bearingSnap option here ensures that the moveend event is sent synchronously.
    const { map } = createMap({ bearingSnap: 0 });

    const movestart = t.mock.fn();
    const move = t.mock.fn();
    const moveend = t.mock.fn();

    map.on('movestart', movestart);
    map.on('move', move);
    map.on('moveend', moveend);

    simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(movestart.mock.callCount(), 1);
    t.assert.equal(move.mock.callCount(), 1);

    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 2 });
    t.assert.equal(moveend.mock.callCount(), 1);

    map.remove();
  });

  await t.test('DragRotateHandler includes originalEvent property in triggered events', t => {
    // The bearingSnap option here ensures that the moveend event is sent synchronously.
    const { map } = createMap({ bearingSnap: 0 });

    const rotatestart = t.mock.fn();
    const rotate = t.mock.fn();
    const rotateend = t.mock.fn();
    map.on('rotatestart', rotatestart);
    map.on('rotate', rotate);
    map.on('rotateend', rotateend);

    const pitchstart = t.mock.fn();
    const pitch = t.mock.fn();
    const pitchend = t.mock.fn();
    map.on('pitchstart', pitchstart);
    map.on('pitch', pitch);
    map.on('pitchend', pitchend);

    const movestart = t.mock.fn();
    const move = t.mock.fn();
    const moveend = t.mock.fn();
    map.on('movestart', movestart);
    map.on('move', move);
    map.on('moveend', moveend);

    simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    map._renderTaskQueue.run();
    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 2 });

    t.assert.equal(rotatestart.mock.calls[0].arguments[0].originalEvent.type, 'mousemove');
    t.assert.equal(pitchstart.mock.calls[0].arguments[0].originalEvent.type, 'mousemove');
    t.assert.equal(movestart.mock.calls[0].arguments[0].originalEvent.type, 'mousemove');

    t.assert.equal(rotate.mock.calls[0].arguments[0].originalEvent.type, 'mousemove');
    t.assert.equal(pitch.mock.calls[0].arguments[0].originalEvent.type, 'mousemove');
    t.assert.equal(move.mock.calls[0].arguments[0].originalEvent.type, 'mousemove');

    t.assert.equal(rotateend.mock.calls[0].arguments[0].originalEvent.type, 'mouseup');
    t.assert.equal(pitchend.mock.calls[0].arguments[0].originalEvent.type, 'mouseup');
    t.assert.equal(moveend.mock.calls[0].arguments[0].originalEvent.type, 'mouseup');

    map.remove();
  });

  await t.test('DragRotateHandler responds to events on the canvas container (#1301)', t => {
    const { map } = createMap();

    const rotatestart = t.mock.fn();
    const rotate = t.mock.fn();
    const rotateend = t.mock.fn();

    map.on('rotatestart', rotatestart);
    map.on('rotate', rotate);
    map.on('rotateend', rotateend);

    simulate.mousedown(map.getCanvasContainer(), { buttons: 2, button: 2 });
    simulate.mousemove(map.getCanvasContainer(), { buttons: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 1);
    t.assert.equal(rotate.mock.callCount(), 1);

    simulate.mouseup(map.getCanvasContainer(), { buttons: 0, button: 2 });
    t.assert.equal(rotateend.mock.callCount(), 1);

    map.remove();
  });

  await t.test('DragRotateHandler prevents mousemove events from firing during a drag (#1555)', t => {
    const { map } = createMap();

    const mousemove = t.mock.fn();
    map.on('mousemove', mousemove);

    simulate.mousedown(map.getCanvasContainer(), { buttons: 2, button: 2 });
    simulate.mousemove(map.getCanvasContainer(), { buttons: 2 });
    map._renderTaskQueue.run();
    simulate.mouseup(map.getCanvasContainer(), { buttons: 0, button: 2 });

    t.assert.equal(mousemove.mock.callCount(), 0);

    map.remove();
  });

  await t.test(
    'DragRotateHandler ends a control-left-click drag on mouseup even when the control key was previously released (#1888)',
    t => {
      const { map } = createMap();

      const rotatestart = t.mock.fn();
      const rotate = t.mock.fn();
      const rotateend = t.mock.fn();

      map.on('rotatestart', rotatestart);
      map.on('rotate', rotate);
      map.on('rotateend', rotateend);

      simulate.mousedown(map.getCanvas(), { buttons: 1, button: 0, ctrlKey: true });
      simulate.mousemove(map.getCanvas(), { buttons: 1, ctrlKey: true });
      map._renderTaskQueue.run();
      t.assert.equal(rotatestart.mock.callCount(), 1);
      t.assert.equal(rotate.mock.callCount(), 1);

      simulate.mouseup(map.getCanvas(), { buttons: 0, button: 0, ctrlKey: false });
      t.assert.equal(rotateend.mock.callCount(), 1);

      map.remove();
    }
  );

  await t.test('DragRotateHandler ends rotation if the window blurs (#3389)', t => {
    const { map } = createMap();

    const rotatestart = t.mock.fn();
    const rotate = t.mock.fn();
    const rotateend = t.mock.fn();

    map.on('rotatestart', rotatestart);
    map.on('rotate', rotate);
    map.on('rotateend', rotateend);

    simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 1);
    t.assert.equal(rotate.mock.callCount(), 1);

    simulate.blur(window);
    t.assert.equal(rotateend.mock.callCount(), 1);

    map.remove();
  });

  await t.test('DragRotateHandler requests a new render frame after each mousemove event', t => {
    const { map } = createMap();
    const requestRenderFrame = t.mock.method(map, '_requestRenderFrame');

    simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    t.assert.ok(requestRenderFrame.mock.callCount() > 0);

    map._renderTaskQueue.run();

    // https://github.com/mapbox/mapbox-gl-js/issues/6063
    requestRenderFrame.mock.resetCalls();
    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    t.assert.equal(requestRenderFrame.mock.callCount(), 1);

    map.remove();
  });

  await t.test('DragRotateHandler can interleave with another handler', t => {
    // https://github.com/mapbox/mapbox-gl-js/issues/6106
    const { map } = createMap();

    const rotatestart = t.mock.fn();
    const rotate = t.mock.fn();
    const rotateend = t.mock.fn();

    map.on('rotatestart', rotatestart);
    map.on('rotate', rotate);
    map.on('rotateend', rotateend);

    simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 0);
    t.assert.equal(rotate.mock.callCount(), 0);
    t.assert.equal(rotateend.mock.callCount(), 0);

    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 1);
    t.assert.equal(rotate.mock.callCount(), 1);
    t.assert.equal(rotateend.mock.callCount(), 0);

    // simulates another handler taking over
    // simulate a scroll zoom
    simulate.wheel(map.getCanvas(), { type: 'wheel', deltaY: -simulate.magicWheelZoomDelta });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 1);
    t.assert.equal(rotate.mock.callCount(), 1);
    t.assert.equal(rotateend.mock.callCount(), 0);

    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 1);
    t.assert.equal(rotate.mock.callCount(), 2);
    t.assert.equal(rotateend.mock.callCount(), 0);

    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 1);
    t.assert.equal(rotate.mock.callCount(), 2);
    t.assert.equal(rotateend.mock.callCount(), 1);

    map.remove();
  });

  await t.test('DragRotateHandler does not begin a drag on left-button mousedown without the control key', t => {
    const { map, gestures } = createMap();
    gestures.dragPan.disable();

    const rotatestart = t.mock.fn();
    const rotate = t.mock.fn();
    const rotateend = t.mock.fn();

    map.on('rotatestart', rotatestart);
    map.on('rotate', rotate);
    map.on('rotateend', rotateend);

    simulate.mousedown(map.getCanvas());
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 0);
    t.assert.equal(rotate.mock.callCount(), 0);
    t.assert.equal(rotateend.mock.callCount(), 0);

    simulate.mousemove(map.getCanvas());
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 0);
    t.assert.equal(rotate.mock.callCount(), 0);
    t.assert.equal(rotateend.mock.callCount(), 0);

    simulate.mouseup(map.getCanvas());
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 0);
    t.assert.equal(rotate.mock.callCount(), 0);
    t.assert.equal(rotateend.mock.callCount(), 0);

    map.remove();
  });

  await t.test('DragRotateHandler does not end a right-button drag on left-button mouseup', t => {
    const { map, gestures } = createMap();
    gestures.dragPan.disable();

    const rotatestart = t.mock.fn();
    const rotate = t.mock.fn();
    const rotateend = t.mock.fn();

    map.on('rotatestart', rotatestart);
    map.on('rotate', rotate);
    map.on('rotateend', rotateend);

    simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 0);
    t.assert.equal(rotate.mock.callCount(), 0);
    t.assert.equal(rotateend.mock.callCount(), 0);

    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 1);
    t.assert.equal(rotate.mock.callCount(), 1);
    t.assert.equal(rotateend.mock.callCount(), 0);

    simulate.mousedown(map.getCanvas(), { buttons: 3, button: 0 });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 1);
    t.assert.equal(rotate.mock.callCount(), 1);
    t.assert.equal(rotateend.mock.callCount(), 0);

    simulate.mouseup(map.getCanvas(), { buttons: 2, button: 0 });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 1);
    t.assert.equal(rotate.mock.callCount(), 1);
    t.assert.equal(rotateend.mock.callCount(), 0);

    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 1);
    t.assert.equal(rotate.mock.callCount(), 2);
    t.assert.equal(rotateend.mock.callCount(), 0);

    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 2 });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 1);
    t.assert.equal(rotate.mock.callCount(), 2);
    t.assert.equal(rotateend.mock.callCount(), 1);

    map.remove();
  });

  await t.test('DragRotateHandler does not end a control-left-button drag on right-button mouseup', t => {
    const { map, gestures } = createMap();
    gestures.dragPan.disable();

    const rotatestart = t.mock.fn();
    const rotate = t.mock.fn();
    const rotateend = t.mock.fn();

    map.on('rotatestart', rotatestart);
    map.on('rotate', rotate);
    map.on('rotateend', rotateend);

    simulate.mousedown(map.getCanvas(), { buttons: 1, button: 0, ctrlKey: true });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 0);
    t.assert.equal(rotate.mock.callCount(), 0);
    t.assert.equal(rotateend.mock.callCount(), 0);

    simulate.mousemove(map.getCanvas(), { buttons: 1, ctrlKey: true });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 1);
    t.assert.equal(rotate.mock.callCount(), 1);
    t.assert.equal(rotateend.mock.callCount(), 0);

    simulate.mousedown(map.getCanvas(), { buttons: 3, button: 2, ctrlKey: true });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 1);
    t.assert.equal(rotate.mock.callCount(), 1);
    t.assert.equal(rotateend.mock.callCount(), 0);

    simulate.mouseup(map.getCanvas(), { buttons: 1, button: 2, ctrlKey: true });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 1);
    t.assert.equal(rotate.mock.callCount(), 1);
    t.assert.equal(rotateend.mock.callCount(), 0);

    simulate.mousemove(map.getCanvas(), { buttons: 1, ctrlKey: true });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 1);
    t.assert.equal(rotate.mock.callCount(), 2);
    t.assert.equal(rotateend.mock.callCount(), 0);

    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 0, ctrlKey: true });
    map._renderTaskQueue.run();
    t.assert.equal(rotatestart.mock.callCount(), 1);
    t.assert.equal(rotate.mock.callCount(), 2);
    t.assert.equal(rotateend.mock.callCount(), 1);

    map.remove();
  });

  await t.test('DragRotateHandler does not begin a drag if preventDefault is called on the mousedown event', t => {
    const { map } = createMap();

    map.on('mousedown', e => e.preventDefault());

    const rotatestart = t.mock.fn();
    const rotate = t.mock.fn();
    const rotateend = t.mock.fn();

    map.on('rotatestart', rotatestart);
    map.on('rotate', rotate);
    map.on('rotateend', rotateend);

    simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
    map._renderTaskQueue.run();

    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    map._renderTaskQueue.run();

    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 2 });
    map._renderTaskQueue.run();

    t.assert.equal(rotatestart.mock.callCount(), 0);
    t.assert.equal(rotate.mock.callCount(), 0);
    t.assert.equal(rotateend.mock.callCount(), 0);

    map.remove();
  });

  Promise.all(
    ['rotatestart', 'rotate'].map(async event => {
      await t.test(`DragRotateHandler can be disabled on ${event} (#2419)`, t => {
        const { map, gestures } = createMap();

        map.on(event, () => gestures.dragRotate.disable());

        const rotatestart = t.mock.fn();
        const rotate = t.mock.fn();
        const rotateend = t.mock.fn();

        map.on('rotatestart', rotatestart);
        map.on('rotate', rotate);
        map.on('rotateend', rotateend);

        simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
        map._renderTaskQueue.run();

        simulate.mousemove(map.getCanvas(), { buttons: 2 });
        map._renderTaskQueue.run();

        t.assert.equal(rotatestart.mock.callCount(), 1);
        t.assert.equal(rotate.mock.callCount(), event === 'rotatestart' ? 0 : 1);
        t.assert.equal(rotateend.mock.callCount(), 1);
        t.assert.equal(map.isMoving(), false);
        t.assert.equal(gestures.dragRotate.isEnabled(), false);

        simulate.mouseup(map.getCanvas(), { buttons: 0, button: 2 });
        map._renderTaskQueue.run();

        t.assert.equal(rotatestart.mock.callCount(), 1);
        t.assert.equal(rotate.mock.callCount(), event === 'rotatestart' ? 0 : 1);
        t.assert.equal(rotateend.mock.callCount(), 1);
        t.assert.equal(map.isMoving(), false);
        t.assert.equal(gestures.dragRotate.isEnabled(), false);

        map.remove();
      });
    })
  );

  await t.test('DragRotateHandler can be disabled after mousedown (#2419)', t => {
    const { map, gestures } = createMap();

    const rotatestart = t.mock.fn();
    const rotate = t.mock.fn();
    const rotateend = t.mock.fn();

    map.on('rotatestart', rotatestart);
    map.on('rotate', rotate);
    map.on('rotateend', rotateend);

    simulate.mousedown(map.getCanvas(), { buttons: 2, button: 2 });
    map._renderTaskQueue.run();

    gestures.dragRotate.disable();

    simulate.mousemove(map.getCanvas(), { buttons: 2 });
    map._renderTaskQueue.run();

    t.assert.equal(rotatestart.mock.callCount(), 0);
    t.assert.equal(rotate.mock.callCount(), 0);
    t.assert.equal(rotateend.mock.callCount(), 0);
    t.assert.equal(map.isMoving(), false);
    t.assert.equal(gestures.dragRotate.isEnabled(), false);

    simulate.mouseup(map.getCanvas(), { buttons: 0, button: 2 });
    map._renderTaskQueue.run();

    t.assert.equal(rotatestart.mock.callCount(), 0);
    t.assert.equal(rotate.mock.callCount(), 0);
    t.assert.equal(rotateend.mock.callCount(), 0);
    t.assert.equal(map.isMoving(), false);
    t.assert.equal(gestures.dragRotate.isEnabled(), false);

    map.remove();
  });
});
