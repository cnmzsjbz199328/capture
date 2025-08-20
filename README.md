.# Web Content Selector

A Chrome extension for capturing, categorizing, and managing web page content with ease.

---

## Features

- **Element Selection**: Click the extension button, then select any element on a web page to capture its text and HTML.
- **Custom Title & Categories**: Assign a title and one or more categories/tags to each capture for easy organization.
- **Category Filtering**: Quickly filter your saved content by category in the popup interface.
- **Content Management**: View, delete individual items, delete all, or export all your saved content as a JSON file.
- **Local Storage**: All data is stored locally in your browser—nothing is sent to any server.
- **Privacy Friendly**: No personal data is collected or transmitted.

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

---

## File Structure

```
chrome-extension/
├── background.js
├── content.js
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
- **No External Storage**: All data remains in your browser unless you export it.

---

## Privacy

See [Privacy Policy](../index.html) for details.  
**Summary:** This extension only stores the content you explicitly capture, and only in your local browser storage. No data is ever sent to any server.

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