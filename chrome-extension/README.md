# Web Content Capture Extension

A powerful Chrome extension to capture, save, and manage content snippets directly from any webpage.

## Features

- **Sidebar Interface**: All functionality is neatly packed into a sidebar for easy access without interrupting your workflow.
- **One-Click Access**: Simply click the extension icon to toggle the sidebar open or closed.
- **Flexible Content Selection**: Activate the selector to highlight and capture any element on the page—text, images, containers, and more.
- **Dual Storage Options**: 
  - **Local**: Save your captures directly in your browser's local storage for quick and private access.
  - **Server**: Connect to a remote server instance to store, share, and sync your captures across devices.
- **Rich Data Capture**: Each capture saves the element's text, HTML structure, tags, source URL, and a timestamp.
- **In-App Management**: Browse, filter by category, view, and delete your captures directly from the sidebar.
- **Data Export**: Export all your captured data to a JSON file for backup or use in other applications.
- **Adjustable Width**: Customize the sidebar's width to your preference with three settings (Small, Medium, Large) for optimal screen real estate management.

## How to Use

1.  **Toggle Sidebar**: Click the extension icon in the Chrome toolbar to open or close the sidebar.
2.  **Configure Storage** (Optional): 
    - By default, content is saved locally.
    - To use server storage, select "Server" from the dropdown, enter your MongoDB connection URI, and click "Connect".
3.  **Capture Content**:
    - Click the **"Click to select content on page"** button at the top of the sidebar.
    - Move your mouse over the webpage; an orange box will highlight the element under your cursor.
    - Click on the desired element.
    - Enter a title and optional comma-separated categories/tags when prompted.
    - A confirmation will appear, and your capture will be saved.
4.  **View & Manage Captures**:
    - After a capture is saved, the list in the sidebar will automatically update.
    - Use the dropdown menus to filter your captures by category or select a specific item by title.
    - The selected item's details, including a rendered HTML preview, will appear in the lower panel.
5.  **Adjust Width**:
    - On the same row as the "Click to select..." button, click **S**, **M**, or **L** to instantly adjust the sidebar's width to your liking. The setting is saved automatically.

## Loading the Extension

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable "Developer mode" using the toggle switch in the top-right corner.
3.  Click the "Load unpacked" button.
4.  Select the directory where you have saved these extension files.
