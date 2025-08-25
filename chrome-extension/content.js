let selectorActive = false;
let highlightDiv = null;

function cleanup() {
  selectorActive = false;
  if (highlightDiv) {
    highlightDiv.remove();
    highlightDiv = null;
  }
}

function activateSelector() {
  if (selectorActive) return;
  selectorActive = true;
  highlightDiv = document.createElement('div');
  highlightDiv.style.position = 'absolute';
  highlightDiv.style.pointerEvents = 'none';
  highlightDiv.style.border = '2px solid #f90';
  highlightDiv.style.zIndex = '999999';
  document.body.appendChild(highlightDiv);
}

window.addEventListener('activate-selector', activateSelector);

document.addEventListener('mousemove', (e) => {
  if (!selectorActive || !highlightDiv) return;
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el || el === highlightDiv || !el.getBoundingClientRect) return;
  const rect = el.getBoundingClientRect();
  highlightDiv.style.left = `${rect.left + window.scrollX}px`;
  highlightDiv.style.top = `${rect.top + window.scrollY}px`;
  highlightDiv.style.width = `${rect.width}px`;
  highlightDiv.style.height = `${rect.height}px`;
});

document.addEventListener('click', (e) => {
  if (!selectorActive) return;
  e.preventDefault();
  e.stopPropagation();

  const el = document.elementFromPoint(e.clientX, e.clientY);
  cleanup();
  if (!el) return;

  const title = prompt('Enter a title for this capture:');
  if (!title || !title.trim()) {
    alert('Title is required. Not saved.');
    return;
  }

  const category = prompt('Enter category/tags (comma separated, optional):');
  const categories = category ? category.split(',').map(s => s.trim()).filter(Boolean) : [];

  const dataToSave = {
    title: title.trim(),
    text: el.innerText || '',
    html: el.outerHTML || '',
    tag: el.tagName || '',
    url: location.href,
    categories: categories,
    timestamp: Date.now()
  };

  chrome.storage.local.get(['storageMode', 'apiToken'], (res) => {
    if (res.storageMode === 'server') {
      if (!res.apiToken) {
        alert('Save failed: Not connected to server. Please connect in the extension popup.');
        return;
      }
      saveToServer(dataToSave, res.apiToken);
    } else {
      saveToLocal(dataToSave);
    }
  });
}, true);

function saveToLocal(data) {
  chrome.storage.local.get({ contentList: [] }, (res) => {
    const contentList = res.contentList || [];
    contentList.push(data);
    chrome.storage.local.set({ contentList }, () => {
      if (chrome.runtime.lastError) {
        alert(`Save failed: ${chrome.runtime.lastError.message}`);
      } else {
        alert('Content captured and saved locally!');
      }
    });
  });
}

async function saveToServer(data, token) {
  try {
    const response = await fetch(`${appConfig.backendUrl}/api/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert('Content captured and saved to server!');
    } else {
      const errorResult = await response.json();
      throw new Error(errorResult.message || 'Failed to save');
    }
  } catch (error) {
    alert(`Save to server failed: ${error.message}`);
  }
}

document.addEventListener('keydown', (e) => {
  if (selectorActive && e.key === 'Escape') {
    cleanup();
    alert('Selection cancelled');
  }
});

console.log('Content selector ready');