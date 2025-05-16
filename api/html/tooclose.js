// Auto-separates overlapping .map-object elements, skipping "holy" objects but moving others around them
(function separateOverlappingObjects() {
  const MIN_DISTANCE = 135; // Minimum pixels between objects (adjust as needed)
  const PUSH_FORCE = 145;  // How far to push per tick

  function getPosition(el) {
    return {
      x: parseFloat(el.style.left),
      y: parseFloat(el.style.top)
    };
  }

  function setPosition(el, x, y) {
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }

  // Check if the object is "holy" (based on custompayload data)
  function isHoly(el) {
    const payload = JSON.parse(el.getAttribute('custompayload'));
    // Object is holy if coordinates are (0,0) or if it has map_is_anvil as true
    return payload.cords.x === 0 && payload.cords.y === 0 || payload.map_is_anvil === true;
  }

  // Function to push apart overlapping elements
  function pushApart(el1, el2) {
    const pos1 = getPosition(el1);
    const pos2 = getPosition(el2);
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Skip pushing apart if either element is holy
    if (isHoly(el1) && isHoly(el2)) {
      return;
    }

    // If one of the elements is holy, push the other element away from it
    if (isHoly(el1)) {
      const pushX = (dx / dist) * PUSH_FORCE;
      const pushY = (dy / dist) * PUSH_FORCE;
      setPosition(el2, pos2.x + pushX, pos2.y + pushY); // Move the non-holy element
    } else if (isHoly(el2)) {
      const pushX = (dx / dist) * PUSH_FORCE;
      const pushY = (dy / dist) * PUSH_FORCE;
      setPosition(el1, pos1.x - pushX, pos1.y - pushY); // Move the non-holy element
    } else if (dist < MIN_DISTANCE && dist > 0.01) {
      // Move both elements away if both are non-holy
      const pushX = (dx / dist) * PUSH_FORCE;
      const pushY = (dy / dist) * PUSH_FORCE;
      setPosition(el1, pos1.x - pushX, pos1.y - pushY);
      setPosition(el2, pos2.x + pushX, pos2.y + pushY);
    }
  }

  function loop() {
    const objects = Array.from(document.querySelectorAll('.map-object'));
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        pushApart(objects[i], objects[j]);
      }
    }
    requestAnimationFrame(loop); // Runs at ~60fps instead of setInterval(1)
  }

  console.log("[auto-separator] Running object separation loop...");
  loop();
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
