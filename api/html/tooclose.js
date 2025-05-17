// Auto-separates overlapping .map-object elements, skipping "holy" objects but moving others around them
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
