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

// Display saved content dropdown
function renderList() {
  chrome.storage.local.get({contentList: []}, res => {
    const list = res.contentList;
    const select = document.getElementById('titleDropdown');
    select.innerHTML = '<option value="" disabled selected>Select saved content</option>';
    
    list.forEach((item, idx) => {
      const option = document.createElement('option');
      option.value = idx;
      option.textContent = item.title;
      select.appendChild(option);
    });
    
    if (list.length === 0) {
      select.innerHTML = '<option value="" disabled selected>No content available</option>';
    }
    
    // Ensure detail area always exists
    const detail = document.getElementById('contentDetail');
    if (!detail.innerHTML) {
      detail.innerHTML = '<div style="color:#888;text-align:center;padding-top:100px;">Select an item to view details</div>';
    }
  });
}


function showDetail(item) {
  const detail = document.getElementById('contentDetail');
  detail.innerHTML =
    `<div><b>URL:</b><a href="${item.info.url}" target="_blank" style="color:#0066cc;">${item.info.url}</a></div>` +
    `<div style="margin-top:8px;"><b>HTML:</b></div>` +
    `<iframe style="width:100%;min-height:200px;border:1px solid #ccc;background:#fff;margin-top:4px;" sandbox="allow-same-origin" srcdoc='${escapeHtmlForIframe(item.info.html)}'></iframe>`;
}

function escapeHtmlForIframe(str) {
  // For srcdoc attribute, need to escape single quotes and &
  return str.replace(/&/g, '&amp;').replace(/'/g, '&#39;');
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderList();
  
  // Listen for dropdown selection events
  const select = document.getElementById('titleDropdown');
  select.addEventListener('change', function() {
    const selectedIndex = this.value;
    if (selectedIndex !== '') {
      chrome.storage.local.get({contentList: []}, res => {
        const item = res.contentList[selectedIndex];
        if (item) {
          showDetail(item);
        }
      });
    }
  });

  // Delete selected button
  document.getElementById('deleteSelected').addEventListener('click', () => {
    const select = document.getElementById('titleDropdown');
    const selectedIndex = select.value;
    
    if (!selectedIndex || selectedIndex === '') {
      alert('Please select an item first');
      return;
    }
    
    chrome.storage.local.get({contentList: []}, res => {
      const list = res.contentList;
      const index = parseInt(selectedIndex);
      
      if (index >= 0 && index < list.length) {
        list.splice(index, 1);
        chrome.storage.local.set({contentList: list}, () => {
          renderList();
          document.getElementById('contentDetail').innerHTML = '<div style="color:#888;text-align:center;padding-top:100px;">Select an item to view details</div>';
          alert('Deleted successfully');
        });
      }
    });
  });

  // Export all button
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
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `web-captures-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });

  // Delete all button
  document.getElementById('deleteAll').addEventListener('click', () => {
    chrome.storage.local.get({contentList: []}, res => {
      const data = res.contentList;
      if (data.length === 0) {
        alert('No content to delete');
        return;
      }
      
      chrome.storage.local.set({contentList: []}, () => {
        renderList();
        document.getElementById('contentDetail').innerHTML = '<div style="color:#888;text-align:center;padding-top:100px;">Select an item to view details</div>';
        alert('All items deleted successfully');
      });
    });
  });
});
