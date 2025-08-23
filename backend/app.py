from flask import Flask, jsonify
from flask_cors import CORS
import logging
from config import get_config
from routes import api
from database import db_service

def create_app():
    """创建Flask应用"""
    # 获取配置
    config = get_config()
    
    # 创建应用
    app = Flask(__name__)
    app.config.from_object(config)
    
    # 配置日志
    logging.basicConfig(
        level=getattr(logging, config.LOG_LEVEL),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # 允许跨域请求
    CORS(app)
    
    # 注册API蓝图
    app.register_blueprint(api)
    
    # 基础路由
    @app.route("/")
    def index():
        return "<h1>Web Content Capture Backend is Running!</h1>"
    
    @app.route("/test_connection")
    def test_connection():
        """测试数据库连接状态"""
        try:
            if db_service.is_connected():
                return jsonify({
                    "status": "success", 
                    "message": "数据库连接正常"
                }), 200
            else:
                return jsonify({
                    "status": "error", 
                    "message": "数据库连接失败"
                }), 500
        except Exception as e:
            return jsonify({
                "status": "error", 
                "message": f"连接测试失败: {str(e)}"
            }), 500
    
    # 错误处理
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "status": "error",
            "message": "接口不存在"
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "status": "error",
            "message": "服务器内部错误"
        }), 500
    
    return app

# 创建应用实例
app = create_app()

# 启动服务
if __name__ == "__main__":
    try:
        # 验证配置
        config = get_config()
        config.validate()
        
        app.logger.info("🚀 启动Web Content Capture后端服务...")
        app.logger.info(f"📊 数据库: {config.COLLECTION_NAME}")
        app.logger.info(f"🔧 调试模式: {config.DEBUG}")
        
        # 启动应用
        app.run(
            debug=config.DEBUG, 
            port=5000,
            host='0.0.0.0'
        )
        
    except Exception as e:
        app.logger.error(f"❌ 启动失败: {e}")
        raise
    finally:
        # 关闭数据库连接
        db_service.close()