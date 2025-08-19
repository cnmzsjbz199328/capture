let selectorActive = false;
let highlightDiv = null;

// 清理函数
function cleanup() {
  selectorActive = false;
  if (highlightDiv && highlightDiv.parentNode) {
    highlightDiv.remove();
  }
  highlightDiv = null;
}

// 激活选择器
function activateSelector() {
  console.log('Activating selector');
  cleanup(); // 先清理之前的状态
  
  selectorActive = true;
  
  // 创建高亮框
  if (!highlightDiv) {
    highlightDiv = document.createElement('div');
    highlightDiv.style.position = 'absolute';
    highlightDiv.style.pointerEvents = 'none';
    highlightDiv.style.border = '2px solid #f90';
    highlightDiv.style.zIndex = '999999';
    document.body.appendChild(highlightDiv);
  }
}

// 监听激活事件 - 每次都重新绑定
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

// 点击捕获
document.addEventListener('click', (e) => {
  if (!selectorActive) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el || el === highlightDiv) {
    cleanup();
    return;
  }
  
  // 立即清理，避免干扰prompt
  cleanup();
  
  const info = {
    text: el.innerText || '',
    html: el.outerHTML || '',
    tag: el.tagName || '',
    url: location.href
  };
  
  const title = prompt('请输入本次抓取的标题：');
  if (!title || !title.trim()) {
    alert('未填写标题，未保存。');
    return;
  }
  
  // 简单直接的存储
  chrome.storage.local.get({contentList: []}, (res) => {
    const contentList = res.contentList || [];
    contentList.push({
      title: title.trim(),
      info: info,
      timestamp: Date.now()
    });
    
    chrome.storage.local.set({contentList}, () => {
      if (chrome.runtime.lastError) {
        alert('保存失败：' + chrome.runtime.lastError.message);
      } else {
        alert('内容已抓取并保存！');
      }
    });
  });
}, true);

// ESC取消
document.addEventListener('keydown', (e) => {
  if (selectorActive && e.key === 'Escape') {
    cleanup();
    alert('已取消选择');
  }
});

console.log('Content selector ready');
