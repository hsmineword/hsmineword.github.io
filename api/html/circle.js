// Function to draw circles around stars with the same constellation id
function drawCircleAroundConstellation(constellationId) {
  const selectedObjects = []; 

  // Get all stars or objects with the same constellation ID
  for (const [id, obj] of mapObjects) {
    if (obj.map_constellation_id === constellationId) {
      selectedObjects.push(obj);
    }
  }

  // Draw a circle around each object in the selectedObjects array
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FF0000'; // Red color for the circle
  ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'; // Semi-transparent red fill for the circle

  selectedObjects.forEach(obj => {
    const x = obj._pos.x;
    const y = obj._pos.y;

    const screenX = x * zoom + width / 2 + offsetX;
    const screenY = y * zoom + height / 2 + offsetY;

    // Draw a circle around the object
    ctx.beginPath();
    ctx.arc(screenX, screenY, 50, 0, Math.PI * 2); // 50px radius for the circle
    ctx.fill();
    ctx.stroke();
  });
}

// Function to draw circles around stars with the same constellation id
function drawCircleAroundConstellation(constellationId) {
  const selectedObjects = [];

  // Get all stars or objects with the same constellation ID
  for (const [id, obj] of mapObjects) {
    if (obj.map_constellation_id === constellationId) {
      selectedObjects.push(obj);
    }
  }

  // Draw a circle around each object in the selectedObjects array
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FF0000'; // Red color for the circle
  ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'; // Semi-transparent red fill for the circle

  selectedObjects.forEach(obj => {
    const x = obj._pos.x;
    const y = obj._pos.y;

    const screenX = x * zoom + width / 2 + offsetX;
    const screenY = y * zoom + height / 2 + offsetY;

    // Draw a circle around the object
    ctx.beginPath();
    ctx.arc(screenX, screenY, 50, 0, Math.PI * 2); // 50px radius for the circle
    ctx.fill();
    ctx.stroke();
  });
}

// Example of triggering the circle drawing for a specific constellation ID
function highlightConstellation(constellationId) {
  // Clear previous canvas content
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw(); // Redraw all objects

  // Now, draw circles around the objects in the selected constellation
  drawCircleAroundConstellation(constellationId);
}

// Overriding the console.log function to listen for specific logs
(function() {
  const originalConsoleLog = console.log;
  
  console.log = function(message) {
    // Check if the message contains the keyword to highlight a constellation
    const match = message.match(/highlight constellation (\d+)/);
    if (match) {
      const constellationId = parseInt(match[1], 10);
      console.log(`Auto-highlighting constellation ID ${constellationId}`);
      highlightConstellation(constellationId);  // Call highlight automatically
    }

    // Call the original console log to maintain normal logging behavior
    originalConsoleLog.apply(console, arguments);
  };
})();

// Test the automatic highlight trigger by logging a message
// console.log("highlight constellation 1"); // This will trigger the highlight for constellation 1
