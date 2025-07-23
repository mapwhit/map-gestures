import test from 'node:test';
import mapGestures from '../lib/map-gestures.js';
import { createMap, createWindow, simulate } from './helper.js';

test('map-gestures', async t => {
  let globalWindow;
  t.before(() => {
    globalWindow = globalThis.window;
    globalThis.window = createWindow();
  });
  t.after(() => {
    globalThis.window.close();
    globalThis.window = globalWindow;
  });

  await t.test('should enable handlers for interactive map', t => {
    t.assert.equal(typeof mapGestures, 'function');
    const { map, gestures } = createMap({ interactive: true });

    t.assert.ok(gestures.boxZoom.isEnabled());
    t.assert.ok(gestures.doubleClickZoom.isEnabled());
    t.assert.ok(gestures.dragPan.isEnabled());
    t.assert.ok(gestures.dragRotate.isEnabled());
    t.assert.ok(gestures.keyboard.isEnabled());
    t.assert.ok(gestures.scrollZoom.isEnabled());
    t.assert.ok(gestures.touchZoomRotate.isEnabled());

    map.remove();
  });

  await t.test('should disable handlers for interactive map', t => {
    t.assert.equal(typeof mapGestures, 'function');
    const { map, gestures } = createMap({ interactive: false });

    t.assert.ok(!gestures.boxZoom.isEnabled());
    t.assert.ok(!gestures.doubleClickZoom.isEnabled());
    t.assert.ok(!gestures.dragPan.isEnabled());
    t.assert.ok(!gestures.dragRotate.isEnabled());
    t.assert.ok(!gestures.keyboard.isEnabled());
    t.assert.ok(!gestures.scrollZoom.isEnabled());
    t.assert.ok(!gestures.touchZoomRotate.isEnabled());

    map.remove();
  });

  const handlerNames = [
    'scrollZoom',
    'boxZoom',
    'dragRotate',
    'dragPan',
    'keyboard',
    'doubleClickZoom',
    'touchZoomRotate'
  ];
  await Promise.all(
    handlerNames.map(handlerName =>
      t.test(`disables "${handlerName}" handler`, t => {
        const { map, gestures } = createMap({
          [handlerName]: false,
          mapGestures
        });
        t.assert.ok(!gestures[handlerName].isEnabled());
        map.remove();
      })
    )
  );

  await test('Map#on adds a non-delegated event listener', t => {
    const { map } = createMap();
    const onclick = t.mock.fn(function (e) {
      t.assert.equal(this, map);
      t.assert.equal(e.type, 'click');
    });

    map.on('click', onclick);
    simulate.click(map.getCanvas());

    t.assert.equal(onclick.mock.callCount(), 1);
  });

  await test('Map#off removes a non-delegated event listener', t => {
    const { map } = createMap();
    const onclick = t.mock.fn();

    map.on('click', onclick);
    map.off('click', onclick);
    simulate.click(map.getCanvas());

    t.assert.equal(onclick.mock.callCount(), 0);
  });

  await test('Map#on mousedown can have default behavior prevented and still fire subsequent click event', t => {
    const { map } = createMap();

    map.on('mousedown', e => e.preventDefault());

    const click = t.mock.fn();
    map.on('click', click);

    simulate.click(map.getCanvas());
    t.assert.equal(click.mock.callCount(), 1);

    map.remove();
  });

  await test(`Map#on mousedown doesn't fire subsequent click event if mousepos changes`, t => {
    const { map } = createMap();

    map.on('mousedown', e => e.preventDefault());

    const click = t.mock.fn();
    map.on('click', click);
    const canvas = map.getCanvas();

    simulate.drag(canvas, {}, { clientX: 100, clientY: 100 });
    t.assert.equal(click.mock.callCount(), 0);

    map.remove();
  });

  await test('Map#on mousedown fires subsequent click event if mouse position changes less than click tolerance', t => {
    const { map } = createMap(t, { clickTolerance: 4 });

    map.on('mousedown', e => e.preventDefault());

    const click = t.mock.fn();
    map.on('click', click);
    const canvas = map.getCanvas();

    simulate.drag(canvas, { clientX: 100, clientY: 100 }, { clientX: 100, clientY: 103 });
    t.assert.ok(click.mock.callCount() > 0);

    map.remove();
  });

  await test('Map#on mousedown does not fire subsequent click event if mouse position changes more than click tolerance', t => {
    const { map } = createMap(t, { clickTolerance: 4 });

    map.on('mousedown', e => e.preventDefault());

    const click = t.mock.fn();
    map.on('click', click);
    const canvas = map.getCanvas();

    simulate.drag(canvas, { clientX: 100, clientY: 100 }, { clientX: 100, clientY: 104 });
    t.assert.equal(click.mock.callCount(), 0);

    map.remove();
  });

  await t.test('stops camera animation on mousedown when interactive', t => {
    const { map } = createMap({ interactive: true });
    map.flyTo({ center: [200, 0], duration: 100 });

    simulate.mousedown(map.getCanvasContainer());
    t.assert.equal(map.isEasing(), false);

    map.remove();
  });

  await t.test('continues camera animation on mousedown when non-interactive', t => {
    const { map } = createMap({ interactive: false });
    map.flyTo({ center: [200, 0], duration: 100 });

    simulate.mousedown(map.getCanvasContainer());
    t.assert.equal(map.isEasing(), true);

    map.remove();
  });

  await t.test('stops camera animation on touchstart when interactive', t => {
    const { map } = createMap({ interactive: true });
    map.flyTo({ center: [200, 0], duration: 100 });

    simulate.touchstart(map.getCanvasContainer());
    t.assert.equal(map.isEasing(), false);

    map.remove();
  });

  await t.test('continues camera animation on touchstart when non-interactive', t => {
    const { map } = createMap({ interactive: false });
    map.flyTo({ center: [200, 0], duration: 100 });

    simulate.touchstart(map.getCanvasContainer());
    t.assert.equal(map.isEasing(), true);

    map.remove();
  });
});
