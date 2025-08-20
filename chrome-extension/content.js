let selectorActive = false;
let highlightDiv = null;

// Cleanup function
function cleanup() {
  selectorActive = false;
  if (highlightDiv && highlightDiv.parentNode) {
    highlightDiv.remove();
  }
  highlightDiv = null;
}

// Activate selector
function activateSelector() {
  console.log('Activating selector');
  cleanup(); // Clean up previous state first
  
  selectorActive = true;
  
  // Create highlight box
  if (!highlightDiv) {
    highlightDiv = document.createElement('div');
    highlightDiv.style.position = 'absolute';
    highlightDiv.style.pointerEvents = 'none';
    highlightDiv.style.border = '2px solid #f90';
    highlightDiv.style.zIndex = '999999';
    document.body.appendChild(highlightDiv);
  }
}

// Listen for activation event - rebind each time
window.addEventListener('activate-selector', activateSelector);

document.addEventListener('mousemove', (e) => {
  if (!selectorActive || !highlightDiv) return;
  
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el || el === highlightDiv) return;
  
  const rect = el.getBoundingClientRect();
  highlightDiv.style.left = (rect.left + window.scrollX) + 'px';
  highlightDiv.style.top = (rect.top + window.scrollY) + 'px';
  highlightDiv.style.width = rect.width + 'px';
  highlightDiv.style.height = rect.height + 'px';
});

// Click capture
document.addEventListener('click', (e) => {
  if (!selectorActive) return;

  e.preventDefault();
  e.stopPropagation();

  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el || el === highlightDiv) {
    cleanup();
    return;
  }

  cleanup();

  const info = {
    text: el.innerText || '',
    html: el.outerHTML || '',
    tag: el.tagName || '',
    url: location.href
  };

  const title = prompt('Enter a title for this capture:');
  if (!title || !title.trim()) {
    alert('Title is required. Not saved.');
    return;
  }

  const category = prompt('Enter category/tags (comma separated, optional):');
  let categories = [];
  if (category && category.trim()) {
    categories = category.split(',').map(s => s.trim()).filter(Boolean);
  }

  chrome.storage.local.get({contentList: []}, (res) => {
    const contentList = res.contentList || [];
    contentList.push({
      title: title.trim(),
      info: info,
      categories: categories,
      timestamp: Date.now()
    });

    chrome.storage.local.set({contentList}, () => {
      if (chrome.runtime.lastError) {
        alert('Save failed: ' + chrome.runtime.lastError.message);
      } else {
        alert('Content captured and saved!');
      }
    });
  });
}, true);

// ESC to cancel
document.addEventListener('keydown', (e) => {
  if (selectorActive && e.key === 'Escape') {
    cleanup();
    alert('Selection cancelled');
  }
});

console.log('Content selector ready');
