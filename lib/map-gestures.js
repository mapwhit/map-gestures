import boxZoom from './handler/box_zoom.js';
import doubleClickZoom from './handler/dblclick_zoom.js';
import dragPan from './handler/drag_pan.js';
import dragRotate from './handler/drag_rotate.js';
import keyboard from './handler/keyboard.js';
import scrollZoom from './handler/scroll_zoom.js';
import touchZoomRotate from './handler/touch_zoom_rotate.js';
import { mousePos } from './util/dom.js';
import { MapMouseEvent, MapTouchEvent, MapWheelEvent } from './util/events.js';

export { MapMouseEvent, MapTouchEvent, MapWheelEvent };

const defaultOptions = {
  interactive: true,
  scrollZoom: true,
  boxZoom: true,
  dragRotate: true,
  dragPan: true,
  keyboard: true,
  doubleClickZoom: true,
  touchZoomRotate: true,
  clickTolerance: 3
};

const handlers = {
  scrollZoom,
  boxZoom,
  dragRotate,
  dragPan,
  keyboard,
  doubleClickZoom,
  touchZoomRotate
};

/**
 * @param {boolean} [options.interactive=true] If `false`, no mouse, touch, or keyboard listeners will be attached to the map, so it will not respond to interaction.
 * @param {number} [options.clickTolerance=3] The max number of pixels a user can shift the mouse pointer during a click for it to be considered a valid click (as opposed to a mouse drag).
 * @param {boolean|Object} [options.scrollZoom=true] If `true`, the "scroll to zoom" interaction is enabled. An `Object` value is passed as options to {@link ScrollZoomHandler#enable}.
 * @param {boolean} [options.boxZoom=true] If `true`, the "box zoom" interaction is enabled (see {@link BoxZoomHandler}).
 * @param {boolean} [options.dragRotate=true] If `true`, the "drag to rotate" interaction is enabled (see {@link DragRotateHandler}).
 * @param {boolean} [options.dragPan=true] If `true`, the "drag to pan" interaction is enabled (see {@link DragPanHandler}).
 * @param {boolean} [options.keyboard=true] If `true`, keyboard shortcuts are enabled (see {@link KeyboardHandler}).
 * @param {boolean} [options.doubleClickZoom=true] If `true`, the "double click to zoom" interaction is enabled (see {@link DoubleClickZoomHandler}).
 * @param {boolean|Object} [options.touchZoomRotate=true] If `true`, the "pinch to rotate and zoom" interaction is enabled. An `Object` value is passed as options to {@link TouchZoomRotateHandler#enable}.
 */
export default function bindMapGestures(map, options) {
  options = { ...defaultOptions, ...options };
  const el = map.getCanvasContainer();
  let contextMenuEvent = null;
  let mouseDown = false;
  let startPos = null;
  const gestures = Object.fromEntries(
    Object.entries(handlers).map(([name, handler]) => {
      const bound = handler(map, options);
      if (options.interactive && options[name]) {
        bound.enable(options[name]);
      }
      return [name, bound];
    })
  );

  el.addEventListener('mouseout', onMouseOut);
  el.addEventListener('mousedown', onMouseDown);
  el.addEventListener('mouseup', onMouseUp);
  el.addEventListener('mousemove', onMouseMove);
  el.addEventListener('mouseover', onMouseOver);

  // Bind touchstart and touchmove with passive: false because, even though
  // they only fire a map events and therefore could theoretically be
  // passive, binding with passive: true causes iOS not to respect
  // e.preventDefault() in _other_ handlers, even if they are non-passive
  // (see https://bugs.webkit.org/show_bug.cgi?id=184251)
  el.addEventListener('touchstart', onTouchStart, { passive: false });
  el.addEventListener('touchmove', onTouchMove, { passive: false });

  el.addEventListener('touchend', onTouchEnd);
  el.addEventListener('touchcancel', onTouchCancel);
  el.addEventListener('click', onClick);
  el.addEventListener('dblclick', onDblClick);
  el.addEventListener('contextmenu', onContextMenu);
  el.addEventListener('wheel', onWheel, { passive: false });

  map._mapGestures = {
    isMoving,
    isZooming,
    isRotating
  };
  return gestures;

  function onMouseDown(e) {
    mouseDown = true;
    startPos = mousePos(el, e);

    const mapEvent = new MapMouseEvent('mousedown', map, e);
    map.fire(mapEvent);

    if (mapEvent.defaultPrevented) {
      return;
    }

    if (options.interactive && !gestures.doubleClickZoom.isActive()) {
      map.stop();
    }

    gestures.boxZoom.onMouseDown(e);

    if (!gestures.boxZoom.isActive() && !gestures.dragPan.isActive()) {
      gestures.dragRotate.onMouseDown(e);
    }

    if (!gestures.boxZoom.isActive() && !gestures.dragRotate.isActive()) {
      gestures.dragPan.onMouseDown(e);
    }
  }

  function onMouseUp(e) {
    const rotating = gestures.dragRotate.isActive();

    if (contextMenuEvent && !rotating) {
      // This will be the case for Mac
      map.fire(new MapMouseEvent('contextmenu', map, contextMenuEvent));
    }

    contextMenuEvent = null;
    mouseDown = false;

    map.fire(new MapMouseEvent('mouseup', map, e));
  }

  function onMouseMove(e) {
    if (gestures.dragPan.isActive()) return;
    if (gestures.dragRotate.isActive()) return;
    if (gestures.touchZoomRotate.isActive()) return;

    let target = e.target;
    while (target && target !== el) target = target.parentNode;
    if (target !== el) return;

    map.fire(new MapMouseEvent('mousemove', map, e));
  }

  function onMouseOver(e) {
    let { target } = e;
    while (target && target !== el) target = target.parentNode;
    if (target !== el) return;

    map.fire(new MapMouseEvent('mouseover', map, e));
  }

  function onMouseOut(e) {
    map.fire(new MapMouseEvent('mouseout', map, e));
  }

  function onTouchStart(e) {
    const mapEvent = new MapTouchEvent('touchstart', map, e);
    map.fire(mapEvent);

    if (mapEvent.defaultPrevented) {
      return;
    }

    if (options.interactive) {
      map.stop();
    }

    if (!gestures.boxZoom.isActive() && !gestures.dragRotate.isActive()) {
      gestures.dragPan.onTouchStart(e);
    }

    gestures.touchZoomRotate.onStart(e);
    gestures.doubleClickZoom.onTouchStart(mapEvent);
  }

  function onTouchMove(e) {
    if (gestures.dragPan.isActive()) return;
    if (gestures.dragRotate.isActive()) return;
    if (gestures.touchZoomRotate.isActive()) return;

    map.fire(new MapTouchEvent('touchmove', map, e));
  }

  function onTouchEnd(e) {
    map.fire(new MapTouchEvent('touchend', map, e));
  }

  function onTouchCancel(e) {
    map.fire(new MapTouchEvent('touchcancel', map, e));
  }

  function onClick(e) {
    if (startPos) {
      const pos = mousePos(el, e);
      if (pos.dist(startPos) > options.clickTolerance) {
        return;
      }
    }
    map.fire(new MapMouseEvent('click', map, e));
  }

  function onDblClick(e) {
    const mapEvent = new MapMouseEvent('dblclick', map, e);
    map.fire(mapEvent);

    if (mapEvent.defaultPrevented) {
      return;
    }

    gestures.doubleClickZoom.onDblClick(mapEvent);
  }

  function onContextMenu(e) {
    const rotating = gestures.dragRotate.isActive();
    if (!mouseDown && !rotating) {
      // Windows: contextmenu fired on mouseup, so fire event now
      map.fire(new MapMouseEvent('contextmenu', map, e));
    } else if (mouseDown) {
      // Mac: contextmenu fired on mousedown; we save it until mouseup for consistency's sake
      contextMenuEvent = e;
    }

    e.preventDefault();
  }

  function onWheel(e) {
    const mapEvent = new MapWheelEvent('wheel', map, e);
    map.fire(mapEvent);

    if (mapEvent.defaultPrevented) {
      return;
    }

    gestures.scrollZoom.onWheel(e);
  }

  function isMoving() {
    return (
      gestures.dragPan.isActive() ||
      gestures.dragRotate.isActive() ||
      gestures.touchZoomRotate.isActive() ||
      gestures.scrollZoom.isActive()
    );
  }

  function isZooming() {
    return gestures.touchZoomRotate.isActive() || gestures.scrollZoom.isZooming();
  }

  function isRotating() {
    return gestures.touchZoomRotate.isActive() || gestures.dragRotate.isActive();
  }
}
