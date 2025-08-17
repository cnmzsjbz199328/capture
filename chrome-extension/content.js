let selectorActive = false;
let highlightDiv;

window.addEventListener('activate-selector', () => {
  selectorActive = true;
  if (!highlightDiv) {
    highlightDiv = document.createElement('div');
    highlightDiv.style.position = 'absolute';
    highlightDiv.style.pointerEvents = 'none';
    highlightDiv.style.border = '2px solid #f90';
    highlightDiv.style.zIndex = 999999;
    document.body.appendChild(highlightDiv);
  }
});

document.addEventListener('mousemove', e => {
  if (!selectorActive) return;
  let el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el || el === highlightDiv) return;
  let rect = el.getBoundingClientRect();
  highlightDiv.style.left = rect.left + window.scrollX + 'px';
  highlightDiv.style.top = rect.top + window.scrollY + 'px';
  highlightDiv.style.width = rect.width + 'px';
  highlightDiv.style.height = rect.height + 'px';
});

document.addEventListener('click', e => {
  if (!selectorActive) return;
  e.preventDefault();
  e.stopPropagation();
  let el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el || el === highlightDiv) return;
  let info = {
    text: el.innerText,
    html: el.outerHTML,
    tag: el.tagName,
    url: location.href
  };
  let title = prompt('请输入本次抓取的标题：');
  if (!title) {
    alert('未填写标题，未保存。');
    selectorActive = false;
    if (highlightDiv) highlightDiv.remove();
    highlightDiv = null;
    return;
  }
  chrome.storage.local.get({contentList: []}, (res) => {
    let contentList = res.contentList;
    contentList.push({title, info});
    chrome.storage.local.set({contentList});
    alert('内容已抓取并保存！');
  });
  selectorActive = false;
  if (highlightDiv) highlightDiv.remove();
  highlightDiv = null;
}, true);
