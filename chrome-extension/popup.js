document.getElementById('activate').onclick = async () => {
  let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: () => window.dispatchEvent(new CustomEvent('activate-selector'))
  });
  document.getElementById('status').innerText = '选择器已激活，请在页面点击目标内容';
};

// 展示已保存的内容下拉框
function renderList() {
  chrome.storage.local.get({contentList: []}, res => {
    const list = res.contentList;
    const select = document.getElementById('titleDropdown');
    select.innerHTML = '<option value="" disabled selected>请选择已保存内容</option>';
    
    list.forEach((item, idx) => {
      const option = document.createElement('option');
      option.value = idx;
      option.textContent = item.title;
      select.appendChild(option);
    });
    
    if (list.length === 0) {
      select.innerHTML = '<option value="" disabled selected>暂无内容</option>';
    }
    
    // 确保详情区域始终存在
    const detail = document.getElementById('contentDetail');
    if (!detail.innerHTML) {
      detail.innerHTML = '<div style="color:#888;text-align:center;padding-top:100px;">选择一个条目查看详情</div>';
    }
  });
}


function showDetail(item) {
  const detail = document.getElementById('contentDetail');
  detail.innerHTML =
    `<div><b>URL：</b><a href="${item.info.url}" target="_blank" style="color:#0066cc;">${item.info.url}</a></div>` +
    `<div style="margin-top:8px;"><b>HTML：</b></div>` +
    `<iframe style="width:100%;min-height:200px;border:1px solid #ccc;background:#fff;margin-top:4px;" sandbox="allow-same-origin" srcdoc='${escapeHtmlForIframe(item.info.html)}'></iframe>`;
}

function escapeHtmlForIframe(str) {
  // 用于srcdoc属性，需转义单引号和&
  return str.replace(/&/g, '&amp;').replace(/'/g, '&#39;');
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  renderList();
  
  // 监听下拉框选择事件
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

  // 删除所选按钮
  document.getElementById('deleteSelected').addEventListener('click', () => {
    const select = document.getElementById('titleDropdown');
    const selectedIndex = select.value;
    
    if (!selectedIndex || selectedIndex === '') {
      alert('请先选择一个条目');
      return;
    }
    
    if (!confirm('确定要删除这个条目吗？')) {
      return;
    }
    
    chrome.storage.local.get({contentList: []}, res => {
      const list = res.contentList;
      const index = parseInt(selectedIndex);
      
      if (index >= 0 && index < list.length) {
        list.splice(index, 1);
        chrome.storage.local.set({contentList: list}, () => {
          renderList();
          document.getElementById('contentDetail').innerHTML = '<div style="color:#888;text-align:center;padding-top:100px;">选择一个条目查看详情</div>';
          alert('删除成功');
        });
      }
    });
  });

  // 导出全部按钮
  document.getElementById('exportAll').addEventListener('click', () => {
    chrome.storage.local.get({contentList: []}, res => {
      const data = res.contentList;
      if (data.length === 0) {
        alert('没有可导出的内容');
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
});
