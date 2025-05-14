// embed.js

// Function to parse markdown-like syntax in a string
function parseMarkdown(content) {
  // Convert #, ##, ### headings
  content = content.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  content = content.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  content = content.replace(/^# (.*)$/gm, '<h1>$1</h1>');

  // Convert **bold** text
  content = content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  
  // Convert *italic* text
  content = content.replace(/\*(.*?)\*/g, '<i>$1</i>');
  
  // Convert `code` text
  content = content.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Convert ~~strikethrough~~ text
  content = content.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // Convert __underline__ text
  content = content.replace(/__(.*?)__/g, '<u>$1</u>');
  
  // Convert links [text](url)
  content = content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Convert newline characters to <br> for line breaks
  content = content.replace(/\n/g, '<br>');
  
  return content;
}

// Function to create and show a Discord-style embed
function showDiscordEmbed(data, position = { x: 20, y: 20 }) {
  // Remove any existing embeds
  document.querySelectorAll('.discord-embed').forEach(el => el.remove());

  const embed = document.createElement('div');
  embed.className = 'discord-embed';
  embed.style.position = 'absolute';
  embed.style.left = `${position.x}px`;
  embed.style.top = `${position.y}px`;
  embed.style.borderLeft = `4px solid ${data.color ? `#${data.color.toString(16)}` : '#5865F2'}`;
  embed.style.background = '#2f3136';
  embed.style.color = '#fff';
  embed.style.padding = '10px';
  embed.style.borderRadius = '6px';
  embed.style.width = '300px';
  embed.style.fontFamily = 'sans-serif';
  embed.style.zIndex = 1000;
  embed.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';

  // Build the embed content
  let embedContent = '';

  // Handle author if present
  if (data.author) {
    embedContent += `
      <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">
        ${data.author.name || 'Unknown Author'}
    `;
    if (data.author.icon_url) {
      embedContent += `<img src="${data.author.icon_url}" alt="Author Icon" style="width: 16px; height: 16px; border-radius: 50%; margin-left: 5px;">`;
    }
    embedContent += `</div>`;
  }

  // Handle title and description
  embedContent += `
    <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">${data.title || 'Untitled'}</div>
    <div style="font-size: 13px; margin-bottom: 10px;">${parseMarkdown(data.description || '')}</div>
  `;
  
  // Handle image if present
  if (data.image) {
    embedContent += `
      <div style="margin-top: 10px;">
        <img src="${data.image}" style="max-width: 100%; border-radius: 6px;">
      </div>
    `;
  }

  // Handle fields
  if (data.fields && Array.isArray(data.fields)) {
    data.fields.forEach(f => {
      embedContent += `
        <div style="margin-bottom: 5px;">
          <strong>${f.name}:</strong> ${parseMarkdown(f.value)}
        </div>
      `;
    });
  }

  // Handle footer and timestamp if they exist
  if (data.footer) {
    embedContent += `
      <div style="font-size: 12px; margin-top: 10px; color: #aaa;">
        <div><strong>${data.footer.text || ''}</strong></div>
        ${data.timestamp ? `<div>${new Date(data.timestamp).toLocaleString()}</div>` : ''}
    `;
    if (data.footer.icon_url) {
      embedContent += `
        <img src="${data.footer.icon_url}" alt="Footer Icon" style="width: 16px; height: 16px; border-radius: 50%; margin-top: 5px;">
      `;
    }
    embedContent += `</div>`;
  }

  embed.innerHTML = embedContent;
  document.body.appendChild(embed);
}
