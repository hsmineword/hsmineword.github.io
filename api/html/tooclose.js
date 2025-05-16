// Auto-separates overlapping .map-object elements, skipping "holy" objects but moving others around them
(function smartSeparateObjects() {
  const MIN_DISTANCE = 135;
  const STEP_DISTANCE = 50;
  const MAX_ATTEMPTS = 1000;

  function getPosition(el) {
    const computedStyle = window.getComputedStyle(el);
    return {
      x: parseFloat(computedStyle.left) || 0,
      y: parseFloat(computedStyle.top) || 0
    };
  }

  function setPosition(el, x, y) {
    el.style.position = 'absolute'; // Force absolute positioning
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

  function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function isTooClose(pos, others) {
    return others.some(p => distance(pos, p) < MIN_DISTANCE);
  }

  function getNextPosition(baseX, baseY, angleDeg, radius) {
    const angleRad = angleDeg * (Math.PI / 180);
    return {
      x: baseX + Math.cos(angleRad) * radius,
      y: baseY + Math.sin(angleRad) * radius
    };
  }

  async function repositionOneByOne(objects) {
    const placedPositions = [];

    for (const el of objects) {
      if (isHoly(el)) {
        const holyPos = getPosition(el);
        placedPositions.push(holyPos);
        continue;
      }

      let attempts = 0;
      let angle = 0;
      let radius = STEP_DISTANCE;
      let newPos = getPosition(el);

      while (isTooClose(newPos, placedPositions) && attempts < MAX_ATTEMPTS) {
        newPos = getNextPosition(0, 0, angle, radius);
        angle += 15;
        if (angle >= 360) {
          angle = 0;
          radius += STEP_DISTANCE;
        }
        attempts++;
      }

      setPosition(el, newPos.x, newPos.y);
      placedPositions.push(newPos);

      await new Promise(resolve => setTimeout(resolve, 30)); // Delay per item for visible movement
    }

    console.log("[smart-separator] Done spacing all non-holy objects.");
  }

  function startWhenReady() {
    const objects = Array.from(document.querySelectorAll('.map-object'));
    if (objects.length === 0) {
      console.warn('[smart-separator] No .map-object elements found. Retrying...');
      setTimeout(startWhenReady, 500);
      return;
    }

    console.log(`[smart-separator] Found ${objects.length} .map-object(s). Beginning spacing...`);
    repositionOneByOne(objects);
  }

  startWhenReady();
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
