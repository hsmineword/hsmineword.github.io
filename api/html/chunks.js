// === Setup Local Storage Defaults ===
(function setupLocalStorageDefaults() {
  if (localStorage.getItem('showchunks') === null) {
    localStorage.setItem('showchunks', 'false');
  }
})();


// ====== ShowChunks Logic ======
let chunkOverlays = [];

function createChunkCircle(x) {
  const div = document.createElement('div');
  div.className = 'chunk-marker';
  div.style.position = 'absolute';
  div.style.width = '10px';
  div.style.height = '10px';
  div.style.borderRadius = '50%';
  div.style.backgroundColor = 'darkred';
  div.style.zIndex = 500;
  div.title = `X: ${x}`;
  document.body.appendChild(div);
  chunkOverlays.push({ el: div, x });
}

function removeChunkCircles() {
  chunkOverlays.forEach(chunk => chunk.el.remove());
  chunkOverlays = [];
}

function updateChunkCircles() {
  const shouldShow = localStorage.getItem('showchunks') === 'true';

  removeChunkCircles();
  if (!shouldShow) return;

  for (let x = -5000; x <= 5000; x += 100) {
    createChunkCircle(x);
  }
}

// Reposition chunk overlays in the draw loop
function drawChunkOverlays(cos, sin) {
  const zoomMin = 0.5;
  for (const { el, x } of chunkOverlays) {
    const tx = x * cos; // Y is 0
    const ty = x * sin;

    const screenX = tx * zoom + width / 2 + offsetX;
    const screenY = ty * zoom + height / 2 + offsetY;

    el.style.left = `${screenX - 5}px`;
    el.style.top = `${screenY - 5}px`;
  }
}

// Update main draw() to call this inside
// drawChunkOverlays(cos, sin);


setInterval(updateChunkCircles, 1000); // Check every second
