// Auto-separates overlapping .map-object elements, skipping "holy" objects but moving others around them
(function arrangeMapObjects() {
  const MIN_DISTANCE = 135; // Minimum spacing
  const START_RADIUS = 200; // Start placing from this distance away from (0,0)
  const ANGLE_INCREMENT = 0.5; // radians, adjust to pack tighter/looser

  function getPosition(el) {
    return {
      x: parseFloat(el.style.left) || 0,
      y: parseFloat(el.style.top) || 0
    };
  }

  function setPosition(el, x, y) {
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }

  function isHoly(el) {
    try {
      const payload = JSON.parse(el.getAttribute('custompayload'));
      return (payload?.cords?.x === 0 && payload?.cords?.y === 0) || payload?.map_is_anvil === true;
    } catch (e) {
      return false;
    }
  }

  function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function isFarEnough(newPos, existingPositions) {
    return existingPositions.every(pos => distance(newPos, pos) >= MIN_DISTANCE);
  }

  function arrange() {
    const objects = Array.from(document.querySelectorAll('.map-object'));
    const placedPositions = [];

    let angle = 0;
    let radius = START_RADIUS;

    for (const el of objects) {
      if (isHoly(el)) {
        // Keep its current position
        placedPositions.push(getPosition(el));
        continue;
      }

      let tryCount = 0;
      let maxTries = 1000;
      let x, y, pos;

      // Find nearest free spot
      do {
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        pos = { x, y };

        angle += ANGLE_INCREMENT;
        if (angle >= Math.PI * 2) {
          angle = 0;
          radius += MIN_DISTANCE; // move out a ring
        }

        tryCount++;
      } while (!isFarEnough(pos, placedPositions) && tryCount < maxTries);

      setPosition(el, x, y);
      placedPositions.push(pos);
    }

    console.log("[arranger] All non-holy objects positioned without overlaps.");
  }

  arrange();
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
