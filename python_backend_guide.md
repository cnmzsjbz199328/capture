# Python 后端开发与部署完整指南

本指南将引导您完成以下任务：
1.  **创建并初始化**一个云端 MongoDB 数据库。
2.  使用 **Python** 和 **Flask** 框架在本地开发一个简单的后端API服务。
3.  将该服务**部署**到云平台 Heroku。
4.  从您的 Chrome 扩展**连接并测试**后端服务。

---

## 零、准备工作

在开始之前，请确保您已安装好以下工具：

*   **Python 3**: [官方下载地址](https://www.python.org/downloads/)
*   **Pip**: Python 的包管理器（通常随Python一起安装）。
*   **Git**: [官方下载地址](https://git-scm.com/downloads)
*   **代码编辑器**: 推荐 [Visual Studio Code](https://code.visualstudio.com/)。
*   **Heroku CLI**: [安装指南](https://devcenter.heroku.com/articles/heroku-cli)。
*   一个免费的 [Heroku 账户](https://signup.heroku.com/)。

---

## 一、数据库设置与初始化

我们将使用 MongoDB Atlas，这是一个提供免费云数据库的服务。

### 1.1. 获取 MongoDB 数据库

1.  **注册账户**: 前往 [MongoDB Atlas 官网](https://www.mongodb.com/cloud/atlas/register) 注册一个免费账户。
2.  **创建项目**: 登录后，创建一个新项目（Project）。
3.  **构建数据库**: 在项目内，点击 "Build a Database"，选择 **Free** 免费套餐。
4.  **选择云服务商**: 选择一个云服务商和区域（例如 AWS / AP (Sydney)），然后点击 "Create Cluster"。
5.  **创建数据库用户**:
    *   在左侧菜单中找到 "Database Access"。
    *   点击 "Add New Database User"。
    *   设置用户名和密码（请务必记好），并授权 "Read and write to any database"。
6.  **配置网络访问**:
    *   在左侧菜单中找到 "Network Access"。
    *   点击 "Add IP Address"。
    *   选择 "ALLOW ACCESS FROM ANYWHERE"，即 `0.0.0.0/0`。
    *   > **注意**: 这只是为了开发方便。在生产环境中，您应该只允许您部署的后端服务器的IP地址访问。
7.  **获取连接字符串**:
    *   回到 "Database" 概览页面，点击您创建的集群的 "Connect" 按钮。
    *   选择 "Connect your application"。
    *   复制提供的连接字符串（Connection String）。它看起来像这样：
        ```
        mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
        ```
    *   将 `<username>` 和 `<password>` 替换为您刚刚创建的数据库用户的凭证。**请妥善保管此字符串，不要泄露。**

### 1.2. 数据库状态测试

创建一个简单的Python脚本来测试您是否能成功连接到数据库。

1.  在您的电脑上创建一个文件夹，例如 `db_test`。
2.  安装 `pymongo` 库:
    ```bash
    pip install pymongo
    ```
3.  创建一个名为 `test_db.py` 的文件，并写入以下内容：

    ```python
    import pymongo
    import sys

    # 替换成您自己的 MongoDB Atlas 连接字符串
    MONGO_URI = "mongodb+srv://your_user:your_password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"

    try:
        client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.server_info() # 强制建立连接
        print("✅ MongoDB 连接成功！")
        # 可以在这里指定一个数据库名，如果不存在，后续操作会自动创建
        db = client.get_database("web_capture_db")
        print(f"✅ 成功连接到数据库: {db.name}")

    except pymongo.errors.ConnectionFailure as e:
        print(f"❌ MongoDB 连接失败: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 发生未知错误: {e}")
        sys.exit(1)

    ```
4.  运行脚本进行测试：
    ```bash
    python test_db.py
    ```
    如果看到成功信息，说明您的数据库已经准备就绪！

---

## 二、Python 后端本地开发

现在我们来创建后端API服务。

### 2.1. 项目设置

1.  创建一个新的项目文件夹，例如 `python-backend`。
2.  在项目文件夹中打开终端，创建并激活Python虚拟环境：
    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate

    # macOS / Linux
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  创建 `requirements.txt` 文件，并写入以下依赖：
    ```
    Flask
    pymongo
    python-dotenv
    Flask-Cors
    gunicorn
    ```
4.  安装所有依赖：
    ```bash
    pip install -r requirements.txt
    ```

### 2.2. 编写后端代码

1.  在项目根目录创建 `.env` 文件，用于存放您的数据库连接字符串。这能确保敏感信息不被提交到代码库。
    ```
    MONGO_URI="mongodb+srv://your_user:your_password@cluster0.xxxxx.mongodb.net/web_capture_db?retryWrites=true&w=majority"
    ```
    > **注意**: 我们在URI的末尾添加了数据库名 `web_capture_db`。

2.  创建 `app.py` 文件，这是我们的主应用文件：

    ```python
    import os
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    from pymongo import MongoClient
    from dotenv import load_dotenv

    # 加载 .env 文件中的环境变量
    load_dotenv()

    # 初始化 Flask app
    app = Flask(__name__)
    # 允许所有来源的跨域请求，方便本地测试
    CORS(app)

    # ---
    # 数据库连接 ---
    MONGO_URI = os.getenv("MONGO_URI")
    if not MONGO_URI:
        raise Exception("❌ 必须设置 MONGO_URI 环境变量")

    try:
        client = MongoClient(MONGO_URI)
        # 指定数据库和集合
        db = client.get_database() # get_database() 会使用URI中指定的数据库
        collection = db.captured_content
        print("✅ 数据库连接成功！")
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        client = None

    # ---
    # API 路由 ---

    @app.route("/")
    def index():
        return "<h1>Python Backend is Running!</h1>"

    @app.route("/test_connection")
    def test_connection():
        """测试数据库连接状态"""
        if client and client.admin.command('ping'):
            return jsonify({"status": "success", "message": "数据库连接正常"}), 200
        else:
            return jsonify({"status": "error", "message": "数据库连接失败"}), 500

    @app.route("/api/data", methods=["POST"])
    def save_data():
        """接收前端数据并存入数据库"""
        if not client:
            return jsonify({"status": "error", "message": "数据库服务不可用"}), 503

        try:
            data = request.get_json()
            if not data:
                return jsonify({"status": "error", "message": "请求体中没有提供JSON数据"}), 400

            # 插入数据到 captured_content 集合
            result = collection.insert_one(data)
            
            return jsonify({
                "status": "success",
                "message": "数据保存成功",
                "inserted_id": str(result.inserted_id)
            }), 201

        except Exception as e:
            return jsonify({"status": "error", "message": f"保存数据时出错: {e}"}), 500

    # ---
    # 启动服务 ---
    if __name__ == "__main__":
        # 使用 debug=True 进行本地开发，它会自动重载代码
        app.run(debug=True, port=5000)

    ```

### 2.3. 本地测试

1.  在终端中运行 Flask 应用：
    ```bash
    python app.py
    ```
    您应该会看到服务在 `http://127.0.0.1:5000/` 上运行。

2.  打开另一个终端，使用 `curl` (或 Postman 等工具) 测试API：

    *   **测试数据库连接**:
        ```bash
        curl http://127.0.0.1:5000/test_connection
        ```
        如果一切正常，您会收到 `{"message":"数据库连接正常","status":"success"}`。

    *   **测试数据保存**:
        ```bash
        curl -X POST -H "Content-Type: application/json" \
             -d '''{"url": "https://example.com", "content": "This is a test."}''' \
             http://127.0.0.1:5000/api/data
        ```
        如果成功，您会收到包含 `inserted_id` 的成功消息。您可以登录 MongoDB Atlas 查看数据是否已写入。

---

## 三、Python 应用部署

我们将使用 Heroku 平台进行一键式部署。

### 3.1. 准备部署

1.  **创建 Procfile**: 在项目根目录创建 `Procfile` (没有文件后缀)，告诉 Heroku 如何运行您的应用。
    ```
    web: gunicorn app:app
    ```
2.  **初始化 Git 仓库**:
    ```bash
    git init
    git add .
    git commit -m "Initial backend setup"
    ```

### 3.2. 部署到 Heroku

1.  **登录 Heroku**:
    ```bash
    heroku login
    ```
2.  **创建 Heroku 应用**:
    ```bash
    # 您可以自定义一个唯一的应用名称
    heroku create your-unique-app-name 
    ```
3.  **在 Heroku 上设置环境变量**:
    ```bash
    # 将 your_atlas_connection_string 替换为您自己的完整连接字符串
    heroku config:set MONGO_URI="your_atlas_connection_string"
    ```
    > **这是最关键的一步**！确保不要在引号内再加引号。

4.  **推送代码到 Heroku 进行部署**:
    ```bash
    git push heroku main
    ```
    Heroku 会自动检测到这是一个Python项目，安装 `requirements.txt` 中的依赖，并使用 `Procfile` 中的命令启动服务。

### 3.3. 部署后测试

部署完成后，使用您的 Heroku 应用URL测试API：

```bash
# 将 your-unique-app-name 替换成您的 Heroku 应用名
curl https://your-unique-app-name.herokuapp.com/test_connection

curl -X POST -H "Content-Type: application/json" \
     -d '''{"url": "https://heroku.com", "content": "Deployed test."}''' \
     https://your-unique-app-name.herokuapp.com/api/data
```
如果测试通过，恭喜您，您的后端已经成功部署在云端！

---

## 四、前端连接与最终测试

最后一步是让您的Chrome扩展与这个后端服务对话。

### 4.1. 修改 Chrome 扩展

1.  **在 `popup.html` 中添加输入框**:
    ```html
    <!-- 在合适的位置添加 -->
    <hr>
    <div>
      <label for="backendUrl" style="display: block; margin-bottom: 4px;">Backend URL:</label>
      <input type="text" id="backendUrl" style="width: 95%; padding: 4px;" placeholder="https://your-app.herokuapp.com">
      <button id="saveUrl" style="margin-top: 4px;">Save</button>
    </div>
    <button id="syncData">Sync to Cloud</button>
    ```

2.  **更新 `popup.js`**:
    *   添加事件监听器来保存URL和同步数据。
    *   使用 `fetch` API 将 `localStorage` 中的数据发送到后端。

    ```javascript
    // 在 popup.js 的末尾添加

    const backendUrlInput = document.getElementById('backendUrl');
    const saveUrlBtn = document.getElementById('saveUrl');
    const syncDataBtn = document.getElementById('syncData');
    const statusDiv = document.getElementById('status'); // 假设您有一个显示状态的div

    // 页面加载时，尝试从存储中读取并显示URL
    chrome.storage.local.get(['backendUrl'], (result) => {
      if (result.backendUrl) {
        backendUrlInput.value = result.backendUrl;
      }
    });

    // 保存后端URL
    saveUrlBtn.addEventListener('click', () => {
      const url = backendUrlInput.value.trim();
      if (url) {
        chrome.storage.local.set({ backendUrl: url }, () => {
          statusDiv.textContent = 'URL saved!';
          setTimeout(() => statusDiv.textContent = '', 2000);
        });
      }
    });

    // 同步数据到云端
    syncDataBtn.addEventListener('click', async () => {
      const { backendUrl } = await chrome.storage.local.get(['backendUrl']);
      if (!backendUrl) {
        statusDiv.textContent = 'Please set backend URL first.';
        return;
      }

      // 假设您的数据存储在 localStorage 的 "capturedData" 键下
      const capturedData = JSON.parse(localStorage.getItem('capturedData') || '[]');
      if (capturedData.length === 0) {
        statusDiv.textContent = 'No data to sync.';
        return;
      }

      statusDiv.textContent = 'Syncing...';

      try {
        // 我们将所有数据作为一个数组发送
        const response = await fetch(`${backendUrl}/api/data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ items: capturedData }) // 将数据包装在一个对象中
        });

        const result = await response.json();

        if (response.ok) {
          statusDiv.textContent = `Sync successful! ID: ${result.inserted_id}`;
          // 可选：同步成功后清空本地数据
          // localStorage.removeItem('capturedData'); 
        } else {
          throw new Error(result.message || 'Unknown error');
        }

      } catch (error) {
        statusDiv.textContent = `Sync failed: ${error.message}`;
      }
    });
    ```
    > **注意**: 上述JS代码是一个示例，您需要根据您 `localStorage` 的实际数据结构进行调整。例如，您可能需要修改后端的 `/api/data` 路由来接收一个包含多个条目的数组 (`data['items']`) 并使用 `collection.insert_many()`。

### 4.2. 端到端测试流程

1.  重新加载您的Chrome扩展。
2.  在Popup弹窗中，输入您部署的Heroku后端URL (例如 `https://your-unique-app-name.herokuapp.com`) 并点击 "Save"。
3.  使用您的扩展捕捉一些网页内容。
4.  点击 "Sync to Cloud" 按钮。
5.  观察状态消息，并前往 MongoDB Atlas 确认新数据是否已成功写入数据库。

---

至此，您已完成整个开发、部署和集成的流程！

```