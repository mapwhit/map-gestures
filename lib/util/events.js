import Point from '@mapbox/point-geometry';
import { mousePos, touchPos } from './dom.js';
import { Event } from '@mapwhit/events';

class MapEvent extends Event {
  #defaultPrevented = false;

  /**
   * @param {string} type
   * @param {Map} map The Map object that fired the event.
   * @param {object} data Additional data associated with the event.
   */
  constructor(type, map, data) {
    super(type, data);
    this.target = map;
  }

  /**
   * Prevents subsequent default processing of the event by the map.
   * Calling this method will prevent the following default map behaviors:
   *
   * - on `mousedown` events, the behavior of `DragPanHandler`
   * - on `mousedown` events, the behavior of `DragRotateHandler`
   * - on `mousedown` events, the behavior of `BoxZoomHandler`
   * - on `dblclick` events, the behavior of `DoubleClickZoomHandler`
   *
   * - on `touchstart` events, the behavior of `DragPanHandler`
   * - on `touchstart` events, the behavior of `TouchZoomRotateHandler`
   *
   * - on `mousewheel` events, the the behavior of `ScrollZoomHandler}`
   *
   */
  preventDefault() {
    this.#defaultPrevented = true;
  }

  /**
   * `true` if `preventDefault` has been called.
   */
  get defaultPrevented() {
    return this.#defaultPrevented;
  }
}

export class MapMouseEvent extends MapEvent {
  /**
   * @param {string} type
   * @param {Map} map The Map object that fired the event.
   * @param {object} originalEvent The DOM event which caused the map event.
   */
  constructor(type, map, originalEvent) {
    const point = mousePos(map.getCanvasContainer(), originalEvent);
    const lngLat = map.unproject(point);
    super(type, map, { point, lngLat, originalEvent });
  }
}

export class MapTouchEvent extends MapEvent {
  /**
   * @param {string} type
   * @param {Map} map The Map object that fired the event.
   * @param {object} originalEvent The DOM event which caused the map event.
   */
  constructor(type, map, originalEvent) {
    const points = touchPos(map.getCanvasContainer(), originalEvent);
    const lngLats = points.map(t => map.unproject(t));
    const len = points.length;
    const point = points.reduce((prev, curr) => prev.add(curr.div(len)), new Point(0, 0));
    const lngLat = map.unproject(point);
    super(type, map, { points, point, lngLats, lngLat, originalEvent });
  }
}

export class MapWheelEvent extends MapEvent {
  /**
   * @param {string} type
   * @param {Map} map The Map object that fired the event.
   * @param {object} originalEvent The DOM event which caused the map event.
   */
  constructor(type, map, originalEvent) {
    super(type, map, { originalEvent });
  }
}
