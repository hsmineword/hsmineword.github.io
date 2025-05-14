const canvas = document.getElementById('galaxy');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

let zoom = 1;
let offsetX = 0, offsetY = 0;
let drag = false;
let startX, startY;

const stars = [];
const numStars = 500;
const seed = Math.floor(Date.now() / 1000);

function seededRandom(seed) {
  return function () {
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;
    return ((seed < 0 ? ~seed + 1 : seed) % 1000) / 1000;
  };
}

const rand = seededRandom(seed);

for (let i = 0; i < numStars; i++) {
  stars.push({
    x: (rand() - 0.5) * 4000,
    y: (rand() - 0.5) * 4000,
    r: rand() * 1.5 + 0.5
  });
}

// Data structures for map objects
const mapObjects = [];
const objectIcons = new Map();

function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height); // Fill canvas with black

  ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
  ctx.scale(zoom, zoom);

  const time = Date.now() / 10000;
  const cos = Math.cos(time);
  const sin = Math.sin(time);

  // Draw stars
  for (const star of stars) {
    const x = star.x * cos - star.y * sin;
    const y = star.x * sin + star.y * cos;
    ctx.beginPath();
    ctx.arc(x, y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  // Draw map objects
  for (const obj of mapObjects) {
    const icon = objectIcons.get(obj.id);
    if (!icon || !icon.complete) continue;

    const x = obj.cords.x * cos - obj.cords.y * sin;
    const y = obj.cords.x * sin + obj.cords.y * cos;
    const size = Math.max(16, Math.min(64, 32 * zoom));

    ctx.drawImage(icon, x - size / 2, y - size / 2, size, size);
    ctx.fillStyle = "#fff";
    ctx.font = `${Math.floor(12 * zoom)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(obj.map_name, x, y + size / 2 + 12);
  }

  requestAnimationFrame(draw);
}

draw();

// Zoom handling
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const zoomFactor = 1.1;
  zoom *= e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
});

// Drag handling
canvas.addEventListener('mousedown', e => {
  drag = true;
  startX = e.clientX;
  startY = e.clientY;
});

canvas.addEventListener('mousemove', e => {
  if (!drag) return;
  offsetX += (e.clientX - startX);
  offsetY += (e.clientY - startY);
  startX = e.clientX;
  startY = e.clientY;
});

canvas.addEventListener('mouseup', () => drag = false);
canvas.addEventListener('mouseleave', () => drag = false);

// Resize
window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

// Loading overlay
function showLoading(state) {
  let el = document.getElementById('galaxy-loading');
  if (!el && state) {
    el = document.createElement('div');
    el.id = 'galaxy-loading';
    Object.assign(el.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.75)',
      color: '#fff',
      fontSize: '24px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    });
    el.innerText = 'Loading Galaxy...';
    document.body.appendChild(el);
  } else if (el && !state) {
    el.remove();
  }
}

// Fetching and processing map data
async function fetchGalaxyData() {
  showLoading(true);
  try {
    const response = await fetch(`https://hsmineword.github.io/elements.json?jam=${Math.random()}`, {
      cache: 'no-store'
    });
    const urls = await response.json();

    const objects = await Promise.all(urls.map(url => fetch(url).then(r => r.json())));
    processGalaxyObjects(objects);
  } catch (e) {
    console.error("Error loading galaxy data:", e);
  } finally {
    showLoading(false);
  }
}

function processGalaxyObjects(objects) {
  mapObjects.length = 0;
  objectIcons.clear();

  const anvils = {};
  const children = [];

  for (const obj of objects) {
    if (obj.map_is_anvil) {
      anvils[obj.map_constellation_id] = obj;
    } else {
      children.push(obj);
    }
  }

  for (const child of children) {
    const aid = child.map_constellation_id;
    const anvil = anvils[aid];
    if (anvil) {
      const blendFactor = 0.5 + Math.random() * 0.2;
      child.cords.x = anvil.cords.x + (child.cords.x - anvil.cords.x) * blendFactor;
      child.cords.y = anvil.cords.y + (child.cords.y - anvil.cords.y) * blendFactor;
    }
  }

  const allObjects = Object.values(anvils).concat(children);
  for (const obj of allObjects) {
    const icon = new Image();
    icon.src = obj.map_icon;
    objectIcons.set(obj.id, icon);
    mapObjects.push(obj);
  }
}

// Initial and periodic fetch
fetchGalaxyData();
setInterval(fetchGalaxyData, 60000);
