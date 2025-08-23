# Web Content Capture Backend

基于Flask的Web内容捕获后端服务，提供完整的CRUD API接口。

## 项目结构

```
backend/
├── app.py                 # 主应用入口
├── config.py             # 配置管理
├── database.py           # 数据库服务
├── routes.py             # API路由
├── test_api.py           # API测试脚本
├── requirements.txt      # 依赖文件
└── .env                  # 环境变量（需要创建）
```

## 快速开始

### 1. 环境准备

确保已安装Python 3.8+和pip

### 2. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 3. 配置环境变量

创建 `.env` 文件：

```ini
MONGO_URI="mongodb+srv://用户名:密码@cluster0.3rr2uhr.mongodb.net/capture?retryWrites=true&w=majority"
COLLECTION_NAME="captured_content"
FLASK_ENV="development"
FLASK_DEBUG="True"
```

### 4. 启动服务

```bash
python app.py
```

服务将在 `http://localhost:5000` 启动

### 5. 测试API

```bash
python test_api.py
```

## API接口

### 基础接口

- `GET /` - 服务状态
- `GET /test_connection` - 测试数据库连接

### 内容管理

- `POST /api/capture` - 创建新内容
- `GET /api/captures` - 获取内容列表
- `GET /api/captures/:id` - 获取单个内容
- `PUT /api/captures/:id` - 更新内容
- `DELETE /api/captures/:id` - 删除内容

### 分类和搜索

- `GET /api/categories` - 获取所有分类
- `GET /api/search?q=关键词` - 搜索内容

## 数据格式

### 创建内容示例

```json
{
  "title": "内容标题",
  "text": "纯文本内容",
  "html": "<p>HTML内容</p>",
  "tag": "p",
  "url": "https://example.com",
  "categories": ["分类1", "分类2"]
}
```

### 响应格式

```json
{
  "status": "success",
  "message": "操作成功",
  "data": {
    // 具体数据
  }
}
```

## 配置说明

### 环境变量

- `MONGO_URI`: MongoDB连接字符串（必需）
- `COLLECTION_NAME`: 集合名称（默认：captured_content）
- `FLASK_ENV`: 运行环境（development/production）
- `FLASK_DEBUG`: 调试模式（True/False）
- `LOG_LEVEL`: 日志级别（DEBUG/INFO/WARNING/ERROR）

### 分页参数

- `page`: 页码（默认：1）
- `limit`: 每页数量（默认：20，最大：100）

## 开发说明

### 代码特点

- **模块化设计**: 配置、数据库、路由分离
- **错误处理**: 完善的异常处理和日志记录
- **数据验证**: 输入数据验证和清理
- **RESTful API**: 符合REST规范的接口设计

### 扩展建议

- 添加用户认证和授权
- 实现数据备份和恢复
- 添加API限流和监控
- 支持更多数据格式

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MONGO_URI是否正确
   - 确认网络连接和防火墙设置

2. **端口被占用**
   - 修改app.py中的端口号
   - 或停止占用端口的其他服务

3. **依赖安装失败**
   - 升级pip: `pip install --upgrade pip`
   - 使用虚拟环境: `python -m venv venv`

## 许可证

MIT License
