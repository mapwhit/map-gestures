import UnitBezier from '@mapbox/unitbezier';

/**
 * Given given (x, y), (x1, y1) control points for a bezier curve,
 * return a function that interpolates along that curve.
 *
 * @param {number} p1x - The x-coordinate of the first control point.
 * @param {number} p1y - The y-coordinate of the first control point.
 * @param {number} p2x - The x-coordinate of the second control point.
 * @param {number} p2y - The y-coordinate of the second control point.
 * @returns {function} A function that interpolates along the bezier curve.
 */
export function bezier(p1x, p1y, p2x, p2y) {
  const bezier = new UnitBezier(p1x, p1y, p2x, p2y);
  return t => bezier.solve(t);
}

/**
 * A default bezier-curve powered easing function with
 * control points (0.25, 0.1) and (0.25, 1)
 */
export const ease = bezier(0.25, 0.1, 0.25, 1);
