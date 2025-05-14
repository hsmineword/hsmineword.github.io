function renderConstellationHeatmaps() {
  const container = document.body;
  const galaxyCanvas = document.getElementById('galaxy');
  const heatmapLayers = {};

  function updateHeatmaps() {
    const mapObjects = document.querySelectorAll('.map-object');
    const groups = {};

    // Detect zoom level from transform: scale(...)
    let zoomLevel = 1;
    if (mapObjects.length > 0) {
      const transform = mapObjects[0].querySelector('img')?.style?.transform || '';
      const match = transform.match(/scale\(([\d.]+)\)/);
      if (match) {
        zoomLevel = parseFloat(match[1]) || 1;
      }
    }

    // Group map-objects by constellation ID
    mapObjects.forEach(el => {
      const payloadStr = el.getAttribute('custompayload');
      if (!payloadStr) return;
      let payload;
      try {
        payload = JSON.parse(payloadStr);
      } catch (e) {
        console.warn('Invalid JSON payload on map-object', e);
        return;
      }

      const { map_constellation_id, heatmaphex } = payload;
      if (!map_constellation_id) return;

      if (!groups[map_constellation_id]) {
        groups[map_constellation_id] = {
          color: heatmaphex || '#ff0000',
          objects: []
        };
      }
      groups[map_constellation_id].objects.push(el);
    });

    console.log('[Heatmap] Found constellation groups:', Object.keys(groups));

    // Clear all canvases
    for (const id in heatmapLayers) {
      const canvas = heatmapLayers[id];
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Render heatmaps
    Object.entries(groups).forEach(([constellationId, group]) => {
      const color = group.color;

      // Create or reuse canvas
      let canvas = heatmapLayers[constellationId];
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1';
        canvas.width = galaxyCanvas.width;
        canvas.height = galaxyCanvas.height;
        container.appendChild(canvas);
        heatmapLayers[constellationId] = canvas;
        console.log(`[Heatmap] Created layer for constellation: ${constellationId}`);
      }

      const ctx = canvas.getContext('2d');

      // Compute center of group
      const coords = group.objects.map(el => {
        const x = parseFloat(el.style.left);
        const y = parseFloat(el.style.top);
        return [x, y];
      });

      const avgX = coords.reduce((a, b) => a + b[0], 0) / coords.length;
      const avgY = coords.reduce((a, b) => a + b[1], 0) / coords.length;
      const radius = (75 + zoomLevel * 32); // adjust based on zoom

      const gradient = ctx.createRadialGradient(avgX, avgY, 0, avgX, avgY, radius);
      gradient.addColorStop(0, hexToRGBA(color, 0.35));
      gradient.addColorStop(1, hexToRGBA(color, 0));
      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.arc(avgX, avgY, radius, 0, 2 * Math.PI);
      ctx.fill();

      console.log(`[Heatmap] Drew for ${constellationId} at (${avgX.toFixed(1)}, ${avgY.toFixed(1)}) with radius ${radius.toFixed(1)} and color ${color}`);
    });
  }

  function hexToRGBA(hex, alpha) {
    const bigint = parseInt(hex.replace("#", ""), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Update every 500ms (or tweak if too fast)
  setInterval(updateHeatmaps, 500);
}
