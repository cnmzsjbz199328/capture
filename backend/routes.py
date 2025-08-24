from flask import Blueprint, request, jsonify
from database import db_service
import logging

logger = logging.getLogger(__name__)

# 创建API蓝图
api = Blueprint('api', __name__, url_prefix='/api')

@api.route('/database/set', methods=['POST'])
def set_database():
    """设置数据库连接"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "请求体中没有提供JSON数据"}), 400
        
        mongo_uri = data.get('mongo_uri')
        collection_name = data.get('collection_name', 'captured_content')
        
        if not mongo_uri:
            return jsonify({"status": "error", "message": "必须提供MongoDB连接字符串"}), 400
        
        # 设置数据库连接
        success = db_service.set_database(mongo_uri, collection_name)
        
        if success:
            connection_info = db_service.get_connection_info()
            return jsonify({
                "status": "success",
                "message": "数据库连接设置成功",
                "data": connection_info
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": "数据库连接设置失败"
            }), 500
        
    except Exception as e:
        logger.exception("设置数据库连接失败")
        return jsonify({"status": "error", "message": f"设置失败: {str(e)}"}), 500

@api.route('/database/status', methods=['GET'])
def get_database_status():
    """获取数据库连接状态"""
    try:
        if db_service.is_connected():
            connection_info = db_service.get_connection_info()
            return jsonify({
                "status": "success",
                "message": "数据库连接正常",
                "data": connection_info
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": "数据库未连接"
            }), 500
        
    except Exception as e:
        logger.exception("获取数据库状态失败")
        return jsonify({"status": "error", "message": f"获取状态失败: {str(e)}"}), 500

@api.route('/capture', methods=['POST'])
def create_capture():
    """创建新的捕获内容"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "请求体中没有提供JSON数据"}), 400
        
        # 验证必填字段
        if not data.get('title', '').strip():
            return jsonify({"status": "error", "message": "标题不能为空"}), 400
        
        # 创建捕获内容
        capture_id = db_service.create_capture(data)
        
        return jsonify({
            "status": "success",
            "message": "内容捕获成功",
            "data": {"id": capture_id}
        }), 201
        
    except Exception as e:
        logger.exception("创建捕获内容失败")
        return jsonify({"status": "error", "message": f"创建失败: {str(e)}"}), 500

@api.route('/captures', methods=['GET'])
def get_captures():
    """获取捕获内容列表"""
    try:
        # 获取查询参数
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        category = request.args.get('category')
        search = request.args.get('search')
        
        # 限制分页大小
        limit = min(limit, 100)
        
        # 获取数据
        result = db_service.get_captures(page=page, limit=limit, 
                                       category=category, search=search)
        
        return jsonify({
            "status": "success",
            "data": result
        }), 200
        
    except Exception as e:
        logger.exception("获取捕获列表失败")
        return jsonify({"status": "error", "message": f"获取失败: {str(e)}"}), 500

@api.route('/captures/<capture_id>', methods=['GET'])
def get_capture(capture_id):
    """获取单个捕获内容"""
    try:
        capture = db_service.get_capture(capture_id)
        
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
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "请求体中没有提供JSON数据"}), 400
        
        # 更新内容
        success = db_service.update_capture(capture_id, data)
        
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
        success = db_service.delete_capture(capture_id)
        
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
        categories = db_service.get_categories()
        
        return jsonify({
            "status": "success",
            "data": {"categories": categories}
        }), 200
        
    except Exception as e:
        logger.exception("获取分类列表失败")
        return jsonify({"status": "error", "message": f"获取失败: {str(e)}"}), 500

@api.route('/search', methods=['GET'])
def search_captures():
    """搜索捕获内容"""
    try:
        query = request.args.get('q', '')
        if not query.strip():
            return jsonify({"status": "error", "message": "搜索关键词不能为空"}), 400
        
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        # 搜索内容
        result = db_service.get_captures(page=page, limit=limit, search=query)
        
        return jsonify({
            "status": "success",
            "data": result,
            "query": query
        }), 200
        
    except Exception as e:
        logger.exception("搜索捕获内容失败")
        return jsonify({"status": "error", "message": f"搜索失败: {str(e)}"}), 500