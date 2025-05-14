// Parse markdown-like syntax
function parseMarkdown(content) {
  content = content.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  content = content.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  content = content.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  content = content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  content = content.replace(/\*(.*?)\*/g, '<i>$1</i>');
  content = content.replace(/`(.*?)`/g, '<code>$1</code>');
  content = content.replace(/~~(.*?)~~/g, '<del>$1</del>');
  content = content.replace(/__(.*?)__/g, '<u>$1</u>');
  content = content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
  content = content.replace(/\n/g, '<br>');
  return content;
}

// Render the embed
function showDiscordEmbed(data, position = { x: 20, y: 20 }) {
  console.log("[Embed Renderer] Rendering embed with data:", data);

  // Remove old embeds
  document.querySelectorAll('.discord-embed').forEach(el => el.remove());

  const embed = document.createElement('div');
  embed.className = 'discord-embed';
  embed.style.position = 'absolute';
  embed.style.left = `${position.x}px`;
  embed.style.top = `${position.y}px`;
  embed.style.borderLeft = `4px solid ${data.color ? parseColor(data.color) : '#5865F2'}`;
  embed.style.background = '#2f3136';
  embed.style.color = '#fff';
  embed.style.padding = '10px 10px 15px 10px';
  embed.style.borderRadius = '8px';
  embed.style.width = '320px';
  embed.style.fontFamily = 'sans-serif';
  embed.style.zIndex = 9999;
  embed.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
  embed.style.boxSizing = 'border-box';

  // Close button
  const closeBtn = document.createElement('div');
  closeBtn.textContent = '×';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '5px';
  closeBtn.style.right = '8px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontSize = '16px';
  closeBtn.style.color = '#ccc';
  closeBtn.style.userSelect = 'none';
  closeBtn.addEventListener('click', () => {
    embed.remove();
    console.log('[Embed Renderer] Embed closed');
  });
  embed.appendChild(closeBtn);

  // Content container
  let content = '';

  // Author
  if (data.author) {
    content += `<div style="display: flex; align-items: center; font-size: 13px; font-weight: bold; margin-bottom: 6px;">`;
    if (data.author.icon_url) {
      content += `<img src="${data.author.icon_url}" style="width: 20px; height: 20px; border-radius: 50%; margin-right: 6px;">`;
    }
    const authorText = data.author.url
      ? `<a href="${data.author.url}" target="_blank" style="color: #00b0f4; text-decoration: none;">${data.author.name || 'Author'}</a>`
      : `${data.author.name || 'Author'}`;
    content += `${authorText}</div>`;
  }

  // Title with link
  if (data.title) {
    if (data.url) {
      content += `<div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;"><a href="${data.url}" target="_blank" style="color: #00b0f4; text-decoration: none;">${data.title}</a></div>`;
    } else {
      content += `<div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">${data.title}</div>`;
    }
  }

  // Description
  if (data.description) {
    content += `<div style="font-size: 13px; margin-bottom: 8px;">${parseMarkdown(data.description)}</div>`;
  }

  // Fields
  if (data.fields && Array.isArray(data.fields)) {
    data.fields.forEach(field => {
      content += `<div style="margin-bottom: 5px;"><strong>${field.name}:</strong> ${parseMarkdown(field.value)}</div>`;
    });
  }

  // Image (full-width)
  if (data.image?.url) {
    content += `<div style="margin-top: 10px;"><img src="${data.image.url}" style="width: 100%; border-radius: 4px;"></div>`;
  }

  // Thumbnail (floated to right)
  if (data.thumbnail?.url) {
    content += `<div style="position: absolute; top: 10px; right: 10px;">
      <img src="${data.thumbnail.url}" style="width: 40px; height: 40px; border-radius: 6px;">
    </div>`;
  }

  // Footer
  if (data.footer) {
    content += `<div style="font-size: 12px; margin-top: 12px; color: #aaa;">`;
    if (data.footer.text) {
      content += `<div>${data.footer.text}</div>`;
    }
    if (data.timestamp) {
      content += `<div>${new Date(data.timestamp).toLocaleString()}</div>`;
    }
    if (data.footer.icon_url) {
      content += `<img src="${data.footer.icon_url}" style="width: 16px; height: 16px; border-radius: 50%; margin-top: 5px;">`;
    }
    content += `</div>`;
  }

  embed.innerHTML += content;
  document.body.appendChild(embed);

  console.log('[Embed Renderer] Embed added to page');
}

// Helper: convert Discord integer color or pass-through hex
function parseColor(color) {
  if (typeof color === 'number') {
    return '#' + color.toString(16).padStart(6, '0');
  }
  if (typeof color === 'string' && color.startsWith('#')) {
    return color;
  }
  return '#5865F2'; // default
}

// Expose global function for integration
window.createDiscordEmbed = function (data, position) {
  console.log('[Embed Renderer] Triggered');
  showDiscordEmbed(data, position || { x: 20, y: 20 });
};
