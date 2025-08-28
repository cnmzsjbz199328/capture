// Listen for when the user clicks on the extension's action icon
chrome.action.onClicked.addListener((tab) => {
  // We can't inject scripts on certain pages, so we check for that
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('https://chrome.google.com')) {
    return;
  }

  // Send a message to the active tab to toggle the sidebar
  chrome.tabs.sendMessage(tab.id, { action: "toggle_sidebar" }, (response) => {
    if (chrome.runtime.lastError) {
      // This can happen if the content script is not yet injected, e.g., after an update.
      // The user just needs to refresh the page.
      console.log("Could not establish connection. Content script might not be loaded. Please refresh the page.");
    }
  });
});