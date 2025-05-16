// Auto-separates overlapping .map-object elements, skipping "holy" objects but moving others around them
(function separateOverlappingObjectsAccurately() {
  const MIN_DISTANCE = 135;
  const STEP_DISTANCE = 50;
  const MAX_ATTEMPTS = 1000;

  function isHoly(obj) {
    return (obj.cords.x === 0 && obj.cords.y === 0) || obj.map_is_anvil === true;
  }

  function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function isTooClose(pos, others) {
    return others.some(p => distance(pos, p) < MIN_DISTANCE);
  }

  function getNextPosition(angleDeg, radius) {
    const rad = angleDeg * (Math.PI / 180);
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
    };
  }

  async function separateObjects() {
    if (!window.mapObjects || typeof mapObjects.forEach !== 'function') {
      console.warn('[TooCloseFix] mapObjects not ready. Retrying...');
      setTimeout(separateObjects, 500);
      return;
    }

    console.log('[TooCloseFix] Starting separation...');
    const placed = [];

    mapObjects.forEach(obj => {
      if (isHoly(obj)) {
        placed.push({ x: obj._pos.x, y: obj._pos.y });
        return;
      }

      let angle = 0;
      let radius = STEP_DISTANCE;
      let attempts = 0;
      let newPos = { x: 0, y: 0 };

      while (isTooClose(newPos, placed) && attempts < MAX_ATTEMPTS) {
        newPos = getNextPosition(angle, radius);
        angle += 15;
        if (angle >= 360) {
          angle = 0;
          radius += STEP_DISTANCE;
        }
        attempts++;
      }

      obj._pos.x = newPos.x;
      obj._pos.y = newPos.y;
      placed.push(newPos);
      console.log(`[TooCloseFix] Moved ${obj.map_name} to (${newPos.x.toFixed(1)}, ${newPos.y.toFixed(1)})`);
    });

    console.log('[TooCloseFix] All objects processed.');
  }

  separateObjects();
})();








function loadHeatmapScript() {
  const delay = Math.floor(Math.random() * 1000) + 1000; // Random delay between 1000 and 2000 ms
  console.log(`[HeatmapLoader] Waiting for ${delay} ms before loading heatmap.js...`);

  setTimeout(() => {
    const script = document.createElement('script');
    const randomJam = Math.random().toString(36).substring(2, 10); // random string
    script.src = `https://hsmineword.github.io/api/html/heatmap.js?jam=${randomJam}`;
    script.type = 'text/javascript';
    script.async = true;

    script.onload = function () {
      console.log('[HeatmapLoader] heatmap.js loaded successfully.');
      if (typeof renderConstellationHeatmaps === 'function') {
        console.log('[HeatmapLoader] Executing renderConstellationHeatmaps()...');
        renderConstellationHeatmaps();
      } else {
        console.warn('[HeatmapLoader] renderConstellationHeatmaps() not found after load.');
      }
    };

    script.onerror = function () {
      console.error('[HeatmapLoader] Failed to load heatmap.js.');
    };

    document.head.appendChild(script);
  }, delay); // Delay the script loading by random amount of time (1-2 seconds)
}

loadHeatmapScript();
