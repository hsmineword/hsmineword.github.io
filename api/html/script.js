const canvas = document.getElementById('galaxy');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const ORBIT_PERIOD_MS = 86400000;
let drawCount = 0;
let drawInterval;

let zoom = 0.10;
let offsetX = 0, offsetY = 0;
let drag = false;
let startX, startY;

const stars = [];
const numStars = 275000;
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
// const galaxySize = 90000; // or whatever value you want
x: (rand() - 0.5) * 90000,
y: (rand() - 0.5) * 90000,

    r: rand() * 1.5 + 0.5
  });
}

const mapObjects = new Map();

// === Optional: Chunk Overlay Loader ===
const loadchunks = false; //BROKEN!!!
let chunksOverlayReady = false;

function tryLoadChunkOverlayScript() {
  if (!loadchunks || chunksOverlayReady) return;

  const script = document.createElement('script');
  const jam = Math.random().toString(36).substring(2);
  script.src = `https://hsmineword.github.io/api/html/chunks.js?jam=${jam}`;
  script.async = true;

  script.onload = () => {
    console.log('[ChunkOverlay] chunks.js loaded successfully.');
    chunksOverlayReady = true;
  };

  script.onerror = () => {
    console.error('[ChunkOverlay] Failed to load chunks.js.');
  };

  document.head.appendChild(script);
}

tryLoadChunkOverlayScript(); // Trigger once



// ✅ Declare constants FIRST
// const ORBIT_PERIOD_MS = 86400000; // 24 hours

console.log("tetsing");

// ✅ Define the draw function AFTER constants
function draw() {
  const time = (Date.now() % ORBIT_PERIOD_MS) / ORBIT_PERIOD_MS * 2 * Math.PI;
  window._op_time = time;
  try {
    localStorage.setItem('_debug_time', time);
  } catch (e) {}

  const cos = Math.cos(time);
  const sin = Math.sin(time);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
  ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
  ctx.scale(zoom, zoom);

  for (const star of stars) {
    const x = star.x * cos - star.y * sin;
    const y = star.x * sin + star.y * cos;
    ctx.beginPath();
    ctx.arc(x, y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  for (const [, obj] of mapObjects) {
    const x = obj._pos.x * cos - obj._pos.y * sin;
    const y = obj._pos.x * sin + obj._pos.y * cos;

    const screenX = x * zoom + width / 2 + offsetX;
    const screenY = y * zoom + height / 2 + offsetY;

    const el = obj._el;
    el.style.left = `${screenX}px`;
    el.style.top = `${screenY}px`;
    el.querySelector('img').style.transform = `scale(${Math.max(0.5, zoom)})`;
  }

  try {
    if (typeof separateObjects === 'function') separateObjects();
  } catch (e) {}

  drawCount++;
  if (drawCount === 10) {
    clearInterval(drawInterval);
    drawInterval = setInterval(draw, 60000);
    console.log("[Draw] Switched to slow interval");
  }
}

// ✅ Start drawing AFTER everything is defined
drawInterval = setInterval(draw, 100);


// Zoom and pan
// canvas.addEventListener('wheel', e => {
//  e.preventDefault();
//  const zoomFactor = 1.1;
//  zoom *= e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
//});

canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const zoomFactor = 1.1;
  //const minZoom = 0.07;
  //const maxZoom = 1.210000000000005;
const minZoom = 0.00000000000000000000000000000007;
const maxZoom = 1.210000000000005;

  if (e.deltaY < 0) {
    zoom *= zoomFactor; // zoom in
  } else {
    zoom /= zoomFactor; // zoom out
  }

  // Clamp zoom between minZoom and maxZoom
  zoom = Math.min(maxZoom, Math.max(minZoom, zoom));

  console.log('Zoom:', zoom);
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
    const base64HTML = `
      data:text/html;base64,PHN0eWxlPgogICAgYm9keSB7CiAgICAgIG1hcmdpbjogMDsKICAgICAgYmFja2dyb3VuZC1jb2xvcjogYmxhY2s7CiAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgICBoZWlnaHQ6IDEwMHZoOwogICAgfQogICAgLnNwaW5uZXItY29udGFpbmVyIHsKICBwb3NpdGlvbjogcmVsYXRpdmU7CiAgZGlzcGxheTogZmxleDsKICBhbGlnbi1pdGVtczogY2VudGVyOwogIGp1c3RpZnktY29udGVudDogY2VudGVyOwogIGhlaWdodDogMTAwMDB2aDsgLyogb3IgdGhlIHNpemUgb2YgeW91ciBsb2FkaW5nIHNjcmVlbiAqLwp9CgogICAgLnNwaW5uZXIsCiAgICAuY29ubmVjdGlvbiB7CiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTsKICAgICAgdG9wOiA1MCU7CiAgICAgIGxlZnQ6IDUwJTsKICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7CiAgICB9CiAgICAuc3Bpbm5lciB7CiAgICAgIHdpZHRoOiA1MTJweDsKICAgICAgaGVpZ2h0OiA1MTJweDsKICAgICAgYW5pbWF0aW9uOiBzcGluIDJzIGxpbmVhciBpbmZpbml0ZTsKICAgIH0KICAgIC5jb25uZWN0aW9uIHsKICAgICAgd2lkdGg6IDgwcHg7CiAgICAgIGhlaWdodDogODBweDsKICAgICAgb3BhY2l0eTogMC44NTsKICAgIH0KCi5sb2FkaW5nIHsKICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgdG9wOiA1MCU7CiAgbGVmdDogNTAlOwogIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC00OTAlKTsKICBmb250LXNpemU6IDM0cHg7CiAgZm9udC13ZWlnaHQ6IGJvbGQ7CiAgYW5pbWF0aW9uOiB0ZXh0R3Vua21vdmUgMS41cyBsaW5lYXI7CiAgY29sb3I6IHdoaXRlOwogIHRleHQtYWxpZ246IGNlbnRlcjsKICB3aGl0ZS1zcGFjZTogbm93cmFwOyAvKiBwcmV2ZW50cyB3cmFwcGluZyAqLwogIHotaW5kZXg6IDEwOwp9CgogICAgQGtleWZyYW1lcyBzcGluIHsKICAgICAgZnJvbSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpIHJvdGF0ZSgwZGVnKTsgfQogICAgICB0byB7IHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpIHJvdGF0ZSgzNjBkZWcpOyB9CiAgICB9CiAgPC9zdHlsZT4KPC9oZWFkPgo8Ym9keT4KPGRpdiBjbGFzcz0ic3Bpbm5lci1jb250YWluZXIiPgo8ZGl2IGNsYXNzPSJsb2FkaW5nIj5Mb2FkaW5nIEdhbGFjdGljIG1hcDwvZGl2PgogIDxpbWcgY2xhc3M9InNwaW5uZXIiIHNyYz0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFnQUFBQUlBQ0FZQUFBRDBlTlQ2QUFBQUNYQklXWE1BQUE3RUFBQU94QUdWS3c0YkFBQVovRWxFUVZSNG5PM2RUYXRsVjVrSDhNY2dPS2hCSUNnT0FxTG1SU0hmSVEwZEt4cE1TakVZUkRJSUpNU09NWlVnTGRodGR3L1ViaWNxWlY3VURsRURTaE9VZ0lrVktxbEtCUDBPZ3Fra0U4R0JLSUtEREp6RVhnL25iT3FtY3U2dGU4NVplNStYNS9lRGgyU1FXamZjMm12di8xNXYrOTMvK01jL0FnQ281ZDBCQUpRakFBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FBQkFRUUlBQUJRa0FNQTRybTkxMjd6T3RYb3NXTWIzV3QwUXM5OWQxdXNCZENVQVFEODN0dnA0WEhyd0Q0Wi9Gd0tPSngvK3ArZi9Qdnp1aGlEd1VxdUxBYXhOQUlEMW5HaDFzdFd0ODdydWtQL3UwVlp2dFhvaU9Nci94S1dILzBGRHFIcWoxZmw1WFdqMVpnQXJFUUJnTmNNUS8rMHhlL0FmeCtPdHJnb2pBWWQ1cU5XL1hlRy95WUQxd0x3eUJKd05Vd1N3RWdFQWx2T0p1UFEyZXNNS2Z6NUhBbDVyOVdKd1VENzhIMTN5end5akx2bjdIS1lJL0Y3aG1BUUFPSjU3WXZiUXY2dERXK2ZtYlhsWXpXU29XdmJoZjlBTjg4cXBnNS9IN1BmN2RBQkhFZ0RnYVBlMStseXJXenEzbXcrcGYycjEyNmp0bjJQMnUramxybm5kM2VxWlZrOEZzSkFBQUl2bGtQVGxxL2w3KzAwd2xsdm05Wm13RFJNV0VnRGc3YVo0OERPZDI4SjVETENRQUFBem4yeDFmNnRUd1Q0YVFzREhXajNaNm9XQTRnUUFxc3M5L0o5cTlXQlF3YWw1NVhrTXo4WHNMQUVvU1FDZ3F0ekhuOFA5ZDdhNk5xZ21BOStuV3owYnMya0I1d2hRamdCQVJRL05hNVY5L095UERINjVkVENuQmg0TDZ3TW9SZ0Nna2p3MDVwR3d3SSszeXlDWTV4RGtkWEVtWmljTXd0NFRBS2hnT0xiWFd6OUh5V3NrcjVVY0NYQzhNSHRQQUdEZjVTbHp3ekR2dG5CMDdTWHJIcTNjMnpBYWNHNyt6K3AvUCt3eEFZQjl0VzF2L1I3Nmk3MDRyNGRqdThLQTBRRDJuZ0RBUHRxV3QvNzhWRzBlOVRzOCtEMUVqamFFZ1h6b0RrSGc1cGg5Y25rVGpBYXcxd1FBOWsxdTc4cFB4ZDYwd2Y4SGIvdnJ5YUEwck1yZmhsR0IvTmtmaU5tbmlKOEkyQk1DQVB0aTJOZC9lb1AvRCtmQzIzNXZpMFlGTmpHeWs0SHk4VlkzaG5NRDJCTUNBUHRnMDBQK2hvakhkL21vd0tiK3Z2UG5EbE1EL3I3WmFRSUF1MjVUaC9yOHJkVXZZbmFTbkFmQnRJWlJnUXdDZVpMaloxdGRQZUhQUDdoQTBPRkI3Q3dCZ0YzMnZWYjN4clNMeFA0YXM0L0p2TnpxbFdDVGhpRHdUTXcrOHBNZmM3cG1vcCtkZ2ZOYk1Rc0NEd2ZzSUFHQVhiU3ArZjRjOW4wK1BQaTN6U3Z6eWxDV0gvcVo2cm80Y2VCbldSZkF6aEVBMkRXYm1QODF4NzhiaGlDUWYxOVRYaVBXQmJDVEJBQjJTWDYyOXdzeDNZMDlQeFg3cXpEUHUydUdxWUVjSmJvalpwOThIdHR3VGI0blpwOFpocTBuQUxBcnBsenNsL3Y0blFDMys0YS93NmxPaEJ3V0IzNGdoRVoyZ0FEQUxwank0Wi9EdU9aejk4ZXdmVENEd0JUclJtNlkvNXdJSVlBdEp3Q3c3ZkptK3VnRVA4YzgvMzdMSUpDcjlhZFlIekNzQjBoQ0FGdExBR0NiL1VlcmI0ejhNNFpqZTczMTE1QUJMLytlTTFpT2ZieHdob0E4bitDYkFWdElBR0JiNVI3L3NZZHI4OEgvL1ZabmcwcUcwWUJjNVBuRkdIYzBJQVBzKzhKWkFXd2hBWUJ0TlBiRDMxcy9LWVBmNzJQODBZRGhXaFlDMkNvQ0FOdG03SWUvdVg0T21tcHRnQkRBMWhFQTJDWTU1ei9td3o4LzVYb212UFh6VHNQYWdFZGk5a25wTWVTMS9lZXdKb0F0SVFDd0xYSVlkcXdGZjhPK2ZpdXlPVW9HZ0MrMWVqWEcyM2FhMTNoK1NNcTF5TVlKQUd5RE1iZjZHZkpuV2Zsd3p0QTQxcFNBTFlKc0JRR0FUUnNPK1JuREQxcDlOd3o1czd4aFN1RExyUjRZb1gySEJiRnhBZ0NibEdmN2p6WFUrcSt0ZnRqcXpZRFZaQUQ0U3FzM1duMjdjOXZEaVlGL0NOOE9ZRU1FQURZbHYrcVhIL2JwL2ZEUGJWMy8zZXBuQWV2TEFQbWRWbjlxOWJWV0grM1lkbDc3MlFmK0hxYW8yQUFCZ0UzSUQ2YU1NYithOC8zL0Z4Nys5RGRjVTUrUHZ0ZnQwTmJyWWFxS2lRa0FiTUp3OEVwUEZ2c3h0Z3dCZjVuL2UrOFFrSDNDR1FGTVNnQmdhbU1jOU9NTGZremw0TGNFZWw3SERncGljZ0lBVThxYjVyMmQyM3c4Wmdlci9EbGdHaGtBOHBxN0ttYm5CdlJ5YjF6NmZER01UZ0JnS3Jub0x3UEFpWTV0NXB1L2h6K2JrTmZjMTF1OUZmMUdBckp2WkIvSk13aE1aVEU2QVlBcERJditlcTc0SHo3bTQrSFBwdVMxbDlkZ1h0ZTkxZ1JrVzlsWExBcGtkQUlBVStpOTZHOVk4T2NHeWFibE5UaWM3TmZyR3Jjb2tFa0lBSXd0UDZ6U2M3RlU3dlBQclg2R1NOa1dlUzIrdDlXSG90ODVBZGxuTHNic0ExWXdDZ0dBTWVXOGYrOWpWQjN5d3pZYXJzbWZkbXd6KzA2ZVFpanNNZ29CZ0xFTTgvNDNkV3d6ai9mMThHZGI1Ylg1L3VoM2JIRDJIZXNCR0kwQXdGaHVpNzd6L3ZsaG54OEdiTGU4UnErTGZpTmZReit5TlpEdUJBREdNR3o1NnlVWC9lVlgvWHpZaDIyWDEyaGVxeCtNZmdIWTFrQkdJUURRVys4dGYzbmpzK0tmWFRMc0RNaSswS01mMkJySUtBUUFldXM5OUo5RG45NTgyRFY1emVhMSsyajBZU3FBN2dRQWVybzErZzc5NXhZb056eDJWVjY3SDRuWlZ0Z2VzbSs5MnVwOFFBY0NBRDA5RXYyRy9uUGUvMHpBYnN0citNUFJaMVFzKzFiMk1RR0FMZ1FBZXVsNTJwOTVmL1pGNy9VQXd5bUJSc1pZbXdCQUQzbHo2NzNxMzd3Lyt5S3Y1YnltZTQyT1BUUnZUMEJtTFFJQVBlUU5xZWZRdjdjYjlrM1Bqd1psTzc0VndOb0VBTloxc3RXZG5kcktvZi92aHpjYjlrOWUwM2x0OTVvS3lENTN0dFdGZ0JVSkFLenJVNjJ1N2RSV3Z2MmZEZGhQZVcxbllPNFJBTExQWmQ4VEFGaVpBTUE2UGhuOXRqZ1orcWVDbmxNQjJmZXkzN3dRc0FJQmdIWGMzN0V0cS82cFlOZ1YwR3ZIVFBaQkFZQ1ZDQUNzS2hjaG5lclVWdDRRcmZxbmlyelc4NW8vM2FHdDdJTzJCYklTQVlCVjlkeno3K1pGTlhuTlp4L3FkVGFBUHNUU0JBQlcwZlBRbjd4eEdmcW5tcnptZTMwcndPRkFyRVFBWUJXOUh2NjVndmxjUUUxNTdXY2ZPTm1oTGFNQUxFMEFZRm4zUmI4QThLdnc5azlkZWUxbkgrZ1ZBTEp2UGhWd1RBSUF5L3BjcDNacys0Tkxhd0Y2aE9yc213SUF4eVlBc0l4N1d0M1NxYTFlMzBtSFhkZHJXMkQyelh0YVBSMXdEQUlBeStnMTlHL2JIMXpTYzF0Zzl0R25BNDVCQU9DNFB0SHFyZzd0L0xYVjh3RWNsSDNpN2xiWHJObE85dEdmaElETk1RZ0FIRmV2dC84blc3MFN3RUhaSjdKdmZMVkRXOWxYQlFDdVNBRGdPUElMWmowQ3dOOWF2UnpBSXRrM0htaDE5WnJ0REZzQzdiRGhTQUlBeDlIcnhMSmZoTGQvT0V6Mmpld2o5NjNaenZDeElidHNPSklBd0pXY2FIVjdwN2FlRGVBbzJVZldEUUFwKyt5UFc3MFpjQWdCZ0N2SlEwcHU3ZEJPN3ZzM0x3bEh5ejZTZldYZEtiZnNzOWwzZnhsd0NBR0FLK254OEUvMi9jUHg5RG9YSVB1dUFNQ2hCQUNPY21ONCs0ZXA5UndGeUQ1OE1XQUJBWUNqZkx6VmRSM2E4Y0VmV0U2UEFKQjlOL3V3QU1CQ0FnQkg2VEVNK1ZvSUFMQ3M3RFBaZDliZGZXTTNBSWNTQURoTXI3My9lU096SHhtV2szMG0rMDZQQUhCOTZJTXNJQUJ3bUI0UC85eUM1TzBmVnBOOTU5NlliY1ZkaDFFQUZoSUFPRXlQQVBEYnNQZ1BWcFY5Si92UXVuMVJBR0FoQVlCRmVnNy9BNnZyc1JqUU5BQUxDUUFzWXZFZmJBZUxBUm1OQU1BaUZ2L0JkdWk1R0ZBQTRHMEVBQmE1dmtNYjN2NmhqK3hMcDlkczQvb3dEY0JsQkFBV1dmZHRJNGNzTGY2RFBySXZyVHNOa0g5V0FPQnRCQUFXZVZjQTIrVEdnTTRFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBQUFnSUlFQUFBb1NBRGdjcDlvZFc3Tk5sNXJkV01BdlZ4c2RjT2FiYndyNEFBQmdNdTlIck1IK0RvM20veXpHU1JlREdCZDJaZldmZmkvRm5BWkFZREx2VDZ2ZFc4NHQ0VUFBRDNjMXFHTjF3TXVJd0N3U0U0QnJIdlR5VC8vV0xqeHdEcXVqejRCWU4xcFBmYVFBTUFpUFc0V09ZSXdoQUJnTmRtSDFoMk5Td0lBN3lBQXNFaSt0ZmNjQlFCVzArdnQzMGdjN3lBQWNKZ2VBZURtc0JnUVZwVjk1K1lPN1hqN1p5RUJnTVAwdUdtY0NJc0JZVlhaZDA1MGFFY0FZQ0VCZ01QMG5nWXdCQW5IMTNQeG43N0hRZ0lBUitrUkFDd0doT1ZaL01mb0JBQ084bEtyTjFwZHQyWTdBZ0FzcDhmYmYvYmRsd0lPSVFCd2xEeCs5SHlyQjlac0oyOW1GZ1BDOFdSZjZSRUFzdTllRERpRUFNQ1Y5QWdBNlhRSUFIQWNwenUxY3o3Z0NBSUFWM0loWmplU1c5ZHN4eWdBWEZuUHQvOExBVWNRQUxpU04xdWRqZlVEUUxvekJBQTR5cDJkMnNrKysyYkFFUVFBamlOWEVxLzdoY0QwMlZiUHRIb2xnTXZkRXJNK3NxN3NxMWIvYzBVQ0FNY3huQW13YmdDNHV0WEhRZ0NBUmJKdlhOMmhIWHYvT1JZQmdPUEttMHFQeFVuM3QzbzVoQUE0S04vKzcrL1VscmQvamtVQTRMaHk3djducmU1YXM1MXJXcDBLQVFBT3lqNXhUWWQyc285YVo4T3hDQUFzSTk4czFnMEE2ZlM4TFRjcW1LMzg3N1gxejlzL3h5WUFzSXluVzkwZHMrSEtkVGtYQUdaNlBmeHpWTzNwZ0dNU0FGaFdydUx2RVFCeXIvTkQ0WWhnYXNzKzBHUGZmM29tWUFrQ0FNdDZxdFZub3M5TjY0NndZcG02OG90L2QzUnFLL3ZSVXdGTEVBQllSWSt2QkthVDRVTkIxSlhYL3NsT2JabjdaMmtDQUt2SUIvWnQwU2NFNUJDb1VRQ3F5YmYvaHpxMWxmMUhpR1pwQWdDcjZqVUtrSWNMNVkzdzRZQTY4cHBmOTJDdGdiZC9WaUlBc0twODQ4aVR5MDUxYU11MlFDcnB1ZTN2K2ZEMno0b0VBTmJ4WlBRSkFDbHZpSytIcVFEMld3Nzk5M3I0cHljRFZpUUFzSTRYV2ozUjZzRU9iUTNiQWswRnNNOTZidnZMdnZkQ3dJb0VBTmIxWEt0UHQ3cTJRMXQ1WTh4dm1KOE4yRCszUjcrSC94OWoxdmRnWlFJQTY4b0g5clBSWjFnekYwVjlzZFh2dzFRQSt5V0gvdlBhN3JYd0wvdmNoWUExQ0FEME1Hd0w3SEZ6TXhYQVB1bzU5UDlhV1BoSEJ3SUFQZVRiZXQ2UUh1M1VYdDRvN1FwZ1grU3EvMTRQLzVSOXpRZ1pheE1BNktYbjRVQTVrbUJYQVB0Z1dQWGZjOCsvdDMrNkVBRG82VXpNYm5pOXBnSWVhZldsZ04yVjEzRFBvZjh6QVowSUFQUjBQdnBPQmVUMndsZkRHdys3S2VmOWUyeVJIV1EvT0IvUWlRQkFiK2VpM3pIQktXK2krZVpqUFFDN0pPZjllNTMxbjRaK0JkMElBUFNXYy9ZNUF0QnJLc0I2QUhaTjczbi9ETURacDF6L2RDVUFNSVo4VysrOUsrRExyYjdTNnMyQTdYVWladGRxNzFYL1JzRG9UZ0JnTEwybkFoNW85VWFyN3dSc3IzK0oyYlhhaTZGL1JpTUFNSlpoS3VBRHJXN3ExT2EzVy8ycDFjOEN0cy9kTWJ0R2UvbGRHUHBuUkFJQVk4cGh5K3RhUGQ2eHphL04veWtFc0UzeTRmKzE2T3NIWWVpZkVRa0FqQzIvV0haajlQc0U2a2RiZmI3Vlg4TE5rZTJRSy83em12eG94emJ6emYrSmdCRUpBRXdoRnpIbGl1aGU2d0dHZHV3TVlOT0dGZjg5Ri8wNTdZOUpDQUJNb2ZmV3dEUjhOT2licmY0Y01MMzNSZCtQL0NSYi9waU1BTUJVaHEyQjM0clpWcWtlOHMzcnFsWmZEeUdBYWVYRC83K2k3MUhWdWNYVmxqOG1Jd0F3cGJ5NURVT212ZVFOK0szd2hUU21rOWR3dnZuMy9rN0ZqOExRUHhNU0FKamF3L04vOWd3Qnc2bHJPWFRxN1lreDVZSy8zblArS2EvZGh3TW1KQUN3Q2IwWEJjYUJ0dDRidGdneWp0enFsNnY5ZXovOExmcGpJd1FBTm1GWUZKaDZoNEFQemY5ZENLQ25ZWjkvejYxK0tSLytGdjJ4RVFJQW01SkQ5ZStKdmpzRFV0NmdmOXJxL2ExK0dMNGR3SHB5d1dvZTc5dnpoTDlCcnZqLzN6QnR4WVlJQUd6U2N6RTdLamdYVlBVTUFTbHYySGtLNFhmRDJ4V3J5WENhSC9icGViYi9JQi8rT2V6L1hNQ0dDQUJzMmpEMzJldkxnUWZsamZ1RFlYRWd5eHRyc2QvZ3NURHZ6NFlKQUd5RE1VTkEzc0N2RHpkY2p1K2hHR2RVYXBEQndyWEl4Z2tBYkl1OElWN2Q2aHNqdEQxc0VmeElxek5oU29ERk1pZyswdXJCRVgvR2Y0YUhQMXRDQUdDYjVMRytlY0phenpNQ0Rzb2IrNGZEbEFEdk5QYVFmOHJyN3BzQlcwSUFZTnVNY1ZEUVFjT1V3TEQzMm1oQWJjT3BmbmxkakRYa254ejB3OVlSQU5oR1k0ZUFHdzdVOTF1ZERTcTZ2ZFVYWTl5My91VGh6MVlTQU5oV2VjUE1EL3lNc1NaZ01Jd0duQXlqQVpWTTlkYWZjczdmc0Q5YlNRQmdtK1dOODI4eHp1NkF3Y0hSQUdzRDl0OFVjLzBEcS8zWmFnSUEyMjY0Z1k2NUxTdmROcTlIdzJqQVBocmUrc2VhVmpwb09PVEh3NSt0SmdDd0M2WUtBV2w0Tzh5Zm1Rc0ZCWUhkbGcvKy9QdWM0dHBKSHY3c0RBR0FYWkUzMUQrMCtrS01QM3c3VEFkY2FQV3JjRFBmVmZuUXZ5Tm1henlta0lFeHovWjN2Qzg3UVFCZ2wrU045ZS96ZjU5aUR2Zmt2SWFwQWVzRGRzT1U4L3lENGF0K3JoRjJoZ0RBcnNrYmJBN0xUeldmbXc2dUQzaSsxU3ZCTnJxbDFhbVk3cm9ZV0RmQ1RoSUEyRVY1b3gzMlZkOGJzMCsyVGlFZkxQbGQrQ2RidlJ5Q3dMYklCLy9IV3QzZjZwb0pmMjUrYXZwSFlZOC9PMG9BWUpmbGpYY1lEWmhpZ1ZmS0I4eFhZL2Fsd1YrMGVqWU0rMjVLRHZYZjJlcXpNZnVPeEpRczltUG5DUURzdXJ3QjU4MTQ2am5mZk9EY055L3p2OVBheEJ6L1FmNisyUXNDQVB0Z0Urc0NEaHJXQ0p3N1VPYUQreHEyOHcyMUtlYjcyUnNDQVB0aVdCZHdNV2JEOHpkdDRQOWhlRGpsaU1RUUJMd2xyaWZmOW9mZjYxVFRQSXY4cnRVUFdqMFJzQ2NFQVBaTjNxRGZpTTBPRVE5SEMrY0N4ZCtHVVlGbEhYemJ2em1tVytSNUdFUCs3Q1VCZ0gwMFRBbE1lUUxjSWlmQ3FNQXl0dVZ0ZnpBczlCUGUyRXNDQVBzcWI5aWJXaUM0eURBcWtQOHZ3c0FsMi9iUUgzanJaKzhKQU95N2JSa05PT2hnR0dDN2VPdW5EQUdBQ29iUmdGZGJQUktiSHcxZ08rVkQvMHlyOHdFRkNBQlVjbjVlRDhYMmpBYXdlUTcxb1NRQmdJcUdJZDRNQVhtUzNMVkJSWCtNMlVtTzl2VlRrZ0JBVmNPNUFXZGJmYXJWZzBFbHVWMDB2eTU1SWFBb0FZRHFMc3dyUndUeVl6S25nbjJXWDNQTWp6bTlFRkNjQUFBekw4d3Jwd1UyZmR3cy9RM2JMczN6dzV3QUFHODNMQVlUQlBhREJ6OGNRZ0NBeFlZZ2tGLzcrMXpNdmpuZlc3YjU2Nmd0ai9yOXpRanR2dExxbVZaUEJiQ1FBQUJIZTJwZTk4UnNOT0N1VHUxbVc5VWYvaW0vbFRCOFNiR0huOC9iZWpxQUl3a0FjRHhQeitzbnNmN1J0WGtDb0NObUw4bmZ4VG9od05IS3NBSUJBSmJ6NHJ4eWVpQWZXcmUzdW5XSlAzODZ6RWN2a3IvVC9OMDh1c1NmeVVPZGNodW5ZM3RoQlFJQXJHWTRYdmpIclU3R0xBUmtYWGZFbi9sV2VQZ2ZKWDgzYjdWNi9Jai9Kai8xUEp6b21OczMzd3hnSlFJQXJDY2ZRTCtjMTQydFBoNkxkdy9rbSsyL0IxZVNCL1JjRmU4Y0NSaUcrRjlxZFRHQXRRa0EwTS9GZWVXYjdQVnhLUWprSFBYRHdYRU5veVREdWdCRC9EQUNBUURHTVV3UkdQSmZqZDhkakV3QUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0NCQUFBS0VnQUFJQ0MvaDl1OS9SbjJCM2E5UUFBQUFCSlJVNUVya0pnZ2c9PSIgYWx0PSJMb2FkaW5nLi4uIiAvPgogIDxpbWcgY2xhc3M9ImNvbm5lY3Rpb24iIHNyYz0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFFZ0FBQUExQ0FZQUFBRGlVYTFZQUFBQUNYQklXWE1BQUE3RUFBQU94QUdWS3c0YkFBQUl6a2xFUVZSNG5OMmJDYXlkUlJYSC82MkZXdFBVb3RaYWtLVVNGN1NpYUFEWkpiVzJhdHhRS3k2NElnVU1pOG9hV3FrN2NZOExBVVVGTkJxczRsTGpRa1dEaW9KTkZhVVNFSkZIUUJBb1Myb2pJRWc5djg2WnZ1Kzkzamt6eUx2bHZ2ZFBUdWZyZmZQTm5QTy9NMmZPbkprN1plUEdqV3JFWVNaZjE4UkFzeTFUR2hzODArUW9reU5NRnBqY3EvR0pSNXVzTXRuZlpCK1RvMnN2dEJEMFBpVnl3SHFOWDNJQXVxLzNaMnk2enVSVDBRczFndWFiZk1LZi8yTHlNbzEvWU1OYWsyY3AyWGFGeWNXbHloRkJNMHgrYURMSjVKOG16OVBFQWJZTW1jd3hXV255SkEyUHJCR0lDTHJVNURFbUQ1anNhL0lmVFJ4Z0N6N29ieWJUbEd4OWRxK0tKWUtPTVpubnp6am02NFBPZGpCNTBPUVdEUmF3N1lIZzd6ZVlIRzV5cnBLdHg1cDhybGNqbzhHbytiZy8vOGJrYTBFbnp6RDVnOHYrR2l4OHgrUWtrNzhHZGM1VElnbmRzZmtjazM5M0svUWk2QUtsNVJEMlh4NDBQdE5rdGRJUWZiN0o0MHp1MUNPUHlVbzJ2Rkpwa2RuUjVPNmdQamJlWmpMVjN4dGg4MmlDZHRid1N2WFJTc09YbTB3MythL0pnUm9NY2dEVC9ReVRWeXZwZDVuU1NDOEJHN0gxZENYYmNkeWIzY1ZvZ3M1WFdyWCs1UytVOEJtVHAva3pVZWxxRFJiV0tPbjFUWk9uSytuN25xRCtjcFBqbEdiRlYweGVtdi9RSllncGt2M0lwNFBHR0xMSCt2TzNUYjZsd1FSNnZjcGtzWksrN0FhdURlcC9VTW51aGVxNGl5NUJCRTNNMzN1OGNna3J2UjVEOHcwYWJLRGZpNVZHeG9VcUxPVU9SdGxIbEh6cXgweVc4R0dYb05kNnVVSnBIdmZDQzB5ZTQ4OXZEK3AxZ1hKM3F6K290WTErNlBrOXBhV2NlTzYzUVgxc2Y0c1NGeU1JNHNVWi9ueEswTUNYdlJ3eStiN3F1RWpKVWU2ci91REhKaHVVUmtrSjZEbGtzb3ZKMllwSEViWkRFRk5zVDVQVm1hQ1R2YnhKNVlCdnJvYUR4OGpoWlh4QmFlY1BXSEovb0xFRmJlN2p6L2lYYUdkK3ZCSlI2TCtyMGlhMUY3QWREcDVzc3BRK01rSDdlYmt5Nk9RTUwrOVNmZlFjMUZHWWxYR3N5WkczU2FEM1ZwTWpsV0tZUzRLNjZMMmQwcEwrK2txNzc1WnpBa0ZNZ2NmN0g4OE1YbHpvNVhmcnVtK2F5NFFMUTBvRzlBdHZVL295ZHZFK254alVSVytpNW9XS0FRY1FCQ2ZUSVdpeC80RU4zTnJDUzNUOFdIK09Wamg1NDdOTVNGVytSUDBIZlZ6bGZkTDNGd3YxMEJ1Q3NBTjdiaXZVb3kyNDJOWmtNUVJsUDNGVG9NUVNMM0dJTjFZVVh1Ymx6MDJ1VnY5eHRmZTF3UHN1RVlUZTZNK013WjRQQlcxU0YxKzFBSUt5NDcwcWVHRytsMnNWZzdabSsvTVN0UU5sK2Zabit2OVp1ait2T0pydmdyNys3bjNQQy9Ua2MwS1YrWW9KZ2dzSW1qZEZ3d1pkR2J3dzE4cy9WUlROcTl2TmlsTWtYWkF4MkcvVVp6alQ5eXNaMHBJbHVONzczTjUxZUdlaEh0bERDSnFyR05qSnBuVTJCT1g0SnlKb2xwZVhWeG8reU10TDFJWVBhRXR5dXVCdmZOUExWTWN2VGQ3VTBhRVhmcSswNHMxU2pEeWJaa0RRTnY2ZnlMZE05WEpOcGVFNVh2NUViVGltb1E1VHI0V2dueWtSTkNlb2svV2ZxaGlaaTIwZ2FMTC81OWJnaFVsZTNseHBlSnFYbDZrTk0rdFZtdXAwKzV3VzFNbjZUMUtNek1YazdsNHNTcG5tQnRkVkdzNzFydFhXUis0ek1uNWRReDJ3ZWJCMENkb1F2TERSRzQzaWgvOEhyRmJiTmRRWkt6ekJ5K2JqNUM1Qkl6SnBvNUFKWXBXSUNNcjFucXEyVVVUTXNyU2hUZ3QyN2VoUXd2WU5kVUJlMlRjUlJFcGdzbjlZSXVnK3BibE5qSEZGMERDNUpKTCtMS1V0Qk9GOEQxWjVKYnRVYlE0YTVJM3JQVUdkM2IyOHI5SldKdWhCQ0NLc0prbS9tOHJHTTJySVYrOWw4bzJnWVFqbW0yUy8wM3JSZ1RqbncwcWIyenpkMkZneWNsckpBWXM2T3BTd2w1YzFON0dqbC9kREVQbG5DQ0pQVWtxZkRpa1J0R2VsNFY4cEVYU3dIaHFXcWo3VmFuaGhSNGNTc3Y2MUlEYm5qTlpERUI2YndHbjNjdjFOZXgwQ3NIbUs4Vm1sREI1emZhN2FvK21IQy9yYW9hTkRDVm4vVlpYMk1rRzNRdEJhZjNHMzRJVXZLVVcwYlBRWWZxV2c4czhtdHlzUmZwYnFxWVd4d2xsZTN1NDY5QUo2VC9mbmN5cnRQZFBMS3lHSXRPaWhTbG0wRXBpekxMY0ViY3RWM3VzQWlPUUlsOTExNjJyMmNFQWZMK3IwWGNKeUw3R2o1b015RjZzZ2lFVFRWNVh5SDlGT21PMERwd1NIS0NhSVhUak9sVkZFK1A4VTlSZm94U3E4enZzdTRSQXZmMXBwRHc2MjllY1ZFRVNBZUlkU0JvM0RzM2NWWGp4VmlhQ1ozdG1GUVNla05MbHpnMjlnT0IrdS9vQzJjL3h6YUZBUGZmT1dKVHFVQUhsL0NDY2JjcUNJNStlb2RwSEs0RFlFYVFDT2ZUaGdpd2hpWjgwSkFqdG5SaHVyNDhVYVd5elQ4RWcrdTlKK1BnakZQOTFRYVRlZnF2NmFmekpCekYwSVl1NUZFVFdKS1RhRkxQbU1wdWhVbFN0dWZMc0VaV05ORHVBV3h2MUtLWmdqZzNxTTVwMzkrWWhLbTlpZS9RK3gyV2FDL3FnMGg5bXJjQTNrc0VJREtKTkhFU3NiL2l1Nmc4TjUxWFQxQjl3dDVGcGc1Rk93TDY5WTZGM0xaK1ZyUDB5dk5ibUJETzdUOEUyOFJ1a2tvblJxeXQrNWM0UGhGL2ovSTJ4US8xQnp1SXh3OU1TV21wN3ExRm1SUCtnU2RKclNFR1RQZGJySytXQU8zWmpUSnlnNXZ6Y3IzbjQ4VW5pamhvL1QwZmM2eGVBMkw3WkQ1bW41d3k1QjNHYkF1WklIZnEvaWhQbUpTczZNZ09wY2syczBXRmRnMkZLYzc4K2tUMDlzZUNmdit6ak8zbnpYYWZUOUlMWUplSG1HSmZuaWlLUzlsWnc1ZFZrRjk5RFdPZWFwZ1h0TDZQTW9wZW05ZDhNNzJNcDVHV21RRVNISmFJTFlRbkQ4L0FxbGVBRkgyUE42ckhmT04wVUdnTTN1Q2VwZnZOTUtBa2F1c2FBUHF5ZjYxWHdnaHhZNU5zTDJFYW5uWG5jVVdSYnY4azUrcEhTOXJnUkdEQ2tFRXVzUDVSeXNYOEIvdkVQcFpoaytwV1ZFWXlPUk03Znd0eml6NzBYUXZkNDQrWmdEbEZhMDg0SU9DTDZPMHVDQUVjQStzT1h1RXJZZDRNL01nQzErWmxHNko1MS92TUsraER0QnYxQjhMTlNpek5aRWl6N3M3dk45Si9hZlBWTzcwVTE3OGovL1VKcHFyRkE3YWVMY3RtZEtZUk5uZ295YVlvSXZJb2lsamt0S0JHUGthSWxDOTlERXdPK1ViR0xWd3NiaWNWYnQxejdraW9naFBtbnlYQ1d5Rm1sOGcyeGkvbUVPdGwwVVZXNzV2UmhML1d4dmJEei9WZ3dRUE9ia0dsOTYrRnN4MFBxTFEzN3p3TzNRbG91Ymd3eHNlSjNTL2U2VzZMcVpJRERleVFIa3JrbTlOS2VCL3dlalk4ZldPUTl3SGdBQUFBQkpSVTVFcmtKZ2dnPT0iIGFsdD0iQ29ubmVjdGluZy4uLiIgLz4KPC9kaXY+`;

    el = document.createElement('iframe');
    el.id = 'galaxy-loading';
    Object.assign(el.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      border: 'none',
      zIndex: 1000
    });
    el.src = base64HTML.trim();

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
    const res = await fetch(`https://hsmineword.github.io/api/elements.json?jam=${Math.random()}`, { cache: 'no-store' });
    const urls = await res.json();
    const jsonObjs = await Promise.all(urls.map(url => fetch(url).then(r => r.json())));
    updateGalaxyObjects(jsonObjs);
  } catch (e) {
    console.error("Galaxy data error:", e);
  } finally {
    showLoading(false);
  }
}


// Galaxy object creation log
function createMapElement(obj) {
  console.log('Creating element for:', obj.map_name);



  const wrapper = document.createElement('div');
  wrapper.className = 'map-object';
  wrapper.style.position = 'absolute';
  // wrapper.style.border = '1px solid red'; // outline for planets
  wrapper.style.zIndex = '100'; // Ensure it's not under canvas

  wrapper.setAttribute('custompayload', JSON.stringify(obj));
  

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

  // Save element to map for tracking
  mapObjects.set(obj.id, { _el: wrapper, ...obj });

  console.log("[createMapElement] Element created:", wrapper);
  console.log('Element created:', wrapper);
document.body.appendChild(wrapper);  // Append to the body if it's not added elsewhere

  return wrapper;
}

// Track map updates and objects
function updateGalaxyObjects(objects) {
  const nextMap = new Map();
  const anvils = {};
  const children = [];

  console.log("[updateGalaxyObjects] Processing objects:", objects.length, "objects found");

  for (const obj of objects) {
    console.log("[updateGalaxyObjects] Processing object:", obj.map_name);

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
  console.log("[updateGalaxyObjects] Total objects to update:", all.length);

  all.forEach(obj => {
    const el = mapObjects.has(obj.id) ? mapObjects.get(obj.id)._el : createMapElement(obj);
    obj._el = el;
    obj._pos = { x: obj.cords.x, y: obj.cords.y };
    nextMap.set(obj.id, obj);
  });

  // Debug: Check mapObjects before cleanup
  console.log("[updateGalaxyObjects] Map objects before cleanup:", Array.from(mapObjects.keys()));

  // Clean up removed elements
  for (const [id, entry] of mapObjects) {
    if (!nextMap.has(id)) {
      console.log("[updateGalaxyObjects] Removing object from map:", entry._el);
      entry._el.remove();
    }
  }

  // Debug: Check mapObjects after cleanup
  console.log("[updateGalaxyObjects] Map objects after cleanup:", Array.from(nextMap.keys()));

  // Replace map
  mapObjects.clear();
  for (const [id, entry] of nextMap) {
    mapObjects.set(id, entry);
  }

  console.log("[updateGalaxyObjects] Final map objects:", Array.from(mapObjects.keys()));
}

// Track each draw cycle and object placement
// … all your setup (stars, mapObjects, zoom/pan handlers, etc.) goes here …

// const ORBIT_PERIOD_MS = 86400000; // 24h
// let drawCount = 0;
// let drawInterval;

// Main draw function
function draw() {
  // Avoid NaNs by ensuring math runs every time
  const time = (Date.now() % ORBIT_PERIOD_MS) / ORBIT_PERIOD_MS * 2 * Math.PI;
  window._op_time = time;
  try {
    localStorage.setItem('_debug_time', time);
  } catch (e) {}

  // Safe cosine/sine
  const cos = Math.cos(time);
  const sin = Math.sin(time);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
  ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
  ctx.scale(zoom, zoom);

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
  for (const [, obj] of mapObjects) {
    const x = obj._pos.x * cos - obj._pos.y * sin;
    const y = obj._pos.x * sin + obj._pos.y * cos;
    const screenX = x * zoom + width / 2 + offsetX;
    const screenY = y * zoom + height / 2 + offsetY;

    const el = obj._el;
    el.style.left = `${screenX}px`;
    el.style.top = `${screenY}px`;
    el.querySelector('img').style.transform = `scale(${Math.max(0.5, zoom)})`;
  }

  // Optional: Trigger fix (only if function exists)
  try {
    if (typeof separateObjects === 'function') separateObjects();
  } catch (e) {
    console.warn("[Draw] separateObjects missing:", e.message);
  }

  drawCount++;
  
  // After 10 frames, switch to slower interval
  if (drawCount === 10) {
    clearInterval(drawInterval);
    drawInterval = setInterval(draw, 60000); // 1 minute
    console.log("[Draw] Switched to slow interval");
  }
}

// Start fast to allow everything to initialize
drawInterval = setInterval(draw, 100); // ~10 FPS for first second





  
// Galaxy data fetching logic
function fetchGalaxyDataWrapper() {
  showLoading(true);

  fetch('https://hsmineword.github.io/api/elements.json?jam=' + Math.random(), { cache: 'no-store' })
    .then(res => res.json())
    .then(urls => Promise.all(urls.map(url => fetch(url).then(r => r.json()))))
    .then(jsonObjs => updateGalaxyObjects(jsonObjs))
    .catch(e => console.error("Galaxy data error:", e))
    .finally(() => showLoading(false));
}

// Start fetching immediately and set interval
function startGalaxyDataFetch() {
  fetchGalaxyDataWrapper();
  setInterval(fetchGalaxyDataWrapper, 600000); // every minute
}

startGalaxyDataFetch(); // Call once at start, end



function loadTooCloseScript() {
  const randomJam = Math.random().toString(36).substring(2, 10); // Generate random string
  const script = document.createElement('script');
  script.src = `https://hsmineword.github.io/api/html/tooclose.js?jam=${randomJam}`;
  script.type = 'text/javascript';
  script.async = true;

  script.onload = function () {
    console.log('[TooCloseScriptLoader] tooclose.js loaded successfully.');

    if (typeof setupforheat === 'function') {
      console.log('[TooCloseScriptLoader] Executing setupforheat()...');
      setupforheat();  // Execute the setupforheat function after the script is loaded
    } else {
      console.warn('[TooCloseScriptLoader] setupforheat() not found after load.');
    }
  };

  script.onerror = function () {
    console.error('[TooCloseScriptLoader] Failed to load tooclose.js.');
  };

  document.head.appendChild(script);
}

loadTooCloseScript();

function loadGalaxySearchBar() {
  const jam = Math.random().toString(36).substring(2, 10); // random string
  const script = document.createElement('script');
  script.src = `https://hsmineword.github.io/api/html/search.js?jam=${jam}`;
  script.async = true;

  script.onload = () => {
    console.log(`[GalaxySearchLoader] search.js loaded successfully.`);
  };

  script.onerror = () => {
    console.error(`[GalaxySearchLoader] Failed to load search.js`);
  };

  document.head.appendChild(script);
}
loadGalaxySearchBar();





const originalUpdateGalaxyObjects = window.updateGalaxyObjects;

window.updateGalaxyObjects = function(objects) {
  originalUpdateGalaxyObjects(objects);

  // Delay a bit to ensure DOM elements exist
  setTimeout(() => {
    console.log('[TooCloseFix] Running separation after galaxy update...');
    separateObjects();
  }, 500);
};
