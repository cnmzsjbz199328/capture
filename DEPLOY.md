# 部署到Vercel指南

## 前置条件

1. 安装Vercel CLI
2. 确保后端API测试通过
3. 准备好MongoDB Atlas连接字符串

## 安装Vercel CLI

```bash
npm install -g vercel
```

## 部署步骤

### 1. 登录Vercel

```bash
vercel login
```

### 2. 配置环境变量

在Vercel项目设置中添加以下环境变量：
- `MONGO_URI`: 你的MongoDB Atlas连接字符串
- `COLLECTION_NAME`: 集合名称（默认：captured_content）
- `FLASK_ENV`: production
- `LOG_LEVEL`: INFO

### 3. 部署项目

```bash
vercel --prod
```

### 4. 验证部署

部署完成后，Vercel会提供一个URL，使用 `test.html` 测试该URL的API功能。

## 项目结构

```
capture/
├── backend/           # Python后端代码
│   ├── app.py        # Flask主应用
│   ├── config.py     # 配置管理
│   ├── database.py   # 数据库服务
│   ├── routes.py     # API路由
│   └── requirements.txt
├── vercel.json       # Vercel配置文件
└── test.html         # API测试页面
```

## 注意事项

1. Vercel对Python应用有一些限制，确保代码兼容
2. 环境变量必须在Vercel项目设置中配置
3. 部署后需要更新Chrome扩展中的后端URL
4. 建议先在本地完整测试所有API功能

## 故障排除

如果部署失败，检查：
- requirements.txt中的依赖版本
- 环境变量是否正确设置
- 代码中是否有Vercel不支持的Python特性
