# Frontend Modification Plan for Dual Storage (Revised)

This document outlines the revised plan to modify the Chrome extension to support both local storage and server-side storage. This version reflects the authentication mechanism based on database connection strings.

**Goal:** Allow users to choose their preferred storage method (local or server). The two methods should operate independently.

---

### Phase 1: UI for Storage and Connection Management

1.  **File to Modify:** `chrome-extension/popup.html`

2.  **Changes:**
    -   Add a storage selection dropdown menu at the top.
        ```html
        <div class="storage-option">
          <label for="storage-select">Storage:</label>
          <select id="storage-select">
            <option value="local">Local</option>
            <option value="server">Server</option>
          </select>
        </div>
        ```
    -   Add a section for server connection management. This section should be hidden by default and only appear when "Server" storage is selected.
        ```html
        <div id="server-connection-section" style="display: none;">
          <hr>
          <h4>Server Connection</h4>
          <input type="text" id="mongo-uri-input" placeholder="Enter your MongoDB Connection String">
          <button id="connect-btn">Connect</button>
          <div id="connection-status"></div>
          <button id="disconnect-btn" style="display: none;">Disconnect</button>
        </div>
        ```

3.  **File to Modify:** `chrome-extension/popup.js`

4.  **Changes:**
    -   **On Load:**
        -   Load the saved storage preference (`local` or `server`) from `chrome.storage.local` and set the dropdown value.
        -   If the preference is `server`, show the `#server-connection-section`.
        -   Check if a token and connection string are already stored in `chrome.storage.local`. If so, update the UI to show a "Connected" status and the "Disconnect" button.
    -   **Event Listener for Storage Selection:**
        -   When the user switches between "Local" and "Server", save the preference to `chrome.storage.local`.
        -   Show or hide the `#server-connection-section` based on the selection.
        -   Reload the capture list from the appropriate source (local storage or by calling the server API if a token exists).
    -   **Event Listener for "Connect" Button:**
        -   When clicked, take the value from the `#mongo-uri-input`.
        -   Make a `POST` request to the `/api/database/connect` endpoint with the connection string.
        -   On success, save the received `token` and the user's connection string to `chrome.storage.local`.
        -   Update the UI to show a "Connected" status, hide the connect button, and show the disconnect button.
        -   Reload the capture list from the server.
    -   **Event Listener for "Disconnect" Button:**
        -   When clicked, make a `POST` request to `/api/database/disconnect` with the stored token.
        -   Clear the token and connection string from `chrome.storage.local`.
        -   Update the UI to the disconnected state.

---

### Phase 2: Adapting Data Operations

This phase ensures that capturing, viewing, and deleting content respects the chosen storage mode.

1.  **File to Modify:** `chrome-extension/content.js` (for capturing data)

2.  **Changes:**
    -   Before saving a new capture, check the storage preference from `chrome.storage.local`.
    -   If `local`, use the existing logic to save to local storage.
    -   If `server`:
        -   Check for a valid token in `chrome.storage.local`. If no token exists, show an alert asking the user to connect to the server via the popup first.
        -   If a token exists, make a `fetch` call to `POST /api/capture`, sending the captured data and the token in the `Authorization` header.

3.  **File to Modify:** `chrome-extension/popup.js` (for viewing and deleting data)

4.  **Changes:**
    -   The `renderCategoryAndList` function must be updated to fetch data from the correct source based on the storage preference.
        -   If `local`, it reads from `chrome.storage.local`.
        -   If `server`, it calls `GET /api/captures` with the auth token. If no token is present, it should display a message prompting the user to connect.
    -   The `deleteSelected` function must also be updated:
        -   If `local`, it deletes from `chrome.storage.local`.
        -   If `server`, it calls `DELETE /api/captures/<id>` with the auth token.
    -   **Token Expiry Handling:** When making any API call, if the response is a 401 Unauthorized error, it means the token has expired. The code should handle this by clearing the old token from storage and updating the UI to prompt the user to connect again.

---

### Clarification on "Sync" Functionality

The button with `id="sync"` in the current `popup.js` should be removed. This plan implements a **storage mode switch**, not a synchronization feature. The local and server storage will be treated as two separate, independent containers for captured content, as per your requirement.