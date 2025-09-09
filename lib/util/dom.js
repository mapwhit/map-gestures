import { Point } from '@mapwhit/point-geometry';

export default {
  initEnableDisableDrag,
  disableDrag,
  enableDrag,
  mouseButton,
  mousePos,
  touchPos,
  suppressClick
};

let docStyle;
let selectProp;

export function initEnableDisableDrag() {
  docStyle = window.document?.documentElement.style;
  selectProp = docStyle && ['userSelect', 'WebkitUserSelect'].find(prop => prop in docStyle);
}

let userSelect;

export function disableDrag() {
  if (docStyle && selectProp) {
    userSelect = docStyle[selectProp];
    docStyle[selectProp] = 'none';
  }
}

export function enableDrag() {
  if (docStyle && selectProp) {
    docStyle[selectProp] = userSelect;
  }
}

// Suppress the next click, but only if it's immediate.
function supressClickHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  window.removeEventListener('click', supressClickHandler, true);
}

export function suppressClick() {
  window.addEventListener('click', supressClickHandler, true);
  window.setTimeout(() => {
    if (typeof window === 'object' && window) {
      window.removeEventListener('click', supressClickHandler, true);
    }
  }, 0);
}

export function mousePos(el, e) {
  const rect = el.getBoundingClientRect();
  e = e.touches ? e.touches[0] : e;
  return new Point(e.clientX - rect.left - el.clientLeft, e.clientY - rect.top - el.clientTop);
}

export function touchPos(el, e) {
  const rect = el.getBoundingClientRect();
  const points = [];
  const touches = e.type === 'touchend' ? e.changedTouches : e.touches;
  for (let i = 0; i < touches.length; i++) {
    points.push(
      new Point(touches[i].clientX - rect.left - el.clientLeft, touches[i].clientY - rect.top - el.clientTop)
    );
  }
  return points;
}

export function mouseButton(e) {
  if (
    typeof window.InstallTrigger !== 'undefined' &&
    e.button === 2 &&
    e.ctrlKey &&
    window.navigator.platform.toUpperCase().includes('MAC')
  ) {
    // Fix for https://github.com/mapbox/mapbox-gl-js/issues/3131:
    // Firefox (detected by InstallTrigger) on Mac determines e.button = 2 when
    // using Control + left click
    return 0;
  }
  return e.button;
}
