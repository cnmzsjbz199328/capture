document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleSidebarBtn');

  toggleBtn.addEventListener('click', () => {
    // Find the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // Send a message to the content script of that tab
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggle_sidebar" }, (response) => {
        if (chrome.runtime.lastError) {
          // Handle cases where the content script isn't ready
          console.error(chrome.runtime.lastError.message);
        } else {
          // Optional: Do something with the response from content script
          console.log(response.status);
        }
        window.close(); // Close the popup after clicking
      });
    });
  });
});
