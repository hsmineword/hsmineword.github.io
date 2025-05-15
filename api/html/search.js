(function setupGalaxySearch() {
  let results = [];
  let currentIndex = -1;

  const box = document.createElement('div');
  Object.assign(box.style, {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: '#222', // dark gray
    color: '#fff',
    padding: '10px',
    borderRadius: '8px',
    zIndex: 1100,
    fontFamily: 'sans-serif',
    width: '240px',
    boxShadow: '0 0 8px rgba(0,0,0,0.5)'
  });

  const toggle = document.createElement('div');
  toggle.textContent = '🔍 Search';
  toggle.style.cursor = 'pointer';
  toggle.style.fontWeight = 'bold';
  toggle.style.marginBottom = '8px';
  toggle.style.userSelect = 'none';
  box.appendChild(toggle);

  const content = document.createElement('div');
  content.style.display = 'block';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Search galaxy...';
  Object.assign(input.style, {
    width: '100%',
    padding: '6px',
    fontSize: '14px',
    border: '1px solid #555',
    borderRadius: '4px',
    marginBottom: '6px',
    backgroundColor: '#333',
    color: '#fff',
    boxSizing: 'border-box'
  });

  const result = document.createElement('div');
  result.style.fontSize = '14px';
  result.style.marginTop = '4px';

  function updateResultDisplay() {
    if (results.length === 0) {
      result.textContent = '🔎 No results';
    } else {
      result.innerHTML = `🔎 Found <span style="cursor:pointer;color:#4af;" id="galaxy-prev">&lt;</span> ${currentIndex + 1}/${results.length} <span style="cursor:pointer;color:#4af;" id="galaxy-next">&gt;</span>`;
      setTimeout(() => {
        document.getElementById('galaxy-prev').onclick = () => moveToResult(-1);
        document.getElementById('galaxy-next').onclick = () => moveToResult(1);
      }, 0);
    }
  }

  function moveToResult(direction) {
    if (results.length === 0) return;
    currentIndex = (currentIndex + direction + results.length) % results.length;

    const el = results[currentIndex];
    const obj = [...mapObjects.values()].find(o => o._el === el);
    if (!obj) return;

    // Update camera offset to center on object
    offsetX = -obj._pos.x * zoom;
    offsetY = -obj._pos.y * zoom;

    // Calculate screen position
    const time = Date.now() / 10000;
    const cos = Math.cos(time);
    const sin = Math.sin(time);
    const worldX = obj._pos.x;
    const worldY = obj._pos.y;
    const rotatedX = worldX * cos - worldY * sin;
    const rotatedY = worldX * sin + worldY * cos;
    const screenX = rotatedX * zoom + canvas.width / 2 + offsetX;
    const screenY = rotatedY * zoom + canvas.height / 2 + offsetY;

    console.log(`[Search] ${obj.map_name}`);
    console.log(`Coords: (${worldX.toFixed(2)}, ${worldY.toFixed(2)})`);
    console.log(`Screen: (${screenX.toFixed(2)}, ${screenY.toFixed(2)})`);
  }

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    results = [];
    currentIndex = -1;

    if (query.length > 0) {
      document.querySelectorAll('.map-object').forEach(el => {
        const payload = el.getAttribute('custompayload');
        let name = '';
        try {
          name = JSON.parse(payload)?.map_name?.toLowerCase() || '';
        } catch {}
        if (name.includes(query)) {
          results.push(el);
        }
      });
    }

    if (results.length > 0) {
      currentIndex = 0;
    }

    updateResultDisplay();
  });

  toggle.addEventListener('click', () => {
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
  });

  content.appendChild(input);
  content.appendChild(result);
  box.appendChild(content);
  document.body.appendChild(box);
})();
