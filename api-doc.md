# Web Content Capture API Documentation

This document provides details on the API endpoints for the Web Content Capture backend.

## Authentication

Most API endpoints (except for `/database/connect` and `/status`) require a Bearer Token to be passed in the `Authorization` header.

**Header Format:**
```
Authorization: Bearer <YOUR_TOKEN>
```

---

## Database Management

### 1. Connect to Database

- **Endpoint:** `POST /api/database/connect`
- **Description:** Establishes a connection to a MongoDB database and returns a connection token for subsequent requests.
- **Request Body:**
  ```json
  {
    "mongo_uri": "<your_mongodb_connection_string>",
    "collection_name": "<your_collection_name>" // Optional, defaults to 'captured_content'
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "数据库连接成功",
    "data": {
      "token": "<connection_token>",
      "database": "<database_name>",
      "collection": "<collection_name>",
      "expires_in": 3600
    }
  }
  ```
- **Error Response (400 Bad Request):**
  ```json
  {
    "status": "error",
    "message": "必须提供MongoDB连接字符串"
  }
  ```

### 2. Disconnect from Database

- **Endpoint:** `POST /api/database/disconnect`
- **Description:** Revokes a connection token and disconnects from the database.
- **Request Body:**
  ```json
  {
    "token": "<your_connection_token>"
  }
  ```
  *Note: The token can also be provided via the `Authorization` header.* 
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "数据库连接已断开"
  }
  ```
- **Error Response (400 Bad Request):**
  ```json
  {
    "status": "error",
    "message": "无效的连接令牌"
  }
  ```

---

## Content Capture (CRUD)

### 1. Create a Capture

- **Endpoint:** `POST /api/capture`
- **Authentication:** Bearer Token required.
- **Description:** Creates a new content capture.
- **Request Body:**
  ```json
  {
    "title": "My Capture Title", // Required
    "text": "The captured text content.",
    "html": "<p>The captured HTML content.</p>",
    "url": "https://example.com",
    "categories": ["tech", "programming"]
    // You can include other fields as needed
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "内容捕获成功",
    "data": {
      "id": "<newly_created_capture_id>"
    }
  }
  ```

### 2. Get a List of Captures

- **Endpoint:** `GET /api/captures`
- **Authentication:** Bearer Token required.
- **Description:** Retrieves a paginated list of captures. Can be filtered by category or searched.
- **Query Parameters:**
  - `page` (integer, optional, default: 1): The page number to retrieve.
  - `limit` (integer, optional, default: 20): The number of items per page (max 100).
  - `category` (string, optional): Filter captures by a specific category.
  - `search` (string, optional): A search term to find in the title or text of captures.
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "captures": [
        {
          "_id": "<capture_id>",
          "title": "My Capture Title",
          // ... other fields
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 20
    }
  }
  ```

### 3. Get a Single Capture

- **Endpoint:** `GET /api/captures/<capture_id>`
- **Authentication:** Bearer Token required.
- **Description:** Retrieves a single capture by its ID.
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "_id": "<capture_id>",
      "title": "My Capture Title",
      // ... other fields
    }
  }
  ```
- **Error Response (404 Not Found):**
  ```json
  {
    "status": "error",
    "message": "内容不存在"
  }
  ```

### 4. Update a Capture

- **Endpoint:** `PUT /api/captures/<capture_id>`
- **Authentication:** Bearer Token required.
- **Description:** Updates an existing capture.
- **Request Body:**
  ```json
  {
    "title": "Updated Title",
    "categories": ["new", "updated"]
    // Include any fields to update
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "更新成功"
  }
  ```

### 5. Delete a Capture

- **Endpoint:** `DELETE /api/captures/<capture_id>`
- **Authentication:** Bearer Token required.
- **Description:** Deletes a capture by its ID.
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "删除成功"
  }
  ```

---

## Categories & Search

### 1. Get All Categories

- **Endpoint:** `GET /api/categories`
- **Authentication:** Bearer Token required.
- **Description:** Retrieves a list of all unique category names.
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "categories": ["tech", "programming", "news"]
    }
  }
  ```

### 2. Search Captures

- **Endpoint:** `GET /api/search`
- **Authentication:** Bearer Token required.
- **Description:** Performs a text search across all captures.
- **Query Parameters:**
  - `q` (string, required): The search query.
  - `page` (integer, optional, default: 1): The page number.
  - `limit` (integer, optional, default: 20): The number of items per page.
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": { ... }, // Same format as GET /api/captures
    "query": "<search_query>"
  }
  ```

---

## System

### 1. API Status

- **Endpoint:** `GET /api/status`
- **Authentication:** None required.
- **Description:** Checks if the API is running.
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "API is running"
  }
  ```
