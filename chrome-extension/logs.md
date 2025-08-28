Extensions
Load unpacked
Errors
Pack extension
Update
Developer mode
Clear all
Could not establish connection. Receiving end does not exist
Context
popup.html
Stack Trace
popup.js:11(anonymous function)
// Send a message to the content script of that tab
591011 12131415
16
chrome.tabs.sendMessage(tabs[0].id,{ action:"toggle sidebar"},(response)=>{if(chrome.runtime.lastError){
//Handle cases where the content script isn't ready
console.error(chrome.runtime.lastError.message);
}else{
//0ptional:Do something with the response from content scriptconsole.log(response.status);
window.close();//close the popup after clicking