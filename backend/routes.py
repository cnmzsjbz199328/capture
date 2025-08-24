from flask import Blueprint, request, jsonify
from database import db_service
import logging

logger = logging.getLogger(__name__)

# 创建API蓝图
api = Blueprint('api', __name__, url_prefix='/api')

def _get_token_from_header():
    """从请求头中提取Bearer令牌"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise ValueError("缺少授权头")
    
    parts = auth_header.split()
    
    if parts[0].lower() != 'bearer':
        raise ValueError("授权头必须以 'Bearer' 开头")
    elif len(parts) == 1:
        raise ValueError("令牌未找到")
    elif len(parts) > 2:
        raise ValueError("授权头格式无效")
        
    return parts[1]

@api.route('/database/connect', methods=['POST'])
def connect_database():
    """建立数据库连接并返回令牌"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "请求体中没有提供JSON数据"}), 400
        
        mongo_uri = data.get('mongo_uri')
        collection_name = data.get('collection_name', 'captured_content')
        
        if not mongo_uri:
            return jsonify({"status": "error", "message": "必须提供MongoDB连接字符串"}), 400
        
        # 创建连接令牌
        token, connection_info = db_service.create_connection_token(mongo_uri, collection_name)
        
        return jsonify({
            "status": "success",
            "message": "数据库连接成功",
            "data": {
                "token": token,
                "database": connection_info['database'],
                "collection": connection_info['collection'],
                "expires_in": 3600  # 1小时
            }
        }), 200
        
    except Exception as e:
        logger.exception("建立数据库连接失败")
        return jsonify({"status": "error", "message": f"连接失败: {str(e)}"}), 500

@api.route('/database/disconnect', methods=['POST'])
def disconnect_database():
    """断开数据库连接"""
    try:
        data = request.get_json()
        token = data.get('token') if data else None
        
        if not token:
            # 尝试从header获取
            try:
                token = _get_token_from_header()
            except ValueError as e:
                return jsonify({"status": "error", "message": str(e)}), 401

        if not token:
            return jsonify({"status": "error", "message": "必须提供连接令牌"}), 400

        success = db_service.revoke_connection_token(token)
        
        if success:
            return jsonify({
                "status": "success",
                "message": "数据库连接已断开"
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": "无效的连接令牌"
            }), 400
            
    except Exception as e:
        logger.exception("断开数据库连接失败")
        return jsonify({"status": "error", "message": f"断开失败: {str(e)}"}), 500

@api.route('/capture', methods=['POST'])
def create_capture():
    """创建新的捕获内容"""
    try:
        token = _get_token_from_header()
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "请求体中没有提供JSON数据"}), 400
        
        if not data.get('title', '').strip():
            return jsonify({"status": "error", "message": "标题不能为空"}), 400
        
        capture_id = db_service.create_capture(token, data)
        
        return jsonify({
            "status": "success",
            "message": "内容捕获成功",
            "data": {"id": capture_id}
        }), 201
        
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 401
    except Exception as e:
        logger.exception("创建捕获内容失败")
        return jsonify({"status": "error", "message": f"创建失败: {str(e)}"}), 500

@api.route('/captures', methods=['GET'])
def get_captures():
    """获取捕获内容列表"""
    try:
        token = _get_token_from_header()
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        category = request.args.get('category')
        search = request.args.get('search')
        
        limit = min(limit, 100)
        
        result = db_service.get_captures(token, page=page, limit=limit, 
                                       category=category, search=search)
        
        return jsonify({
            "status": "success",
            "data": result
        }), 200
        
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 401
    except Exception as e:
        logger.exception("获取捕获列表失败")
        return jsonify({"status": "error", "message": f"获取失败: {str(e)}"}), 500

@api.route('/captures/<capture_id>', methods=['GET'])
def get_capture(capture_id):
    """获取单个捕获内容"""
    try:
        token = _get_token_from_header()
        capture = db_service.get_capture(token, capture_id)
        
        if not capture:
            return jsonify({"status": "error", "message": "内容不存在"}), 404
        
        return jsonify({
            "status": "success",
            "data": capture
        }), 200
        
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        logger.exception("获取捕获内容失败")
        return jsonify({"status": "error", "message": f"获取失败: {str(e)}"}), 500

@api.route('/captures/<capture_id>', methods=['PUT'])
def update_capture(capture_id):
    """更新捕获内容"""
    try:
        token = _get_token_from_header()
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "请求体中没有提供JSON数据"}), 400
        
        success = db_service.update_capture(token, capture_id, data)
        
        if not success:
            return jsonify({"status": "error", "message": "内容不存在"}), 404
        
        return jsonify({
            "status": "success",
            "message": "更新成功"
        }), 200
        
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        logger.exception("更新捕获内容失败")
        return jsonify({"status": "error", "message": f"更新失败: {str(e)}"}), 500

@api.route('/captures/<capture_id>', methods=['DELETE'])
def delete_capture(capture_id):
    """删除捕获内容"""
    try:
        token = _get_token_from_header()
        success = db_service.delete_capture(token, capture_id)
        
        if not success:
            return jsonify({"status": "error", "message": "内容不存在"}), 404
        
        return jsonify({
            "status": "success",
            "message": "删除成功"
        }), 200
        
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        logger.exception("删除捕获内容失败")
        return jsonify({"status": "error", "message": f"删除失败: {str(e)}"}), 500

@api.route('/categories', methods=['GET'])
def get_categories():
    """获取所有分类"""
    try:
        token = _get_token_from_header()
        categories = db_service.get_categories(token)
        
        return jsonify({
            "status": "success",
            "data": {"categories": categories}
        }), 200
        
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 401
    except Exception as e:
        logger.exception("获取分类列表失败")
        return jsonify({"status": "error", "message": f"获取失败: {str(e)}"}), 500

@api.route('/search', methods=['GET'])
def search_captures():
    """搜索捕获内容"""
    try:
        token = _get_token_from_header()
        query = request.args.get('q', '')
        if not query.strip():
            return jsonify({"status": "error", "message": "搜索关键词不能为空"}), 400
        
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        result = db_service.get_captures(token, page=page, limit=limit, search=query)
        
        return jsonify({
            "status": "success",
            "data": result,
            "query": query
        }), 200
        
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 401
    except Exception as e:
        logger.exception("搜索捕获内容失败")
        return jsonify({"status": "error", "message": f"搜索失败: {str(e)}"}), 500

@api.route('/status', methods=['GET'])
def get_status():
    """获取API状态"""
    return jsonify({
        "status": "success",
        "message": "API is running"
    }), 200
