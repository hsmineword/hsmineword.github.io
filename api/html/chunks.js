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
  div.style.display = 'block';
  div.style.width = '35px';
  div.style.height = '35px';
  div.style.borderRadius = '100%';
  div.style.backgroundColor = 'darkred';
  div.style.zIndex = 5000000000;
  div.title = `X: ${x}`;

  // Add the span inside the div
  div.innerHTML = '<span style="font-weight: bold; color: darkred;">|</span>';

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
