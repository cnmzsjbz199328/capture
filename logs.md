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
INFO:database:Establishing new MongoDB connection for mongodb://localhost:27017/testdb
INFO:database:创建连接令牌成功: f6bafa5e9cf5cad1
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:18:19] "POST /api/database/connect HTTP/1.1" 200 -
WARNING:database:令牌 f6bafa5e9cf5cad1 对应的连接已失效
INFO:database:已移除过期连接令牌: f6bafa5e9cf5cad1
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:18:52] "POST /api/capture HTTP/1.1" 401 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:18:54] "GET /api/captures HTTP/1.1" 401 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:18:56] "GET /api/categories HTTP/1.1" 401 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:18:58] "GET /api/search?q=测试 HTTP/1.1" 401 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:19:00] "POST /api/database/disconnect HTTP/1.1" 400 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:19:28] "OPTIONS /api/database/connect HTTP/1.1" 200 -
INFO:database:Establishing new MongoDB connection for mongodb+srv://tangjiang199328:iXdggF8QoyAYJRbl@cluster0.7nalohs.mongodb.net/capture?retryWrites=true&w=majority
INFO:database:创建连接令牌成功: 1bf0141caf8f76f6
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:19:28] "POST /api/database/connect HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:19:44] "OPTIONS /api/database/connect HTTP/1.1" 200 -
INFO:database:Establishing new MongoDB connection for mongodb+srv://tj15982183241:lqC4PvDOIEDLzBqC@cluster0.3rr2uhr.mongodb.net/capture?retryWrites=true&w=majority
INFO:database:创建连接令牌成功: e79f3bae4034e1b3
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:19:44] "POST /api/database/connect HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:20:15] "OPTIONS /api/capture HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:20:16] "POST /api/capture HTTP/1.1" 201 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:20:18] "OPTIONS /api/captures?page=1&limit=10 HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:20:19] "GET /api/captures?page=1&limit=10 HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:20:24] "OPTIONS /api/captures/68aafc7832b3f7b0a8581dda HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:20:24] "GET /api/captures/68aafc7832b3f7b0a8581dda HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:20:26] "PUT /api/captures/68aafc7832b3f7b0a8581dda HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:20:30] "OPTIONS /api/captures/68aafc7832b3f7b0a8581dda HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:20:31] "DELETE /api/captures/68aafc7832b3f7b0a8581dda HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:20:33] "OPTIONS /api/categories HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:20:33] "GET /api/categories HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:20:36] "OPTIONS /api/search?q=测试&page=1&limit=10 HTTP/1.1" 200 -
ERROR:routes:搜索捕获内容失败
Traceback (most recent call last):
  File "C:\Users\tj169\OneDrive - Flinders\work\capture\backend\routes.py", line 242, in search_captures
    result = db_service.get_captures(token, page=page, limit=limit, search=query)
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\OneDrive - Flinders\work\capture\backend\database.py", line 165, in get_captures
    captures = list(cursor)
               ^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\cursor.py", line 1285, in __next__     
    return self.next()
           ^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\cursor.py", line 1261, in next
    if len(self._data) or self._refresh():
                          ^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\cursor.py", line 1209, in _refresh     
    self._send_message(q)
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\cursor.py", line 1104, in _send_message
    response = client._run_operation(
               ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\_csot.py", line 125, in csot_wrapper
    return func(self, *args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\mongo_client.py", line 1932, in _run_operation
    return self._retryable_read(
           ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\mongo_client.py", line 2041, in _retryable_read
    return self._retry_internal(
           ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\_csot.py", line 125, in csot_wrapper
    return func(self, *args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\mongo_client.py", line 2008, in _retry_internal
    ).run()
      ^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\mongo_client.py", line 2745, in run    
    return self._read() if self._is_read else self._write()
           ^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\mongo_client.py", line 2906, in _read  
    return self._func(self._session, self._server, conn, read_pref)  # type: ignore
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\mongo_client.py", line 1923, in _cmd   
    return server.run_operation(
           ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\helpers.py", line 47, in inner
    return func(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\server.py", line 227, in run_operation 
    _check_command_response(first, conn.max_wire_version, pool_opts=conn.opts)  # type:ignore[has-type]
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\helpers_shared.py", line 284, in _check_command_response
    raise OperationFailure(errmsg, code, response, max_wire_version)
pymongo.errors.OperationFailure: text index required for $text query, full error: {'ok': 0.0, 'errmsg': 'text index required for $text query', 'code': 27, 'codeName': 'IndexNotFound', '$clusterTime': {'clusterTime': Timestamp(1756036236, 46), 'signature': {'hash': b'g\xe3\xb3#i+\xc6I\xad\xdb\x88\xb38\xbf\x9d\xa7\x04)\xd6\xad', 'keyId': 7503930322837307432}}, 'operationTime': Timestamp(1756036236, 46)}
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:20:37] "GET /api/search?q=测试&page=1&limit=10 HTTP/1.1" 500 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:21:29] "OPTIONS /api/database/disconnect HTTP/1.1" 200 -
INFO:database:已移除过期连接令牌: e79f3bae4034e1b3
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:21:29] "POST /api/database/disconnect HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:22:03] "OPTIONS /api/database/connect HTTP/1.1" 200 -
INFO:database:创建连接令牌成功: 52759c88b32e7379
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:22:04] "POST /api/database/connect HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:22:21] "OPTIONS /api/capture HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:22:21] "POST /api/capture HTTP/1.1" 201 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:22:24] "OPTIONS /api/captures?page=1&limit=10 HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:22:24] "GET /api/captures?page=1&limit=10 HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:22:34] "OPTIONS /api/search?q=测试&page=1&limit=10 HTTP/1.1" 200 -
ERROR:routes:搜索捕获内容失败
Traceback (most recent call last):
  File "C:\Users\tj169\OneDrive - Flinders\work\capture\backend\routes.py", line 242, in search_captures
    result = db_service.get_captures(token, page=page, limit=limit, search=query)
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\OneDrive - Flinders\work\capture\backend\database.py", line 165, in get_captures
    captures = list(cursor)
               ^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\cursor.py", line 1285, in __next__     
    return self.next()
           ^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\cursor.py", line 1261, in next
    if len(self._data) or self._refresh():
                          ^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\cursor.py", line 1209, in _refresh     
    self._send_message(q)
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\cursor.py", line 1104, in _send_message
    response = client._run_operation(
               ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\_csot.py", line 125, in csot_wrapper
    return func(self, *args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\mongo_client.py", line 1932, in _run_operation
    return self._retryable_read(
           ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\mongo_client.py", line 2041, in _retryable_read
    return self._retry_internal(
           ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\_csot.py", line 125, in csot_wrapper
    return func(self, *args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\mongo_client.py", line 2008, in _retry_internal
    ).run()
      ^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\mongo_client.py", line 2745, in run    
    return self._read() if self._is_read else self._write()
           ^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\mongo_client.py", line 2906, in _read  
    return self._func(self._session, self._server, conn, read_pref)  # type: ignore
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\mongo_client.py", line 1923, in _cmd   
    return server.run_operation(
           ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\helpers.py", line 47, in inner
    return func(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\synchronous\server.py", line 227, in run_operation 
    _check_command_response(first, conn.max_wire_version, pool_opts=conn.opts)  # type:ignore[has-type]
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\tj169\AppData\Local\Programs\Python\Python312\Lib\site-packages\pymongo\helpers_shared.py", line 284, in _check_command_response
    raise OperationFailure(errmsg, code, response, max_wire_version)
pymongo.errors.OperationFailure: text index required for $text query, full error: {'ok': 0.0, 'errmsg': 'text index required for $text query', 'code': 27, 'codeName': 'IndexNotFound', '$clusterTime': {'clusterTime': Timestamp(1756036354, 14), 'signature': {'hash': b'\xbfc\xe7+\x14\x14\xa6YM\xbe\xef\x98v7\xac\x94N\xe6\xc5J', 'keyId': 7488051132959293455}}, 'operationTime': Timestamp(1756036354, 14)}
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:22:34] "GET /api/search?q=测试&page=1&limit=10 HTTP/1.1" 500 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:22:39] "OPTIONS /api/categories HTTP/1.1" 200 -
INFO:werkzeug:127.0.0.1 - - [24/Aug/2025 21:22:39] "GET /api/categories HTTP/1.1" 200 -
