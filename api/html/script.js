const canvas = document.getElementById('galaxy');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

let zoom = 1;
let offsetX = 0, offsetY = 0;
let drag = false;
let startX, startY;

const stars = [];
const numStars = 5500;
const seed = Math.floor(Date.now() / 1000);
const starContainer = document.createElement('div');
starContainer.style.position = 'absolute';
starContainer.style.top = 0;
starContainer.style.left = 0;
starContainer.style.width = '100%';
starContainer.style.height = '100%';
starContainer.style.pointerEvents = 'none';
document.body.appendChild(starContainer);

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

const mapObjects = new Map();

function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
  ctx.scale(zoom, zoom);

  const time = Date.now() / 10000;
  const cos = Math.cos(time);
  const sin = Math.sin(time);

  for (const star of stars) {
    const x = star.x * cos - star.y * sin;
    const y = star.x * sin + star.y * cos;
    ctx.beginPath();
    ctx.arc(x, y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  for (const [id, obj] of mapObjects) {
    const x = obj._pos.x * cos - obj._pos.y * sin;
    const y = obj._pos.x * sin + obj._pos.y * cos;

    const screenX = x * zoom + width / 2 + offsetX;
    const screenY = y * zoom + height / 2 + offsetY;

      console.log(`[Draw] ${obj.map_name} at screen coords: (${screenX}, ${screenY})`);

    const el = obj._el;
    el.style.left = `${screenX}px`;
    el.style.top = `${screenY}px`;
    el.querySelector('img').style.transform = `scale(${Math.max(0.5, zoom)})`;
  }

  requestAnimationFrame();
}
draw();

// Zoom and pan
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const zoomFactor = 1.1;
  zoom *= e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
});
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
window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

// Galaxy loader
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

// Load embed renderer
function loadEmbedRenderer() {
  const s = document.createElement('script');
  s.src = `https://hsmineword.github.io/api/html/embed.js?jam=${Math.random()}`;
  s.async = true;
  document.head.appendChild(s);
}
loadEmbedRenderer();

// Load galaxy data
async function fetchGalaxyData() {
  showLoading(true);
  try {
    const res = await fetch(`https://hsmineword.github.io/elements.json?jam=${Math.random()}`, { cache: 'no-store' });
    const urls = await res.json();
    const jsonObjs = await Promise.all(urls.map(url => fetch(url).then(r => r.json())));
    updateGalaxyObjects(jsonObjs);
  } catch (e) {
    console.error("Galaxy data error:", e);
  } finally {
    showLoading(false);
  }
}

// Update visible map objects
function updateGalaxyObjects(objects) {
  const nextMap = new Map();
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
    const anvil = anvils[child.map_constellation_id];
    if (anvil) {
      const blend = 0.5 + Math.random() * 0.2;
      child.cords.x = anvil.cords.x + (child.cords.x - anvil.cords.x) * blend;
      child.cords.y = anvil.cords.y + (child.cords.y - anvil.cords.y) * blend;
    }
  }

  const all = [...Object.values(anvils), ...children];
  all.forEach(obj => {
    const el = mapObjects.has(obj.id) ? mapObjects.get(obj.id)._el : createMapElement(obj);
    obj._el = el;
    obj._pos = { x: obj.cords.x, y: obj.cords.y };
    nextMap.set(obj.id, obj);
  });

  // Clean up removed elements
  for (const [id, entry] of mapObjects) {
    if (!nextMap.has(id)) {
      entry._el.remove();
    }
  }

  // Replace map
  mapObjects.clear();
  for (const [id, entry] of nextMap) {
    mapObjects.set(id, entry);
  }
}

function createMapElement(obj) {
  console.log("[createMapElement] Creating element for:", obj.id, obj.map_name);

  const wrapper = document.createElement('div');
  wrapper.className = 'map-object';

  const img = document.createElement('img');
  img.src = obj.map_icon;
  img.width = 32;
  img.height = 32;
  img.onload = () => console.log(`[Image Loaded] ${obj.map_name}: ${obj.map_icon}`);
  img.onerror = () => console.warn(`[Image Error] ${obj.map_name}: ${obj.map_icon}`);
  wrapper.appendChild(img);

  const label = document.createElement('span');
  label.textContent = obj.map_name;
  wrapper.appendChild(label);

  wrapper.addEventListener('click', () => {
    const interactionData = obj.interaction_on_click?.data;
    console.log("[Wrapper Clicked] Embed data:", interactionData);

    if (window.createDiscordEmbed) {
      console.log("[Embed Renderer] Found. Rendering...");
      window.createDiscordEmbed(interactionData || {});
    } else {
      console.warn('[Embed Renderer] Not loaded yet.');
    }
  });

  // Add style to debug positioning
  wrapper.style.position = 'absolute';
  wrapper.style.border = '1px solid red';
  wrapper.style.zIndex = '100'; // Ensure it's not under canvas

  console.log("[createMapElement] Element created:", wrapper);
  return wrapper;
}



  
// Galaxy data fetching logic
function fetchGalaxyDataWrapper() {
  showLoading(true);

  fetch('https://hsmineword.github.io/elements.json?jam=' + Math.random(), { cache: 'no-store' })
    .then(res => res.json())
    .then(urls => Promise.all(urls.map(url => fetch(url).then(r => r.json()))))
    .then(jsonObjs => updateGalaxyObjects(jsonObjs))
    .catch(e => console.error("Galaxy data error:", e))
    .finally(() => showLoading(false));
}

// Start fetching immediately and set interval
function startGalaxyDataFetch() {
  fetchGalaxyDataWrapper();
  setInterval(fetchGalaxyDataWrapper, 60000); // every minute
}

startGalaxyDataFetch(); // Call once at start, end
