#!/bin/bash

# InsightEye 测试脚本

echo "🧪 运行 InsightEye 系统测试..."

# 测试后端API
echo "🔍 测试后端API..."

# 健康检查
echo "1. 健康检查..."
health_response=$(curl -s http://localhost:8000/health)
if echo $health_response | grep -q "healthy"; then
    echo "✅ 健康检查通过"
else
    echo "❌ 健康检查失败: $health_response"
fi

# 测试分析API
echo "2. 测试网站分析API..."
analysis_response=$(curl -s -X POST http://localhost:8000/api/v1/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "analysis_types": ["intent", "tech_stack"]}')

if echo $analysis_response | grep -q "analysis_id"; then
    echo "✅ 分析API响应正常"
    analysis_id=$(echo $analysis_response | grep -o '"analysis_id":"[^"]*"' | cut -d'"' -f4)
    echo "   分析ID: $analysis_id"
else
    echo "❌ 分析API测试失败: $analysis_response"
fi

# 测试前端
echo "3. 测试前端..."
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$frontend_response" = "200" ]; then
    echo "✅ 前端响应正常"
else
    echo "❌ 前端测试失败，HTTP状态码: $frontend_response"
fi

# 测试数据库连接
echo "4. 测试数据库连接..."
if docker-compose exec -T postgres psql -U postgres -d insighteye -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ 数据库连接正常"
else
    echo "❌ 数据库连接失败"
fi

# 测试Redis连接
echo "5. 测试Redis连接..."
if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis连接正常"
else
    echo "❌ Redis连接失败"
fi

echo ""
echo "🎯 测试完成!"
echo ""
echo "如果所有测试通过，系统已准备就绪"
echo "访问 http://localhost:3000 开始使用InsightEye"