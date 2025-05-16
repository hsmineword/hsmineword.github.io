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

function parseColor(color) {
  if (!color) return '#5865F2'; // default
  if (typeof color === 'number') {
    return `#${color.toString(16).padStart(6, '0')}`;
  }
  return color;
}

function showDiscordEmbed(data, position = { x: 20, y: 20 }) {
  console.log("[Embed Renderer] Rendering embed with data:", data);

  // Remove previous embeds
  document.querySelectorAll('.discord-embed').forEach(el => el.remove());

// Create a scrollable wrapper for inner content
const content = document.createElement('div');
content.style.maxHeight = '80vh'; // 80% of viewport height
content.style.overflowY = 'auto';
content.style.paddingRight = '6px'; // optional, space for scrollbar
  embed.className = 'discord-embed';
  embed.style.position = 'absolute';
  embed.style.left = `${position.x}px`;
  embed.style.top = `${position.y}px`;
  embed.style.borderLeft = `4px solid ${parseColor(data.color)}`;
  embed.style.background = '#2f3136';
  embed.style.color = '#fff';
  embed.style.padding = '10px';
  embed.style.borderRadius = '8px';
  embed.style.width = '320px';
 // embed.style.fontFamily = 'sans-serif';
  embed.style.zIndex = 9999;
  embed.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
  embed.style.boxSizing = 'border-box';

  // Close Button
  const closeBtn = document.createElement('div');
  closeBtn.textContent = '×';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '5px';
  closeBtn.style.right = '8px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontSize = '16px';
  closeBtn.style.color = '#ccc';
  closeBtn.style.userSelect = 'none';
  closeBtn.title = 'Close';
  closeBtn.addEventListener('click', () => {
    console.log('[Embed Renderer] Close button clicked');
    embed.remove(); // removes the embed from the DOM
  });
  embed.appendChild(closeBtn);

  // Create a wrapper for inner content
  const content = document.createElement('div');

  // Author
  if (data.author) {
    const authorDiv = document.createElement('div');
    authorDiv.style.display = 'flex';
    authorDiv.style.alignItems = 'center';
    authorDiv.style.fontSize = '13px';
    authorDiv.style.fontWeight = 'bold';
    authorDiv.style.marginBottom = '6px';
    if (data.author.icon_url) {
      const icon = document.createElement('img');
      icon.src = data.author.icon_url;
      icon.style.width = '20px';
      icon.style.height = '20px';
      icon.style.borderRadius = '50%';
      icon.style.marginRight = '6px';
      authorDiv.appendChild(icon);
    }
    const authorText = document.createElement('span');
    authorText.textContent = data.author.name || 'Author';
    authorDiv.appendChild(authorText);
    content.appendChild(authorDiv);
  }

  // Title (with optional URL)
  if (data.title) {
    const title = document.createElement('div');
    title.style.fontSize = '14px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '4px';
    if (data.url) {
      const link = document.createElement('a');
      link.href = data.url;
      link.target = '_blank';
      link.textContent = data.title;
      link.style.color = '#00b0f4';
      link.style.textDecoration = 'none';
      title.appendChild(link);
    } else {
      title.textContent = data.title;
    }
    content.appendChild(title);
  }

  // Description
  if (data.description) {
    const desc = document.createElement('div');
    desc.style.fontSize = '13px';
    desc.style.marginBottom = '8px';
    desc.innerHTML = parseMarkdown(data.description);
    content.appendChild(desc);
  }

  // Fields
  if (data.fields && Array.isArray(data.fields)) {
    data.fields.forEach(field => {
      const fieldDiv = document.createElement('div');
      fieldDiv.style.marginBottom = '5px';
      fieldDiv.innerHTML = `<strong>${field.name}</strong>: ${parseMarkdown(field.value)}`;
      content.appendChild(fieldDiv);
    });
  }

  // Image
  if (data.image?.url) {
    const img = document.createElement('img');
    img.src = data.image.url;
    img.style.maxWidth = '100%';
    img.style.borderRadius = '6px';
    img.style.marginTop = '10px';
    content.appendChild(img);
  }

//  if (data.video?.url) {
//  const video = document.createElement('video');
//  video.src = data.video.url;
//  video.controls = true;
//  video.style.maxWidth = '100%';
//  video.style.borderRadius = '6px';
//  video.style.marginTop = '10px';
//  content.appendChild(video);
//}

  if (Array.isArray(data.video?.url)) {
  data.video.url.forEach(videoUrl => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.controls = true;
    video.style.maxWidth = '100%';
    video.style.borderRadius = '6px';
    video.style.marginTop = '10px';
    content.appendChild(video);
  });
}

  // Thumbnail (optional small image on top right)
  if (data.thumbnail?.url) {
    const thumb = document.createElement('img');
    thumb.src = data.thumbnail.url;
    thumb.style.position = 'absolute';
    thumb.style.top = '10px';
    thumb.style.right = '10px';
    thumb.style.width = '40px';
    thumb.style.height = '40px';
    thumb.style.borderRadius = '4px';
    embed.appendChild(thumb);
  }

  // Footer
  if (data.footer) {
    const footer = document.createElement('div');
    footer.style.fontSize = '12px';
    footer.style.marginTop = '10px';
    footer.style.color = '#aaa';
    footer.innerHTML = `<div><strong>${data.footer.text}</strong></div>`;
    if (data.timestamp) {
      const ts = new Date(data.timestamp).toLocaleString();
      footer.innerHTML += `<div>${ts}</div>`;
    }
    if (data.footer.icon_url) {
      const footerIcon = document.createElement('img');
      footerIcon.src = data.footer.icon_url;
      footerIcon.style.width = '16px';
      footerIcon.style.height = '16px';
      footerIcon.style.borderRadius = '50%';
      footerIcon.style.marginTop = '5px';
      footer.appendChild(footerIcon);
    }
    content.appendChild(footer);
  }

  embed.appendChild(content);
  document.body.appendChild(embed);
}


// Expose global function for integration
window.createDiscordEmbed = function (data, position) {
  console.log('[Embed Renderer] Triggered');
  showDiscordEmbed(data, position || { x: 20, y: 20 });
};
