from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import logging
from config import get_config

logger = logging.getLogger(__name__)

class DatabaseService:
    """数据库服务类 - 处理所有数据库操作"""
    
    def __init__(self):
        self.config = get_config()
        self.config.validate()
        self.client = None
        self.db = None
        self.collection = None
        # 延迟连接，不在初始化时连接数据库
    
    def _connect(self):
        """建立数据库连接"""
        try:
            # 设置连接超时和重试参数
            self.client = MongoClient(
                self.config.MONGO_URI,
                serverSelectionTimeoutMS=10000,  # 10秒超时
                connectTimeoutMS=10000,
                socketTimeoutMS=10000,
                maxPoolSize=1,  # Vercel环境限制连接池大小
                retryWrites=True
            )
            self.db = self.client.get_database()
            self.collection = self.db[self.config.COLLECTION_NAME]
            
            # 测试连接
            self.client.admin.command('ping')
            logger.info("✅ 数据库连接成功: db=%s, collection=%s", 
                       self.db.name, self.config.COLLECTION_NAME)
            
        except Exception as e:
            logger.error("❌ 数据库连接失败: %s", e)
            self.client = None
            raise
    
    def is_connected(self):
        """检查数据库连接状态"""
        try:
            if self.client is None:
                self._connect()
            return self.client is not None and self.client.admin.command('ping')
        except Exception as e:
            logger.error("数据库连接检查失败: %s", e)
            return False
    
    def create_capture(self, data):
        """创建新的捕获内容"""
        try:
            # 添加时间戳
            data['created_at'] = datetime.utcnow()
            data['updated_at'] = datetime.utcnow()
            
            result = self.collection.insert_one(data)
            logger.info("创建捕获内容成功: _id=%s", result.inserted_id)
            
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error("创建捕获内容失败: %s", e)
            raise
    
    def get_captures(self, page=1, limit=20, category=None, search=None):
        """获取捕获内容列表"""
        try:
            # 构建查询条件
            query = {}
            if category and category != '__all__':
                query['categories'] = category
            if search:
                query['$or'] = [
                    {'title': {'$regex': search, '$options': 'i'}},
                    {'text': {'$regex': search, '$options': 'i'}}
                ]
            
            # 计算总数
            total = self.collection.count_documents(query)
            
            # 分页查询
            skip = (page - 1) * limit
            cursor = self.collection.find(query).sort('created_at', -1).skip(skip).limit(limit)
            
            # 格式化结果
            captures = []
            for doc in cursor:
                doc['_id'] = str(doc['_id'])
                # 安全处理时间戳字段
                if 'created_at' in doc and doc['created_at']:
                    doc['created_at'] = doc['created_at'].isoformat()
                if 'updated_at' in doc and doc['updated_at']:
                    doc['updated_at'] = doc['updated_at'].isoformat()
                captures.append(doc)
            
            return {
                'captures': captures,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }
            
        except Exception as e:
            logger.error("获取捕获列表失败: %s", e)
            raise
    
    def get_capture(self, capture_id):
        """获取单个捕获内容"""
        try:
            if not ObjectId.is_valid(capture_id):
                raise ValueError("无效的ID格式")
            
            doc = self.collection.find_one({'_id': ObjectId(capture_id)})
            if not doc:
                return None
            
            # 格式化结果
            doc['_id'] = str(doc['_id'])
            # 安全处理时间戳字段
            if 'created_at' in doc and doc['created_at']:
                doc['created_at'] = doc['created_at'].isoformat()
            if 'updated_at' in doc and doc['updated_at']:
                doc['updated_at'] = doc['updated_at'].isoformat()
            
            return doc
            
        except Exception as e:
            logger.error("获取捕获内容失败: %s", e)
            raise
    
    def update_capture(self, capture_id, data):
        """更新捕获内容"""
        try:
            if not ObjectId.is_valid(capture_id):
                raise ValueError("无效的ID格式")
            
            # 添加更新时间
            data['updated_at'] = datetime.utcnow()
            
            result = self.collection.update_one(
                {'_id': ObjectId(capture_id)},
                {'$set': data}
            )
            
            if result.matched_count == 0:
                return False
            
            logger.info("更新捕获内容成功: _id=%s", capture_id)
            return True
            
        except Exception as e:
            logger.error("更新捕获内容失败: %s", e)
            raise
    
    def delete_capture(self, capture_id):
        """删除捕获内容"""
        try:
            if not ObjectId.is_valid(capture_id):
                raise ValueError("无效的ID格式")
            
            result = self.collection.delete_one({'_id': ObjectId(capture_id)})
            
            if result.deleted_count == 0:
                return False
            
            logger.info("删除捕获内容成功: _id=%s", capture_id)
            return True
            
        except Exception as e:
            logger.error("删除捕获内容失败: %s", e)
            raise
    
    def get_categories(self):
        """获取所有分类"""
        try:
            # 聚合查询获取所有分类
            pipeline = [
                {'$unwind': '$categories'},
                {'$group': {'_id': '$categories', 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}}
            ]
            
            categories = list(self.collection.aggregate(pipeline))
            
            return [{"name": cat['_id'], "count": cat['count']} for cat in categories]
            
        except Exception as e:
            logger.error("获取分类列表失败: %s", e)
            raise
    
    def close(self):
        """关闭数据库连接"""
        if self.client:
            self.client.close()
            logger.info("数据库连接已关闭")

# 全局数据库服务实例
db_service = DatabaseService()
