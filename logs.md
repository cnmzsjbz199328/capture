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
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:33:02] "OPTIONS /api/database/connect HTTP/1.1" 200 -
INFO:database:Establishing new MongoDB connection for mongodb+srv://tangjiang199328:iXdggF8QoyAYJRbl@cluster0.7nalohs.mongodb.net/capture?retryWrites=true&w=majority
INFO:database:Ensured text index exists for collection 'captured_content'
INFO:database:创建连接令牌成功: 17c52c9543b2d873
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:33:04] "POST /api/database/connect HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:33:12] "OPTIONS /api/search?q=测试&page=1&limit=10 HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:33:13] "GET /api/search?q=测试&page=1&limit=10 HTTP/1.1" 200 -