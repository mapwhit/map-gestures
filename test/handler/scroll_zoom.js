import test from 'node:test';
import { assertEqualWithPrecision, createMap, createWindow, simulate } from '../helper.js';

test('ScrollZoomHandler', async t => {
  let globalWindow;
  let now = 0;

  t.before(() => {
    globalWindow = globalThis.window;
    globalThis.window = createWindow();
  });

  t.after(() => {
    globalThis.window.close();
    globalThis.window = globalWindow;
  });

  t.beforeEach(t => {
    t.mock.method(performance, 'now', () => now);
    now = 1555555555555;
    t.assert.equalWithPrecision = assertEqualWithPrecision;
  });

  await t.test('Zooms for single mouse wheel tick', t => {
    const { map } = createMap();
    map._renderTaskQueue.run();

    // simulate a single 'wheel' event
    const startZoom = map.getZoom();

    simulate.wheel(map.getCanvas(), { type: 'wheel', deltaY: -simulate.magicWheelZoomDelta });
    map._renderTaskQueue.run();

    now += 400;
    map._renderTaskQueue.run();

    t.assert.equalWithPrecision(map.getZoom() - startZoom, 0.0285, 0.001);

    map.remove();
  });

  await t.test('Zooms for single mouse wheel tick with non-magical deltaY', () => {
    const { map } = createMap();
    map._renderTaskQueue.run();

    // Simulate a single 'wheel' event without the magical deltaY value.
    // This requires the handler to briefly wait to see if a subsequent
    // event is coming in order to guess trackpad vs. mouse wheel
    simulate.wheel(map.getCanvas(), { type: 'wheel', deltaY: -20 });
    map.on('zoomstart', () => map.remove());
  });

  await t.test('Zooms for multiple mouse wheel ticks', t => {
    const { map } = createMap();

    map._renderTaskQueue.run();
    const startZoom = map.getZoom();

    const events = [
      [2, { type: 'wheel', deltaY: -simulate.magicWheelZoomDelta }],
      [7, { type: 'wheel', deltaY: -41 }],
      [30, { type: 'wheel', deltaY: -169 }],
      [1, { type: 'wheel', deltaY: -801 }],
      [5, { type: 'wheel', deltaY: -326 }],
      [20, { type: 'wheel', deltaY: -345 }],
      [22, { type: 'wheel', deltaY: -376 }]
    ];

    const canvas = map.getCanvas();
    const end = now + 500;
    let lastWheelEvent = now;

    // simulate the above sequence of wheel events, with render frames
    // interspersed every 20ms
    while (now++ < end) {
      t.assert.equal(now, performance.now());
      if (events.length && lastWheelEvent + events[0][0] === now) {
        const [, event] = events.shift();
        simulate.wheel(canvas, event);
        lastWheelEvent = now;
      }
      if (now % 20 === 0) {
        map._renderTaskQueue.run();
      }
    }

    t.assert.equal(events.length, 0);
    t.assert.equalWithPrecision(map.getZoom() - startZoom, 1.944, 0.001);

    map.remove();
  });

  await t.test('Gracefully ignores wheel events with deltaY: 0', t => {
    const { map } = createMap();
    map._renderTaskQueue.run();

    const startZoom = map.getZoom();
    // simulate  shift+'wheel' events
    simulate.wheel(map.getCanvas(), { type: 'wheel', deltaY: -0, shiftKey: true });
    simulate.wheel(map.getCanvas(), { type: 'wheel', deltaY: -0, shiftKey: true });
    simulate.wheel(map.getCanvas(), { type: 'wheel', deltaY: -0, shiftKey: true });
    simulate.wheel(map.getCanvas(), { type: 'wheel', deltaY: -0, shiftKey: true });
    map._renderTaskQueue.run();

    now += 400;
    map._renderTaskQueue.run();

    t.assert.equal(map.getZoom() - startZoom, 0.0);
  });

  await t.test('Gracefully handle wheel events that cancel each other out before the first scroll frame', () => {
    // See also https://github.com/mapbox/mapbox-gl-js/issues/6782
    const { map } = createMap();
    map._renderTaskQueue.run();

    simulate.wheel(map.getCanvas(), { type: 'wheel', deltaY: -1 });
    simulate.wheel(map.getCanvas(), { type: 'wheel', deltaY: -1 });
    now += 1;
    simulate.wheel(map.getCanvas(), { type: 'wheel', deltaY: 2 });

    map._renderTaskQueue.run();

    now += 400;
    map._renderTaskQueue.run();
  });

  await t.test('does not zoom if preventDefault is called on the wheel event', t => {
    const { map } = createMap({ bubbleEventsToMap: true });

    map.on('wheel', e => e.preventDefault());

    simulate.wheel(map.getCanvas(), { type: 'wheel', deltaY: -simulate.magicWheelZoomDelta });
    map._renderTaskQueue.run();

    now += 400;
    map._renderTaskQueue.run();

    t.assert.equal(map.getZoom(), 0);

    map.remove();
  });

  await t.test('emits one movestart event and one moveend event while zooming', t => {
    t.mock.timers.enable();
    const { map } = createMap();

    let startCount = 0;
    map.on('movestart', () => {
      startCount += 1;
    });

    let endCount = 0;
    map.on('moveend', () => {
      endCount += 1;
    });

    const events = [
      [2, { type: 'trackpad', deltaY: -1 }],
      [7, { type: 'trackpad', deltaY: -2 }],
      [30, { type: 'wheel', deltaY: -5 }]
    ];

    const end = now + 50;
    let lastWheelEvent = now;

    while (now++ < end) {
      if (events.length && lastWheelEvent + events[0][0] === now) {
        const [, event] = events.shift();
        simulate.wheel(map.getCanvas(), event);
        lastWheelEvent = now;
      }
      if (now % 20 === 0) {
        map._renderTaskQueue.run();
      }
    }

    t.mock.timers.tick(200);

    t.assert.equal(startCount, 1);
    t.assert.equal(endCount, 1);
  });

  await t.test('emits one zoomstart event and one zoomend event while zooming', t => {
    t.mock.timers.enable();
    const { map } = createMap();

    let startCount = 0;
    map.on('zoomstart', () => {
      startCount += 1;
    });

    let endCount = 0;
    map.on('zoomend', () => {
      endCount += 1;
    });

    const events = [
      [2, { type: 'trackpad', deltaY: -1 }],
      [7, { type: 'trackpad', deltaY: -2 }],
      [30, { type: 'wheel', deltaY: -5 }]
    ];

    const end = now + 50;
    let lastWheelEvent = now;

    while (now++ < end) {
      if (events.length && lastWheelEvent + events[0][0] === now) {
        const [, event] = events.shift();
        simulate.wheel(map.getCanvas(), event);
        lastWheelEvent = now;
      }
      if (now % 20 === 0) {
        map._renderTaskQueue.run();
      }
    }

    t.mock.timers.tick(200);

    t.assert.equal(startCount, 1);
    t.assert.equal(endCount, 1);
  });
});
