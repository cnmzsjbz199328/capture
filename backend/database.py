import os
import logging
from pymongo import MongoClient
from flask import g # Keep g for potential future use or other parts of the app
import hashlib
import time
from typing import Optional, Dict, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.connections = {}
        # 使用内存存储连接令牌，生产环境可考虑 Redis
        self.connection_tokens: Dict[str, Dict] = {}
        self.token_expiry = 3600  # 1小时过期

    def _get_connection_key(self, mongo_uri, collection_name):
        return f"{mongo_uri}_{collection_name}"

    def _connect(self, mongo_uri, collection_name):
        connection_key = self._get_connection_key(mongo_uri, collection_name)
        if connection_key not in self.connections:
            logger.info(f"Establishing new MongoDB connection for {mongo_uri}")
            client = MongoClient(mongo_uri)
            db = client.get_database()
            collection = db.get_collection(collection_name)
            
            # Ensure text index exists for search functionality
            try:
                collection.create_index([("title", "text"), ("text", "text")])
                logger.info(f"Ensured text index exists for collection '{collection_name}'")
            except Exception as e:
                logger.error(f"Failed to create text index: {e}")

            self.connections[connection_key] = {
                'client': client,
                'db': db,
                'collection': collection
            }
        return self.connections[connection_key]['db'], self.connections[connection_key]['collection']

    def _generate_token(self, mongo_uri: str, collection_name: str) -> str:
        """生成连接令牌"""
        timestamp = str(int(time.time()))
        content = f"{mongo_uri}_{collection_name}_{timestamp}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]

    def _cleanup_expired_tokens(self):
        """清理过期的连接令牌"""
        current_time = int(time.time())
        expired_tokens = [
            token for token, info in self.connection_tokens.items()
            if current_time - info['created_at'] > self.token_expiry
        ]
        for token in expired_tokens:
            self._remove_connection_by_token(token)

    def _remove_connection_by_token(self, token: str):
        """根据令牌移除连接"""
        if token in self.connection_tokens:
            conn_info = self.connection_tokens[token]
            connection_key = conn_info['connection_key']

            # 关闭数据库连接
            if connection_key in self.connections:
                try:
                    self.connections[connection_key]['client'].close()
                    del self.connections[connection_key]
                except Exception as e:
                    logger.error(f"关闭连接失败: {e}")

            # 移除令牌
            del self.connection_tokens[token]
            logger.info(f"已移除过期连接令牌: {token}")

    def create_connection_token(self, mongo_uri: str, collection_name: str) -> Tuple[str, Dict]:
        """创建数据库连接令牌"""
        try:
            # 清理过期令牌
            self._cleanup_expired_tokens()

            # 建立连接
            db, collection = self._connect(mongo_uri, collection_name)

            # 生成令牌
            token = self._generate_token(mongo_uri, collection_name)

            # 存储令牌信息
            self.connection_tokens[token] = {
                'connection_key': self._get_connection_key(mongo_uri, collection_name),
                'mongo_uri': mongo_uri,
                'collection_name': collection_name,
                'created_at': int(time.time()),
                'database': db.name,
                'collection': collection.name
            }

            logger.info(f"创建连接令牌成功: {token}")
            return token, self.connection_tokens[token]

        except Exception as e:
            logger.error(f"创建连接令牌失败: {e}")
            raise

    def get_connection_by_token(self, token: str) -> Optional[Tuple]:
        """根据令牌获取数据库连接"""
        if token not in self.connection_tokens:
            return None

        token_info = self.connection_tokens[token]
        connection_key = token_info['connection_key']

        # 检查令牌是否过期
        if int(time.time()) - token_info['created_at'] > self.token_expiry:
            self._remove_connection_by_token(token)
            return None

        # 获取连接
        if connection_key in self.connections:
            conn_info = self.connections[connection_key]
            try:
                # 测试连接是否有效
                conn_info['client'].admin.command('ping')
                return conn_info['db'], conn_info['collection']
            except Exception:
                logger.warning(f"令牌 {token} 对应的连接已失效")
                self._remove_connection_by_token(token)
                return None

        return None

    def revoke_connection_token(self, token: str) -> bool:
        """撤销连接令牌"""
        if token in self.connection_tokens:
            self._remove_connection_by_token(token)
            return True
        return False

    def create_capture(self, token: str, data: Dict) -> str:
        """创建新的捕获内容"""
        connection = self.get_connection_by_token(token)
        if not connection:
            raise ValueError("无效的连接令牌")
        
        db, collection = connection
        
        # 可以在这里添加更多的数据验证逻辑
        
        result = collection.insert_one(data)
        return str(result.inserted_id)

    def get_captures(self, token: str, page: int = 1, limit: int = 20, category: Optional[str] = None, search: Optional[str] = None) -> Dict:
        """获取捕获内容列表"""
        connection = self.get_connection_by_token(token)
        if not connection:
            raise ValueError("无效的连接令牌")
        
        db, collection = connection
        
        query = {}
        if category:
            query['category'] = category
        if search:
            query['$text'] = {'$search': search}
        
        # 计算要跳过的文档数
        skip = (page - 1) * limit
        
        # 查询数据
        cursor = collection.find(query).skip(skip).limit(limit)
        captures = list(cursor)
        
        # 获取总数
        total_count = collection.count_documents(query)
        
        # 转换ObjectId为字符串
        for capture in captures:
            capture['_id'] = str(capture['_id'])
            
        return {
            "captures": captures,
            "total": total_count,
            "page": page,
            "limit": limit
        }

    def get_capture(self, token: str, capture_id: str) -> Optional[Dict]:
        """获取单个捕获内容"""
        from bson.objectid import ObjectId
        connection = self.get_connection_by_token(token)
        if not connection:
            raise ValueError("无效的连接令牌")
        
        db, collection = connection
        
        try:
            obj_id = ObjectId(capture_id)
        except Exception:
            raise ValueError("无效的 capture_id")
            
        capture = collection.find_one({"_id": obj_id})
        if capture:
            capture['_id'] = str(capture['_id'])
        return capture

    def update_capture(self, token: str, capture_id: str, data: Dict) -> bool:
        """更新捕获内容"""
        from bson.objectid import ObjectId
        connection = self.get_connection_by_token(token)
        if not connection:
            raise ValueError("无效的连接令牌")
        
        db, collection = connection
        
        try:
            obj_id = ObjectId(capture_id)
        except Exception:
            raise ValueError("无效的 capture_id")
            
        # 不允许更新_id
        if '_id' in data:
            del data['_id']
            
        result = collection.update_one({'_id': obj_id}, {'$set': data})
        return result.modified_count > 0

    def delete_capture(self, token: str, capture_id: str) -> bool:
        """删除捕获内容"""
        from bson.objectid import ObjectId
        connection = self.get_connection_by_token(token)
        if not connection:
            raise ValueError("无效的连接令牌")
        
        db, collection = connection
        
        try:
            obj_id = ObjectId(capture_id)
        except Exception:
            raise ValueError("无效的 capture_id")
            
        result = collection.delete_one({'_id': obj_id})
        return result.deleted_count > 0

    def get_categories(self, token: str) -> list:
        """获取所有分类"""
        connection = self.get_connection_by_token(token)
        if not connection:
            raise ValueError("无效的连接令牌")
        
        db, collection = connection
        
        return collection.distinct('category')

db_service = DatabaseService()

# The following functions are no longer directly used by the new routes,
# but might be used by other parts of the application or for testing.
# I will keep them for now, as the guide only specified changes to DatabaseService and routes.
def get_db_collection(mongo_uri, collection_name):
    db, collection = db_service._connect(mongo_uri, collection_name)
    return db, collection

def close_db_connection(mongo_uri, collection_name):
    connection_key = db_service._get_connection_key(mongo_uri, collection_name)
    if connection_key in db_service.connections:
        try:
            db_service.connections[connection_key]['client'].close()
            del db_service.connections[connection_key]
            logger.info(f"Closed MongoDB connection for {mongo_uri}")
        except Exception as e:
            logger.error(f"Error closing MongoDB connection: {e}")