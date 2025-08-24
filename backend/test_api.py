#!/usr/bin/env python3
"""
API测试脚本
用于测试后端API是否正常工作
"""

import requests
import json

BASE_URL = "http://localhost:5000"
global_token = None # Store the token globally for use in other tests

def test_connect_database(mongo_uri, collection_name):
    global global_token # Declare global at the start
    """测试建立数据库连接并获取令牌"""
    print("🔍 测试建立数据库连接...")
    data = {
        "mongo_uri": mongo_uri,
        "collection_name": collection_name
    }
    response = requests.post(
        f"{BASE_URL}/api/database/connect",
        json=data,
        headers={'Content-Type': 'application/json'}
    )
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")
    print()
    if response.status_code == 200 and response.json().get("status") == "success":
        global_token = response.json()["data"]["token"]
        print(f"获取到令牌: {global_token}")
        return True
    return False

def test_disconnect_database():
    global global_token # Declare global at the start
    """测试断开数据库连接"""
    print("🔌 测试断开数据库连接...")
    if not global_token:
        print("没有可用的令牌进行断开测试。")
        return False
    
    data = {"token": global_token}
    response = requests.post(
        f"{BASE_URL}/api/database/disconnect",
        json=data,
        headers={'Content-Type': 'application/json'}
    )
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")
    print()
    if response.status_code == 200 and response.json().get("status") == "success":
        global_token = None
        return True
    return False

def test_create_capture(token):
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
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}' # Add Authorization header
    }
    
    response = requests.post(
        f"{BASE_URL}/api/capture",
        json=data,
        headers=headers
    )
    
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")
    
    if response.status_code == 201:
        return response.json()['data']['id']
    return None

def test_get_captures(token):
    """测试获取捕获列表"""
    print("📋 测试获取捕获列表...")
    headers = {
        'Authorization': f'Bearer {token}' # Add Authorization header
    }
    response = requests.get(f"{BASE_URL}/api/captures", headers=headers)
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

def test_get_categories(token):
    """测试获取分类"""
    print("🏷️ 测试获取分类...")
    headers = {
        'Authorization': f'Bearer {token}' # Add Authorization header
    }
    response = requests.get(f"{BASE_URL}/api/categories", headers=headers)
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

def test_search(token):
    """测试搜索功能"""
    print("🔍 测试搜索功能...")
    headers = {
        'Authorization': f'Bearer {token}' # Add Authorization header
    }
    response = requests.get(f"{BASE_URL}/api/search?q=测试", headers=headers)
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

def main():
    """主测试函数"""
    print("🚀 开始测试Web Content Capture后端API...")
    print("=" * 50)
    
    try:
        # IMPORTANT: Replace with your actual MongoDB URI and collection name for testing
        # These should ideally come from environment variables or a config file
        # For a quick test, you can hardcode them here, but be careful with sensitive info.
        test_mongo_uri = "mongodb://localhost:27017/testdb" # Replace with your test MongoDB URI
        test_collection_name = "test_collection" # Replace with your test collection name

        # Test connecting
        if test_connect_database(test_mongo_uri, test_collection_name):
            print("✅ 数据库连接成功！")
            
            # Now run other tests that require the token
            print("\n--- 运行其他API测试 ---")
            
            capture_id = test_create_capture(global_token)
            if capture_id:
                print(f"✅ 创建捕获内容成功，ID: {capture_id}")
            else:
                print("❌ 创建捕获内容失败")

            test_get_captures(global_token)
            test_get_categories(global_token)
            test_search(global_token)
            
            print("\n--- 其他API测试完成 ---")

            # Test disconnecting
            if test_disconnect_database():
                print("✅ 数据库断开连接成功！")
            else:
                print("❌ 数据库断开连接失败！")
        else:
            print("❌ 数据库连接失败！")
        
        print("✅ 所有测试完成！")
        
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到后端服务，请确保服务正在运行")
    except Exception as e:
        print(f"❌ 测试过程中出现错误: {e}")

if __name__ == "__main__":
    main()