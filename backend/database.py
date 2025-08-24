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
        
        # 连接缓存
        self.connections = {}  # {connection_key: {'client': client, 'db': db, 'collection': collection}}
        self.current_connection_key = None
        
    def _get_connection_key(self, mongo_uri, collection_name):
        """生成连接缓存键"""
        return f"{mongo_uri}_{collection_name}"
    
    def _connect(self, mongo_uri, collection_name):
        """建立数据库连接"""
        try:
            connection_key = self._get_connection_key(mongo_uri, collection_name)
            
            # 检查是否已有连接
            if connection_key in self.connections:
                logger.info("使用缓存的数据库连接: %s", connection_key)
                return self.connections[connection_key]
            
            # 建立新连接
            logger.info("建立新的数据库连接: %s", connection_key)
            
            client = MongoClient(
                mongo_uri,
                serverSelectionTimeoutMS=10000,  # 10秒超时
                connectTimeoutMS=10000,
                socketTimeoutMS=10000,
                maxPoolSize=5,  # 增加连接池大小
                retryWrites=True
            )
            
            db = client.get_database()
            collection = db[collection_name]
            
            # 测试连接
            client.admin.command('ping')
            
            # 缓存连接
            connection_info = {
                'client': client,
                'db': db,
                'collection': collection,
                'uri': mongo_uri,
                'collection_name': collection_name
            }
            
            self.connections[connection_key] = connection_info
            self.current_connection_key = connection_key
            
            logger.info("✅ 数据库连接成功: db=%s, collection=%s", 
                       db.name, collection_name)
            
            return connection_info
            
        except Exception as e:
            logger.error("❌ 数据库连接失败: %s", e)
            raise
    
    def set_database(self, mongo_uri, collection_name):
        """设置当前使用的数据库"""
        try:
            connection_info = self._connect(mongo_uri, collection_name)
            self.current_connection_key = self._get_connection_key(mongo_uri, collection_name)
            logger.info("数据库已切换到: %s", self.current_connection_key)
            return True
        except Exception as e:
            logger.error("切换数据库失败: %s", e)
            return False
    
    def get_current_connection(self):
        """获取当前数据库连接"""
        if not self.current_connection_key:
            raise ValueError("未设置数据库连接，请先调用 set_database()")
        
        if self.current_connection_key not in self.connections:
            raise ValueError("当前数据库连接已失效，请重新设置")
        
        return self.connections[self.current_connection_key]
    
    def is_connected(self):
        """检查当前数据库连接状态"""
        try:
            if not self.current_connection_key:
                return False
            
            connection_info = self.get_current_connection()
            connection_info['client'].admin.command('ping')
            return True
        except Exception as e:
            logger.error("数据库连接检查失败: %s", e)
            return False
    
    def create_capture(self, data):
        """创建新的捕获内容"""
        try:
            connection_info = self.get_current_connection()
            collection = connection_info['collection']
            
            # 添加时间戳
            data['created_at'] = datetime.utcnow()
            data['updated_at'] = datetime.utcnow()
            
            result = collection.insert_one(data)
            logger.info("创建捕获内容成功: _id=%s", result.inserted_id)
            
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error("创建捕获内容失败: %s", e)
            raise
    
    def get_captures(self, page=1, limit=20, category=None, search=None):
        """获取捕获内容列表"""
        try:
            connection_info = self.get_current_connection()
            collection = connection_info['collection']
            
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
            total = collection.count_documents(query)
            
            # 分页查询
            skip = (page - 1) * limit
            cursor = collection.find(query).sort('created_at', -1).skip(skip).limit(limit)
            
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
            connection_info = self.get_current_connection()
            collection = connection_info['collection']
            
            if not ObjectId.is_valid(capture_id):
                raise ValueError("无效的ID格式")
            
            doc = collection.find_one({'_id': ObjectId(capture_id)})
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
            connection_info = self.get_current_connection()
            collection = connection_info['collection']
            
            if not ObjectId.is_valid(capture_id):
                raise ValueError("无效的ID格式")
            
            # 添加更新时间
            data['updated_at'] = datetime.utcnow()
            
            result = collection.update_one(
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
            connection_info = self.get_current_connection()
            collection = connection_info['collection']
            
            if not ObjectId.is_valid(capture_id):
                raise ValueError("无效的ID格式")
            
            result = collection.delete_one({'_id': ObjectId(capture_id)})
            
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
            connection_info = self.get_current_connection()
            collection = connection_info['collection']
            
            # 聚合查询获取所有分类
            pipeline = [
                {'$unwind': '$categories'},
                {'$group': {'_id': '$categories', 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}}
            ]
            
            categories = list(collection.aggregate(pipeline))
            
            return [{"name": cat['_id'], "count": cat['count']} for cat in categories]
            
        except Exception as e:
            logger.error("获取分类列表失败: %s", e)
            raise
    
    def get_connection_info(self):
        """获取当前连接信息"""
        if not self.current_connection_key:
            return None
        
        connection_info = self.connections.get(self.current_connection_key)
        if connection_info:
            return {
                'database': connection_info['db'].name,
                'collection': connection_info['collection_name'],
                'uri': connection_info['uri'][:50] + '...' if len(connection_info['uri']) > 50 else connection_info['uri']
            }
        return None
    
    def close_all_connections(self):
        """关闭所有数据库连接"""
        for connection_key, connection_info in self.connections.items():
            try:
                connection_info['client'].close()
                logger.info("关闭数据库连接: %s", connection_key)
            except Exception as e:
                logger.error("关闭数据库连接失败: %s", e)
        
        self.connections.clear()
        self.current_connection_key = None
        logger.info("所有数据库连接已关闭")
    
    def close(self):
        """兼容性方法"""
        self.close_all_connections()

# 全局数据库服务实例
db_service = DatabaseService()
