export default function interpolate(a, b, t) {
  return a * (1 - t) + b * t;
}
