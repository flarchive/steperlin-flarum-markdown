#!/bin/bash

# Packagist Webhook 测试脚本
# 用于测试包是否能正确通知 Packagist 更新

set -e

echo "🔗 测试 Packagist Webhook..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查环境变量
if [ -z "$PACKAGIST_USERNAME" ]; then
    echo -e "${RED}❌ 错误: PACKAGIST_USERNAME 环境变量未设置${NC}"
    echo "请设置: export PACKAGIST_USERNAME=your_username"
    exit 1
fi

if [ -z "$PACKAGIST_TOKEN" ]; then
    echo -e "${RED}❌ 错误: PACKAGIST_TOKEN 环境变量未设置${NC}"
    echo "请设置: export PACKAGIST_TOKEN=your_api_token"
    exit 1
fi

# 包信息
PACKAGE_NAME="steperlin/flarum-markdown"
PACKAGE_URL="https://packagist.org/packages/$PACKAGE_NAME"

echo "📦 包名称: $PACKAGE_NAME"
echo "🔗 包地址: $PACKAGE_URL"
echo ""

# 测试 Packagist API 连接
echo "🧪 测试 Packagist API 连接..."
API_URL="https://packagist.org/api/update-package?username=$PACKAGIST_USERNAME&apiToken=$PACKAGIST_TOKEN"

# 发送更新请求
echo "📡 发送更新请求到 Packagist..."
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"repository\":{\"url\":\"$PACKAGE_URL\"}}" \
    "$API_URL")

# 解析响应
HTTP_BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

echo "📥 HTTP 状态码: $HTTP_STATUS"
echo "📄 响应内容: $HTTP_BODY"

# 检查结果
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ 成功: Packagist webhook 测试通过！${NC}"
    echo ""
    echo "🎉 您的包现在应该已经更新。"
    echo "🔍 请访问 $PACKAGE_URL 确认版本信息。"
elif [ "$HTTP_STATUS" -eq 202 ]; then
    echo -e "${YELLOW}⏳ 处理中: Packagist 正在处理更新请求...${NC}"
    echo "🔍 请等待几分钟后检查包页面。"
else
    echo -e "${RED}❌ 失败: HTTP $HTTP_STATUS${NC}"
    echo "💡 可能的原因:"
    echo "   - API Token 无效或已过期"
    echo "   - 用户名错误"
    echo "   - 包尚未在 Packagist 上提交"
    echo "   - 网络连接问题"
    exit 1
fi

echo ""
echo "🔧 如果遇到问题，请检查:"
echo "   1. Packagist 账户设置"
echo "   2. API Token 有效性"
echo "   3. 包是否已提交到 Packagist"
echo "   4. GitHub Secrets 配置"

echo ""
echo "📚 更多信息请查看: docs/PACKAGIST_SETUP.md"