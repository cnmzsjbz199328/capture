#!/usr/bin/env python3
"""
API测试脚本
用于测试后端API是否正常工作
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_connection():
    """测试数据库连接"""
    print("🔍 测试数据库连接...")
    response = requests.get(f"{BASE_URL}/test_connection")
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")
    print()

def test_create_capture():
    """测试创建捕获内容"""
    print("📝 测试创建捕获内容...")
    
    data = {
        "title": "测试标题",
        "text": "这是测试内容",
        "html": "<p>这是测试HTML</p>",
        "tag": "p",
        "url": "https://example.com",
        "categories": ["测试", "示例"]
    }
    
    response = requests.post(
        f"{BASE_URL}/api/capture",
        json=data,
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")
    
    if response.status_code == 201:
        return response.json()['data']['id']
    return None

def test_get_captures():
    """测试获取捕获列表"""
    print("📋 测试获取捕获列表...")
    response = requests.get(f"{BASE_URL}/api/captures")
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

def test_get_categories():
    """测试获取分类"""
    print("🏷️ 测试获取分类...")
    response = requests.get(f"{BASE_URL}/api/categories")
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

def test_search():
    """测试搜索功能"""
    print("🔍 测试搜索功能...")
    response = requests.get(f"{BASE_URL}/api/search?q=测试")
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

def main():
    """主测试函数"""
    print("🚀 开始测试Web Content Capture后端API...")
    print("=" * 50)
    
    try:
        # 测试连接
        test_connection()
        
        # 测试创建
        capture_id = test_create_capture()
        
        # 测试获取列表
        test_get_captures()
        
        # 测试获取分类
        test_get_categories()
        
        # 测试搜索
        test_search()
        
        print("✅ 所有测试完成！")
        
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到后端服务，请确保服务正在运行")
    except Exception as e:
        print(f"❌ 测试过程中出现错误: {e}")

if __name__ == "__main__":
    main()
