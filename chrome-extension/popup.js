document.getElementById('activate').onclick = async () => {
  let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: () => window.dispatchEvent(new CustomEvent('activate-selector'))
  });
  document.getElementById('status').innerText = '选择器已激活，请在页面点击目标内容';
};

// 展示已保存的内容列表
function renderList() {
  chrome.storage.local.get({contentList: []}, res => {
    const list = res.contentList;
    const ul = document.getElementById('titleList');
    ul.innerHTML = '';
    list.forEach((item, idx) => {
      const li = document.createElement('li');
      li.textContent = item.title;
      li.style.cursor = 'pointer';
      li.onclick = () => showDetail(item);
      ul.appendChild(li);
    });
    if (list.length === 0) {
      ul.innerHTML = '<li style="color:#888;">暂无内容</li>';
      document.getElementById('contentDetail').innerHTML = '';
    }
  });
}


function showDetail(item) {
  const detail = document.getElementById('contentDetail');
  detail.innerHTML =
    `<div><b>标题：</b>${item.title}</div>` +
    `<div><b>标签：</b>${item.info.tag}</div>` +
    `<div><b>URL：</b><a href="${item.info.url}" target="_blank">${item.info.url}</a></div>` +
    `<div><b>HTML：</b><iframe style="width:100%;min-height:200px;border:1px solid #ccc;background:#fff;" sandbox="allow-same-origin" srcdoc='${escapeHtmlForIframe(item.info.html)}'></iframe></div>`;
}

function escapeHtmlForIframe(str) {
  // 用于srcdoc属性，需转义单引号和&
  return str.replace(/&/g, '&amp;').replace(/'/g, '&#39;');
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
}

// 初始化
document.addEventListener('DOMContentLoaded', renderList);
