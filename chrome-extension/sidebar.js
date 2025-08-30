document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const activateBtn = document.getElementById('activate');
  const statusDiv = document.getElementById('status');
  const storageSelect = document.getElementById('storage-select');
  const serverConnectionSection = document.getElementById('server-connection-section');
  const mongoUriInput = document.getElementById('mongo-uri-input');
  const connectBtn = document.getElementById('connect-btn');
  const disconnectBtn = document.getElementById('disconnect-btn');
  const connectionStatusDiv = document.getElementById('connection-status');
  const categoryDropdown = document.getElementById('categoryDropdown');
  const titleDropdown = document.getElementById('titleDropdown');
  const deleteSelectedBtn = document.getElementById('deleteSelected');
  const deleteAllBtn = document.getElementById('deleteAll');
  const exportAllBtn = document.getElementById('exportAll');
  const contentDetailDiv = document.getElementById('contentDetail');
  const widthControls = document.querySelectorAll('.width-btn');
  const fontSizeControls = document.querySelectorAll('.font-size-btn');

  // App State
  let storageMode = 'local';
  let apiToken = null;
  let mongoURI = '';

  // --- Initialization ---
  async function initialize() {
    const data = await chrome.storage.local.get(['storageMode', 'apiToken', 'mongoURI', 'sidebarWidth']);
    storageMode = data.storageMode || 'local';
    apiToken = data.apiToken || null;
    mongoURI = data.mongoURI || '';
    const sidebarWidth = data.sidebarWidth || 'low';

    storageSelect.value = storageMode;
    mongoUriInput.value = mongoURI;

    updateUIForStorageMode();
    renderCategoryAndList();
    updateWidthButtons(sidebarWidth);

    // Setup Event Listeners
    activateBtn.addEventListener('click', activateSelector);
    storageSelect.addEventListener('change', handleStorageChange);
    connectBtn.addEventListener('click', connectToServer);
    disconnectBtn.addEventListener('click', disconnectFromServer);
    categoryDropdown.addEventListener('change', () => renderCategoryAndList(categoryDropdown.value));
    titleDropdown.addEventListener('change', handleTitleChange);
    deleteSelectedBtn.addEventListener('click', deleteSelected);
    deleteAllBtn.addEventListener('click', deleteAll);
    exportAllBtn.addEventListener('click', exportAll);
    widthControls.forEach(btn => btn.addEventListener('click', handleWidthChange));
    fontSizeControls.forEach(btn => btn.addEventListener('click', handleFontSizeChange));
  }

  // --- UI Update Logic ---
  function updateUIForStorageMode() {
    if (storageMode === 'server') {
      serverConnectionSection.style.display = 'block';
      if (apiToken) {
        connectionStatusDiv.textContent = 'Connected.';
        connectionStatusDiv.style.color = 'green';
        connectBtn.style.display = 'none';
        disconnectBtn.style.display = 'inline-block';
        mongoUriInput.disabled = true;
      } else {
        connectionStatusDiv.textContent = 'Disconnected.';
        connectionStatusDiv.style.color = 'red';
        connectBtn.style.display = 'inline-block';
        disconnectBtn.style.display = 'none';
        mongoUriInput.disabled = false;
      }
    } else {
      serverConnectionSection.style.display = 'none';
    }
  }

  function updateWidthButtons(activeWidth) {
    widthControls.forEach(btn => btn.classList.toggle('active', btn.dataset.width === activeWidth));
  }

  function updateFontSizeButtons(activeSize) {
    fontSizeControls.forEach(btn => btn.classList.toggle('active', btn.dataset.size === activeSize));
  }

  // --- Event Handlers ---
  async function handleWidthChange(event) {
    const newWidth = event.target.dataset.width;
    if (!newWidth) return;
    await chrome.storage.local.set({ sidebarWidth: newWidth });
    updateWidthButtons(newWidth);
    window.parent.postMessage({ action: 'updateLayout' }, '*');
  }

  function handleFontSizeChange(event) {
    const newSize = event.target.dataset.size;
    if (!newSize) return;
    applyFontSize(newSize);
    updateFontSizeButtons(newSize);
  }

  async function handleStorageChange() {
    storageMode = storageSelect.value;
    await chrome.storage.local.set({ storageMode });
    updateUIForStorageMode();
    renderCategoryAndList();
  }

  async function handleTitleChange() {
    const idx = titleDropdown.value;
    if (idx === '') return;
    const filteredList = titleDropdown.filteredList || [];
    if (filteredList[idx]) {
      showDetail(filteredList[idx]);
    }
  }

  // --- Core Logic ---
  function applyFontSize(size) {
    const iframe = contentDetailDiv.querySelector('iframe');
    if (!iframe || !iframe.contentDocument) return;

    let styleEl = iframe.contentDocument.getElementById('font-styler');
    if (!styleEl) {
      styleEl = iframe.contentDocument.createElement('style');
      styleEl.id = 'font-styler';
      iframe.contentDocument.head.appendChild(styleEl);
    }
    styleEl.textContent = `body { font-size: ${size}em !important; }`;
  }

  function showDetail(item) {
    const url = item.info ? item.info.url : item.url;
    const html = item.info ? item.info.html : item.html;

    contentDetailDiv.innerHTML = `
      <div><b>URL:</b> <a href="${url}" target="_blank" style="color:#0066cc;">${url}</a></div>
      <iframe sandbox="allow-same-origin" srcdoc='${escapeHtmlForIframe(html)}'></iframe>`;

    const iframe = contentDetailDiv.querySelector('iframe');
    if (iframe) {
      iframe.addEventListener('load', () => {
        // Apply default font size on load and set 1x button to active
        applyFontSize('1');
        updateFontSizeButtons('1');
      }, { once: true });
    }
  }

  async function renderCategoryAndList(selectedCategory = '__all__') {
    if (storageMode === 'local') {
      renderFromLocal(selectedCategory);
    } else {
      renderFromServer(selectedCategory);
    }
  }

  function renderFromLocal(selectedCategory) {
    chrome.storage.local.get({ contentList: [] }, res => {
      const list = res.contentList || [];
      populateDropdowns(list, selectedCategory);
    });
  }

  async function renderFromServer(selectedCategory) {
    if (!apiToken) {
      titleDropdown.innerHTML = '<option>Please connect to server</option>';
      categoryDropdown.innerHTML = '<option>Please connect to server</option>';
      return;
    }
    try {
      const capturesResponse = await makeApiCall(`/captures?category=${selectedCategory === '__all__' ? '' : selectedCategory}`);
      const categoriesResponse = await makeApiCall('/categories');
      const captures = capturesResponse.data.captures || [];
      const categories = categoriesResponse.data.categories || [];
      populateDropdowns(captures, selectedCategory, categories);
    } catch (error) {
      statusDiv.textContent = `Error: ${error.message}`;
    }
  }
  
  function populateDropdowns(list, selectedCategory, serverCategories = null) {
    const categorySet = new Set();
    if (serverCategories) {
        serverCategories.forEach(cat => categorySet.add(cat));
    } else {
        list.forEach(item => {
            (item.categories || []).forEach(cat => categorySet.add(cat));
        });
    }
    categoryDropdown.innerHTML = '';
    const allOption = document.createElement('option');
    allOption.value = '__all__';
    allOption.textContent = 'All Categories';
    if (selectedCategory === '__all__') allOption.selected = true;
    categoryDropdown.appendChild(allOption);
    Array.from(categorySet).sort().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if (cat === selectedCategory) option.selected = true;
        categoryDropdown.appendChild(option);
    });

    let filteredList = list;
    if (storageMode === 'local' && selectedCategory !== '__all__') {
        filteredList = list.filter(item => (item.categories || []).includes(selectedCategory));
    }

    titleDropdown.innerHTML = '';
    if (filteredList.length === 0) {
        titleDropdown.innerHTML = '<option value="" disabled selected>No saved content</option>';
        contentDetailDiv.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; background-color: #fafafa; border: 1px solid #ccc; box-sizing: border-box;">Select an item to view details</div>';
        return;
    }
    titleDropdown.innerHTML = '<option value="" disabled selected>Select saved content</option>';
    filteredList.forEach((item, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = item.title;
        titleDropdown.appendChild(option);
    });
    titleDropdown.filteredList = filteredList;
    contentDetailDiv.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; background-color: #fafafa; border: 1px solid #ccc; box-sizing: border-box;">Select an item to view details</div>';
  }

  async function connectToServer() {
    let uri = mongoUriInput.value.trim();
    if (!uri) {
      alert('Please enter a MongoDB Connection String.');
      return;
    }

    if (!uri.includes('?')) {
      uri += '?retryWrites=true&w=majority';
    }

    statusDiv.textContent = 'Connecting...';
    try {
      const response = await fetch('https://capture.badtom.dpdns.org/api/database/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mongo_uri: uri })
      });

      const result = await response.json();
      if (response.ok && result.status === 'success') {
        apiToken = result.data.token;
        mongoURI = mongoUriInput.value.trim();
        await chrome.storage.local.set({ apiToken, mongoURI });
        statusDiv.textContent = 'Connection successful!';
        updateUIForStorageMode();
        renderCategoryAndList();
      } else {
        throw new Error(result.message || 'Connection failed');
      }
    } catch (error) {
      statusDiv.textContent = `Connection error: ${error.message}`;
    }
  }

  async function disconnectFromServer() {
    statusDiv.textContent = 'Disconnecting...';
    try {
      await makeApiCall('/database/disconnect', 'POST', { token: apiToken });
    } catch (error) {
      // Ignore errors
    }
    apiToken = null;
    await chrome.storage.local.remove(['apiToken']);
    statusDiv.textContent = 'Disconnected.';
    updateUIForStorageMode();
    renderCategoryAndList();
  }

  async function deleteSelected() {
    const idx = titleDropdown.value;
    const filteredList = titleDropdown.filteredList || [];
    if (idx === '' || !filteredList[idx]) {
      alert('Please select an item to delete');
      return;
    }
    const itemToDelete = filteredList[idx];

    if (storageMode === 'local') {
      chrome.storage.local.get({ contentList: [] }, res => {
        const newList = res.contentList.filter(item => item.timestamp !== itemToDelete.timestamp);
        chrome.storage.local.set({ contentList: newList }, () => renderCategoryAndList(categoryDropdown.value));
      });
    } else {
        if (!confirm('Are you sure you want to delete this item from the server?')) return;
        try {
            await makeApiCall(`/captures/${itemToDelete._id}`, 'DELETE');
            renderCategoryAndList(categoryDropdown.value);
        } catch (error) {
            statusDiv.textContent = `Error: ${error.message}`;
        }
    }
  }

  async function deleteAll() {
    if (!confirm(`Are you sure you want to delete all content from ${storageMode}?`)) return;
    if (storageMode === 'local') {
      chrome.storage.local.set({ contentList: [] }, () => renderCategoryAndList());
    } else {
        alert('For safety, deleting all server content is not implemented in this extension.');
    }
  }

  function exportAll() {
    if (storageMode === 'local') {
        chrome.storage.local.get({ contentList: [] }, res => {
            if (res.contentList.length === 0) {
                alert('No local content to export.');
                return;
            }
            downloadJson(res.contentList, 'local-captures');
        });
    } else {
        const captures = titleDropdown.filteredList || [];
        if (captures.length === 0) {
            alert('No server content to export.');
            return;
        }
        downloadJson(captures, 'server-captures');
    }
  }
  
  function downloadJson(data, filename) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }

  async function makeApiCall(endpoint, method = 'GET', body = null) {
    if (!apiToken) throw new Error('Not connected to server.');

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${appConfig.backendUrl}/api${endpoint}`, options);
    if (response.status === 401) {
        apiToken = null;
        await chrome.storage.local.remove(['apiToken']);
        updateUIForStorageMode();
        throw new Error('Token expired or invalid. Please reconnect.');
    }
    if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'API request failed');
    }
    return response.json();
  }
  
  function activateSelector() {
    statusDiv.innerText = 'Selector activated, click target content on page (Press ESC to cancel)';
    window.parent.postMessage({ action: 'activateSelectorFromSidebar' }, '*');
  }
  
  function escapeHtmlForIframe(str) { 
      return str ? str.replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;') : ''; 
  }

  initialize();

  // Listen for messages from the parent window (content.js)
  window.addEventListener('message', (event) => {
    if (event.data.action && event.data.action === 'refreshSidebarView') {
      console.log('Refresh command received from content script.');
      renderCategoryAndList(categoryDropdown.value);
    }
  });
});

// Helper function to get all content (for debugging or other purposes)
function getAllContent(callback) {
  chrome.storage.local.get({ contentList: [] }, (result) => {
    callback(result.contentList);
  });
}
