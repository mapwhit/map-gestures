/**
 * The `DoubleClickZoomHandler` allows the user to zoom the map at a point by
 * double clicking or double tapping.
 */
export default function doubleClickZoomHandler(map) {
  let enabled = false;
  let active = false;

  let tapped;

  return {
    isEnabled,
    isActive,
    enable,
    disable,
    onDblClick,
    onTouchStart
  };

  /**
   * Returns a Boolean indicating whether the "double click to zoom" interaction is enabled.
   *
   * @returns {boolean} `true` if the "double click to zoom" interaction is enabled.
   */
  function isEnabled() {
    return enabled;
  }

  /**
   * Returns a Boolean indicating whether the "double click to zoom" interaction is active, i.e. currently being used.
   *
   * @returns {boolean} `true` if the "double click to zoom" interaction is active.
   */
  function isActive() {
    return active;
  }

  /**
   * Enables the "double click to zoom" interaction.
   *
   * @example
   * map.doubleClickZoom.enable();
   */
  function enable() {
    enabled = true;
  }

  /**
   * Disables the "double click to zoom" interaction.
   *
   * @example
   * map.doubleClickZoom.disable();
   */
  function disable() {
    enabled = false;
  }

  function onTouchStart(e) {
    if (!enabled) return;
    if (e.points.length > 1) return;

    if (!tapped) {
      tapped = setTimeout(() => {
        tapped = undefined;
      }, 300);
    } else {
      clearTimeout(tapped);
      tapped = undefined;
      zoom(e);
    }
  }

  function onDblClick(e) {
    if (!enabled) return;
    e.originalEvent.preventDefault();
    zoom(e);
  }

  function zoom(e) {
    active = true;
    map.on('zoomend', onZoomEnd);
    map.zoomTo(map.getZoom() + (e.originalEvent.shiftKey ? -1 : 1), { around: e.lngLat }, e);
  }

  function onZoomEnd() {
    active = false;
    map.off('zoomend', onZoomEnd);
  }
}
