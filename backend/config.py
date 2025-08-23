import os
from dotenv import load_dotenv

# 加载环境变量
# load_dotenv()  # 临时注释掉，直接使用系统环境变量

class Config:
    """应用配置类"""
    
    # 基础配置
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # MongoDB配置
    MONGO_URI = os.getenv('MONGO_URI')
    COLLECTION_NAME = os.getenv('COLLECTION_NAME', 'captured_content')
    
    # API配置
    API_PREFIX = '/api'
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100
    
    # 日志配置
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    @classmethod
    def validate(cls):
        """验证必要的配置"""
        if not cls.MONGO_URI:
            raise ValueError("❌ 必须设置 MONGO_URI 环境变量")
        
        return True

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'

class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    LOG_LEVEL = 'WARNING'

# 配置映射
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

def get_config():
    """获取当前环境配置"""
    env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
