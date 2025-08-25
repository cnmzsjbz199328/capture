.# Web Content Selector

A Chrome extension for capturing, categorizing, and managing web page content with ease.

This feature helps privacy-conscious users save webpages they want to bookmark. Users can name their bookmarks so they can easily find them later. Bookmarks can still be viewed even when offline. Users can also export and delete data. For advanced users, it supports connecting to your own MongoDB database by providing a connection string, enabling cross-device access and persistent storage.

---

## Features

- **Element Selection**: Click the extension button, then select any element on a web page to capture its text and HTML.
- **Custom Title & Categories**: Assign a title and one or more categories/tags to each capture for easy organization.
- **Category Filtering**: Quickly filter your saved content by category in the popup interface.
- **Content Management**: View, delete individual items, delete all, or export all your saved content as a JSON file.
- **Dual Storage Options**: Choose to store your captured content either:
    - **Locally in your browser**: Data remains on your device, accessible offline.
    - **On a user-configured backend server (MongoDB)**: Connect to your own MongoDB database by providing a connection string. This enables cross-device access and persistent storage beyond browser data.
- **Privacy Friendly**: You control where your data is stored. For server storage, you provide the backend URL, ensuring data is sent only to your chosen server.

---

## Installation

1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select the `chrome-extension` folder.

---

## Usage

1. **Activate Selector**: Click the extension icon, then click "Click to select content on page".
2. **Select Element**: Hover over the desired element on the page (an orange border will appear), then click to capture.
3. **Enter Details**: Provide a title and (optionally) one or more categories/tags (comma separated).
4. **Manage Content**: In the popup, filter by category, view details, delete, or export your saved content.
5.  **Choose Storage & Connect to MongoDB**: In the popup, select "Local" or "Server" storage. If choosing "Server", enter your MongoDB connection string (e.g., `mongodb+srv://your_user:your_password@your_cluster.mongodb.net/your_database`) into the provided field. The extension will automatically append necessary options like `?retryWrites=true&w=majority`. Click "Connect" to establish the connection and retrieve your server-stored content.

---

## File Structure

```
chrome-extension/
├── background.js
├── content.js
├── config.js
├── icon16.png
├── icon48.png
├── icon128.png
├── manifest.json
├── popup.css
├── popup.html
├── popup.js
```

---

## Development Notes

- **Categories**: Each capture can have multiple categories/tags. Use the popup's category dropdown to filter.
- **Export/Import**: Use the "Export All" button to back up your data as a JSON file.
- **Backend Configuration**: The backend URL is configured in `chrome-extension/config.js`.

---

## Privacy

See [Privacy Policy](../index.html) for details.  
**Summary:** This extension allows you to store captured content either locally in your browser or on a backend server that you configure. No data is sent to any third-party server unless explicitly configured by you. You retain full control over your data.

---

## License

MIT License

---

## Screenshots

![Popup Example](example1.png)
![Element Selection](example2.png)

---

## Contact

For questions or suggestions, please open an issue