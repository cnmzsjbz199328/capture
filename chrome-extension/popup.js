document.getElementById('activate').onclick = async () => {
  try {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    
    // Check restricted pages
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      document.getElementById('status').innerText = 'Cannot use on this page';
      return;
    }
    
    // Directly execute activation code, not dependent on events
    await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: () => {
        // Directly call activation function, not relying on events
        if (typeof activateSelector === 'function') {
          activateSelector();
        } else {
          // If function doesn't exist, send event as backup
          window.dispatchEvent(new CustomEvent('activate-selector'));
        }
      }
    });
    
    document.getElementById('status').innerText = 'Selector activated, click target content on page (Press ESC to cancel)';
  } catch (error) {
    document.getElementById('status').innerText = 'Activation failed: ' + error.message;
  }
};

// Render category dropdown and content list
function renderCategoryAndList(selectedCategory = '__all__') {
  chrome.storage.local.get({contentList: []}, res => {
    const list = res.contentList;
    const categorySet = new Set();
    list.forEach(item => {
      (item.categories || []).forEach(cat => categorySet.add(cat));
    });

    // Render category dropdown
    const categoryDropdown = document.getElementById('categoryDropdown');
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

    // Filter list by category
    let filteredList = list;
    if (selectedCategory !== '__all__') {
      filteredList = list.filter(item => (item.categories || []).includes(selectedCategory));
    }

    // Render title dropdown
    const titleDropdown = document.getElementById('titleDropdown');
    titleDropdown.innerHTML = '';
    if (filteredList.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No saved content';
      option.disabled = true;
      option.selected = true;
      titleDropdown.appendChild(option);
      document.getElementById('contentDetail').innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">Select an item to view details</div>';
      return;
    }
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select saved content';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    titleDropdown.appendChild(defaultOption);

    filteredList.forEach((item, idx) => {
      const option = document.createElement('option');
      option.value = idx;
      option.textContent = item.title;
      titleDropdown.appendChild(option);
    });

    // Clear detail area
    document.getElementById('contentDetail').innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">Select an item to view details</div>';

    // Store filtered list for later use
    titleDropdown.filteredList = filteredList;
  });
}

// Show detail for selected item
function showDetail(item) {
  const detail = document.getElementById('contentDetail');
  const categories = (item.categories && item.categories.length)
    ? `<div><b>Categories:</b> ${item.categories.join(', ')}</div>`
    : '';
  detail.innerHTML =
    `${categories}
    <div><b>URL:</b> <a href="${item.info.url}" target="_blank" style="color:#0066cc;">${item.info.url}</a></div>
    <div style="margin-top:8px;"><b>HTML:</b></div>
    <iframe style="width:100%;min-height:200px;border:1px solid #ccc;background:#fff;margin-top:4px;" sandbox="allow-same-origin" srcdoc='${escapeHtmlForIframe(item.info.html)}'></iframe>`;
}

// Escape helpers (unchanged)
function escapeHtmlForIframe(str) { return str ? str.replace(/&/g, '&amp;').replace(/'/g, '&#39;') : ''; }
function escapeHtml(str) { if (!str) return ''; const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderCategoryAndList();

  document.getElementById('categoryDropdown').addEventListener('change', function() {
    renderCategoryAndList(this.value);
  });

  document.getElementById('titleDropdown').addEventListener('change', function() {
    const idx = this.value;
    const filteredList = this.filteredList || [];
    if (idx !== '' && filteredList[idx]) {
      showDetail(filteredList[idx]);
    }
  });

  // Delete Selected
  document.getElementById('deleteSelected').addEventListener('click', () => {
    const titleDropdown = document.getElementById('titleDropdown');
    const idx = titleDropdown.value;
    const filteredList = titleDropdown.filteredList || [];
    if (!idx || !filteredList[idx]) {
      alert('Please select an item to delete');
      return;
    }
    chrome.storage.local.get({contentList: []}, res => {
      const allList = res.contentList;
      // Find the item in allList by timestamp (unique)
      const itemToDelete = filteredList[idx];
      const newList = allList.filter(item => item.timestamp !== itemToDelete.timestamp);
      chrome.storage.local.set({contentList: newList}, () => {
        renderCategoryAndList(document.getElementById('categoryDropdown').value);
      });
    });
  });

  // Delete All
  document.getElementById('deleteAll').addEventListener('click', () => {
    if (!confirm('Are you sure you want to delete all saved content?')) return;
    chrome.storage.local.set({contentList: []}, () => {
      renderCategoryAndList();
    });
  });

  // Export All
  document.getElementById('exportAll').addEventListener('click', () => {
    chrome.storage.local.get({contentList: []}, res => {
      const data = res.contentList;
      if (data.length === 0) {
        alert('No content to export');
        return;
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `web-captures-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });
});
