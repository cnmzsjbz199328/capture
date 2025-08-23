"""
Vercel部署专用的Flask应用入口
"""
import sys
import os

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app

# Vercel需要这个变量
app.debug = False

# 导出app实例供Vercel使用
if __name__ == "__main__":
    app.run()
