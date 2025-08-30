// --- Sidebar and Communication Logic ---

const SIDEBAR_ID = 'my-extension-sidebar-container';
const WIDTH_SETTINGS = {
  low: '350px',
  medium: '500px',
  high: '700px'
};

function updateSidebarLayout() {
  const sidebar = document.getElementById(SIDEBAR_ID);
  if (!sidebar) return;

  chrome.storage.local.get({ sidebarWidth: 'low' }, (data) => {
    const newWidth = WIDTH_SETTINGS[data.sidebarWidth] || WIDTH_SETTINGS['low'];
    sidebar.style.width = newWidth;
    document.body.style.marginRight = newWidth;
  });
}

function toggleSidebar() {
  let sidebar = document.getElementById(SIDEBAR_ID);
  if (sidebar) {
    sidebar.remove();
    document.body.style.marginRight = ''; // Reset body margin
  } else {
    sidebar = document.createElement('iframe');
    sidebar.id = SIDEBAR_ID;
    sidebar.src = chrome.runtime.getURL('sidebar.html');

    // Style the iframe
    sidebar.style.position = 'fixed';
    sidebar.style.top = '0';
    sidebar.style.right = '0';
    sidebar.style.height = '100vh';
    sidebar.style.border = 'none';
    sidebar.style.zIndex = '2147483647'; // Ensure it's on top
    sidebar.style.boxShadow = '-2px 0 15px rgba(0,0,0,0.2)';

    document.body.appendChild(sidebar);
    // Set initial width based on stored setting
    updateSidebarLayout();
  }
}

// Listen for toggle command from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle_sidebar") {
    toggleSidebar();
    sendResponse({ status: "done" });
  }
  return true; // Keep message channel open for async response
});

// Listen for commands from the sidebar iframe
window.addEventListener('message', (event) => {
  // Security: Only accept messages from our own extension
  if (event.origin !== chrome.runtime.getURL('').slice(0, -1)) {
    return;
  }

  if (event.data.action && (event.data.action === 'activateSelectorFromSidebar')) {
    let sidebar = document.getElementById(SIDEBAR_ID);
    if (sidebar) sidebar.style.display = 'none';
    activateSelector();
  }

  if (event.data.action && (event.data.action === 'updateLayout')) {
    updateSidebarLayout();
  }
}, false);


// --- Existing Element Selection Logic ---

let selectorActive = false;
let highlightDiv = null;

function cleanup() {
  selectorActive = false;
  if (highlightDiv) {
    highlightDiv.remove();
    highlightDiv = null;
  }
  let sidebar = document.getElementById(SIDEBAR_ID);
  if (sidebar) sidebar.style.display = 'block';
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
        // alert('Content captured and saved locally!');
        console.log('[content.js] Save complete. Attempting to send refresh message to sidebar...');
        const sidebarIframe = document.getElementById(SIDEBAR_ID);
        if (sidebarIframe) {
          sidebarIframe.contentWindow.postMessage({ action: 'refreshSidebarView' }, '*');
        }
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
      // Success alert removed as per user request.
      console.log('Content captured and saved to server!');
      const sidebarIframe = document.getElementById(SIDEBAR_ID);
      if (sidebarIframe) {
        sidebarIframe.contentWindow.postMessage({ action: 'refreshSidebarView' }, '*');
      }
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
