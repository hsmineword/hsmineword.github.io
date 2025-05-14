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

// Gradient for heatmap
function generateHeatmapGradient(objectsInConstellation) {
  console.log('Generating heatmap gradient for', objectsInConstellation.length, 'objects');

  // Simple linear gradient from orange to yellow for example
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#ff6600"); // start with red-orange
  gradient.addColorStop(1, "#ffff00"); // end with yellow
  
  console.log('Heatmap gradient generated');
  return gradient;
}

// This function draws the heatmap behind all the map objects
function drawHeatmap(objectsInConstellation) {
  if (objectsInConstellation.length === 0) return;

  console.log('Drawing heatmap for constellation with', objectsInConstellation.length, 'objects');

  // Set the gradient background for heatmap
  const gradient = generateHeatmapGradient(objectsInConstellation);
  ctx.fillStyle = gradient;

  // Create a large background box for the heatmap
  ctx.fillRect(0, 0, width, height);
}

// This function updates the objects and renders them on the canvas
function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height); // Clear canvas before redrawing

  // Calculate time-based rotation effect
  const time = Date.now() / 10000;
  const cos = Math.cos(time);
  const sin = Math.sin(time);

  // Draw heatmap first (background)
  drawHeatmap([...mapObjects.values()]); // Pass the objects in constellation

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
  for (const [id, obj] of mapObjects) {
    const x = obj._pos.x * cos - obj._pos.y * sin;
    const y = obj._pos.x * sin + obj._pos.y * cos;

    const screenX = x * zoom + width / 2 + offsetX;
    const screenY = y * zoom + height / 2 + offsetY;

    // Drawing map objects like planets, bases, etc.
    const el = obj._el;
    el.style.left = `${screenX}px`;
    el.style.top = `${screenY}px`;
    el.querySelector('img').style.transform = `scale(${Math.max(0.5, zoom)})`;
  }

  requestAnimationFrame(draw); // Continuously redraw
}

draw(); // Start the drawing loop

// Galaxy object creation log
function createMapElement(obj) {
  console.log('Creating element for:', obj.map_name);

  const wrapper = document.createElement('div');
  wrapper.className = 'map-object';
  wrapper.style.position = 'absolute';
  wrapper.style.zIndex = '100'; // Ensure it's above the heatmap

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

  // Save element to map for tracking
  mapObjects.set(obj.id, { _el: wrapper, ...obj });

  console.log("[createMapElement] Element created:", wrapper);
  document.body.appendChild(wrapper);  // Append to the body

  return wrapper;
}

// Galaxy data update
async function updateGalaxyObjects(objects) {
  const nextMap = new Map();
  const anvils = {};
  const children = [];

  console.log("[updateGalaxyObjects] Processing objects:", objects.length, "objects found");

  // Separate the objects into anvils and children
  for (const obj of objects) {
    if (obj.map_is_anvil) {
      anvils[obj.map_constellation_id] = obj;
    } else {
      children.push(obj);
    }
  }

  // Adjust child positions based on their anvil parent if necessary
  for (const child of children) {
    const anvil = anvils[child.map_constellation_id];
    if (anvil) {
      const blend = 0.5 + Math.random() * 0.2;
      child.cords.x = anvil.cords.x + (child.cords.x - anvil.cords.x) * blend;
      child.cords.y = anvil.cords.y + (child.cords.y - anvil.cords.y) * blend;
    }
  }

  // Combine all objects and update them
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
      console.log("[updateGalaxyObjects] Removing object from map:", entry._el);
      entry._el.remove();
    }
  }

  mapObjects.clear();
  for (const [id, entry] of nextMap) {
    mapObjects.set(id, entry);
  }

  console.log("[updateGalaxyObjects] Final map objects:", Array.from(mapObjects.keys()));
}

// Track map updates and objects
function fetchGalaxyDataWrapper() {
  showLoading(true);

  fetch('https://hsmineword.github.io/api/elements.json?jam=' + Math.random(), { cache: 'no-store' })
    .then(res => res.json())
    .then(urls => Promise.all(urls.map(url => fetch(url).then(r => r.json()))))
    .then(jsonObjs => updateGalaxyObjects(jsonObjs))
    .catch(e => console.error("Galaxy data error:", e))
    .finally(() => showLoading(false));
}

startGalaxyDataFetch(); // Start fetching immediately
