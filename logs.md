AttributeError: 'DatabaseService' object has no attribute 'close'
PS C:\Users\tj169\OneDrive - Flinders\work\capture\backend> python app.py
INFO:app:🚀 启动Web Content Capture后端服务...
INFO:app:📊 数据库: captured_content
INFO:app:🔧 调试模式: True
 * Serving Flask app 'app'
 * Debug mode: on
INFO:werkzeug:WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.0.107:5000
INFO:werkzeug:Press CTRL+C to quit
INFO:werkzeug: * Restarting with stat
INFO:app:🚀 启动Web Content Capture后端服务...
INFO:app:📊 数据库: captured_content
INFO:app:🔧 调试模式: True
WARNING:werkzeug: * Debugger is active!
INFO:werkzeug: * Debugger PIN: 218-411-572
INFO:database:Establishing new MongoDB connection for mongodb+srv://tj15982183241:lqC4PvDOIEDLzBqC@cluster0.3rr2uhr.mongodb.net/capture?retryWrites=true&w=majority
INFO:database:Ensured text index exists for collection 'captured_content'
INFO:database:创建连接令牌成功: afdbfc41900a7294
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:36:32] "POST /api/database/connect HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:36:32] "GET /api/captures?category= HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:36:32] "GET /api/categories HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:36:54] "GET /api/captures?category=LKJH HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:36:55] "GET /api/categories HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:36:58] "GET /api/captures?category=job HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:36:59] "GET /api/categories HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:37:03] "GET /api/captures?category=lll HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:37:03] "GET /api/categories HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:37:11] "GET /api/captures?category=压力测试 HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:37:11] "GET /api/categories HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:37:15] "GET /api/captures?category= HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:37:15] "GET /api/categories HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:37:22] "GET /api/captures?category=job HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:37:22] "GET /api/categories HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:37:47] "GET /api/captures?category= HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:37:47] "GET /api/categories HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:37:58] "GET /api/captures?category=LKJH HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [25/Aug/2025 09:37:58] "GET /api/categories HTTP/1.1" 200 -

{"_id":{"$oid":"68ab05f6f6042019a9958e34"},"title":"KJH","text":"📝 创建捕获内容\n     \n创建内容\n📋 获取捕获列表\n   \n获取列表 带筛选获取\n🔍 获取单个内容\n\n获取内容\n✏️ 更新捕获内容\n  \n更新内容\n🗑️ 删除捕获内容\n\n删除内容\n🏷️ 获取分类列表\n获取分类\n🔍 搜索内容\n  \n搜索内容\n⚡ 批量测试\n运行所有测试 清空所有结果 压力测试","html":"<div class=\"test-grid\">\n            <!-- 创建捕获内容测试 -->\n            <div class=\"test-card\">\n                <h3>📝 创建捕获内容</h3>\n                <input type=\"text\" id=\"createTitle\" class=\"test-input\" placeholder=\"标题\" value=\"测试标题\">\n                <input type=\"text\" id=\"createText\" class=\"test-input\" placeholder=\"文本内容\" value=\"这是测试内容\">\n                <input type=\"text\" id=\"createHtml\" class=\"test-input\" placeholder=\"HTML内容\" value=\"&lt;p&gt;这是测试HTML&lt;/p&gt;\">\n                <input type=\"text\" id=\"createTag\" class=\"test-input\" placeholder=\"HTML标签\" value=\"p\">\n                <input type=\"text\" id=\"createUrl\" class=\"test-input\" placeholder=\"URL\" value=\"https://example.com\">\n                <input type=\"text\" id=\"createCategories\" class=\"test-input\" placeholder=\"分类(逗号分隔)\" value=\"测试,示例\">\n                <br>\n                <button class=\"test-button\" onclick=\"testCreateCapture()\">创建内容</button>\n                <div class=\"result-area\" id=\"createResult\"></div>\n            </div>\n\n            <!-- 获取捕获列表测试 -->\n            <div class=\"test-card\">\n                <h3>📋 获取捕获列表</h3>\n                <input type=\"number\" id=\"listPage\" class=\"test-input\" placeholder=\"页码\" value=\"1\">\n                <input type=\"number\" id=\"listLimit\" class=\"test-input\" placeholder=\"每页数量\" value=\"10\">\n                <input type=\"text\" id=\"listCategory\" class=\"test-input\" placeholder=\"分类筛选\" value=\"\">\n                <input type=\"text\" id=\"listSearch\" class=\"test-input\" placeholder=\"搜索关键词\" value=\"\">\n                <br>\n                <button class=\"test-button\" onclick=\"testGetCaptures()\">获取列表</button>\n                <button class=\"test-button warning\" onclick=\"testGetCapturesWithFilters()\">带筛选获取</button>\n                <div class=\"result-area\" id=\"listResult\"></div>\n            </div>\n\n            <!-- 获取单个捕获内容测试 -->\n            <div class=\"test-card\">\n                <h3>🔍 获取单个内容</h3>\n                <input type=\"text\" id=\"getSingleId\" class=\"test-input\" placeholder=\"内容ID\">\n                <br>\n                <button class=\"test-button\" onclick=\"testGetSingleCapture()\">获取内容</button>\n                <div class=\"result-area\" id=\"singleResult\"></div>\n            </div>\n\n            <!-- 更新捕获内容测试 -->\n            <div class=\"test-card\">\n                <h3>✏️ 更新捕获内容</h3>\n                <input type=\"text\" id=\"updateId\" class=\"test-input\" placeholder=\"内容ID\">\n                <input type=\"text\" id=\"updateTitle\" class=\"test-input\" placeholder=\"新标题\" value=\"更新后的标题\">\n                <input type=\"text\" id=\"updateCategories\" class=\"test-input\" placeholder=\"新分类\" value=\"更新,分类\">\n                <br>\n                <button class=\"test-button\" onclick=\"testUpdateCapture()\">更新内容</button>\n                <div class=\"result-area\" id=\"updateResult\"></div>\n            </div>\n\n            <!-- 删除捕获内容测试 -->\n            <div class=\"test-card\">\n                <h3>🗑️ 删除捕获内容</h3>\n                <input type=\"text\" id=\"deleteId\" class=\"test-input\" placeholder=\"内容ID\">\n                <br>\n                <button class=\"test-button danger\" onclick=\"testDeleteCapture()\">删除内容</button>\n                <div class=\"result-area\" id=\"deleteResult\"></div>\n            </div>\n\n            <!-- 获取分类测试 -->\n            <div class=\"test-card\">\n                <h3>🏷️ 获取分类列表</h3>\n                <button class=\"test-button\" onclick=\"testGetCategories()\">获取分类</button>\n                <div class=\"result-area\" id=\"categoriesResult\"></div>\n            </div>\n\n            <!-- 搜索测试 -->\n            <div class=\"test-card\">\n                <h3>🔍 搜索内容</h3>\n                <input type=\"text\" id=\"searchQuery\" class=\"test-input\" placeholder=\"搜索关键词\" value=\"测试\">\n                <input type=\"number\" id=\"searchPage\" class=\"test-input\" placeholder=\"页码\" value=\"1\">\n                <input type=\"number\" id=\"searchLimit\" class=\"test-input\" placeholder=\"每页数量\" value=\"10\">\n                <br>\n                <button class=\"test-button\" onclick=\"testSearch()\">搜索内容</button>\n                <div class=\"result-area\" id=\"searchResult\"></div>\n            </div>\n\n            <!-- 批量测试 -->\n            <div class=\"test-card\">\n                <h3>⚡ 批量测试</h3>\n                <button class=\"test-button\" onclick=\"runAllTests()\">运行所有测试</button>\n                <button class=\"test-button warning\" onclick=\"clearAllResults()\">清空所有结果</button>\n                <button class=\"test-button danger\" onclick=\"stressTest()\">压力测试</button>\n                <div class=\"result-area\" id=\"batchResult\"></div>\n            </div>\n        </div>","tag":"DIV","url":"http://127.0.0.1:5500/test.html","categories":["LKJH"],"timestamp":{"$numberLong":"1756038646123"}}