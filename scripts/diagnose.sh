#!/bin/bash

# Flarum Markdown插件500错误自动诊断脚本
# 使用方法: chmod +x diagnose.sh && ./diagnose.sh

echo "🔍 Flarum Markdown插件500错误自动诊断工具"
echo "=============================================="
echo

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查函数
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 存在"
        return 0
    else
        echo -e "${RED}✗${NC} $1 不存在"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} 目录 $1 存在"
        return 0
    else
        echo -e "${RED}✗${NC} 目录 $1 不存在"
        return 1
    fi
}

print_section() {
    echo
    echo -e "${BLUE}=== $1 ===${NC}"
    echo
}

# 1. 基础环境检查
print_section "基础环境检查"

# 检查是否在Flarum根目录
if ! check_file "flarum"; then
    echo -e "${RED}错误: 请在Flarum根目录中运行此脚本${NC}"
    exit 1
fi

# 检查关键文件
check_file "config.php"
check_file "composer.json"
check_dir "vendor"
check_dir "storage"

# 2. PHP环境检查
print_section "PHP环境检查"

PHP_VERSION=$(php -r "echo PHP_VERSION;")
echo "PHP版本: $PHP_VERSION"

# 检查内存限制
MEMORY_LIMIT=$(php -r "echo ini_get('memory_limit');")
echo "内存限制: $MEMORY_LIMIT"

# 检查错误报告
ERROR_REPORTING=$(php -r "echo ini_get('error_reporting');")
echo "错误报告级别: $ERROR_REPORTING"

# 3. Flarum配置检查
print_section "Flarum配置检查"

# 检查调试模式
DEBUG_STATUS=$(php -r "
\$config = include 'config.php';
echo isset(\$config['debug']) && \$config['debug'] ? 'enabled' : 'disabled';
")
echo "调试模式: $DEBUG_STATUS"

if [ "$DEBUG_STATUS" = "disabled" ]; then
    echo -e "${YELLOW}建议: 临时开启调试模式以获取详细错误信息${NC}"
    echo "在 config.php 中设置 'debug' => true"
fi

# 4. 插件状态检查
print_section "插件状态检查"

echo "检查Markdown插件安装状态..."
PLUGIN_STATUS=$(composer show steperlin/flarum-markdown 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Markdown插件已安装"
    echo "$PLUGIN_STATUS" | head -3
else
    echo -e "${RED}✗${NC} Markdown插件未安装或安装异常"
fi

# 检查插件是否启用
echo
echo "检查已启用的扩展..."
php flarum extension:list 2>/dev/null | grep -i markdown

# 5. 数据库连接检查
print_section "数据库连接检查"

DB_TEST=$(php -r "
try {
    \$config = include 'config.php';
    \$db = \$config['database'];
    \$pdo = new PDO(
        \"mysql:host={\$db['host']};dbname={\$db['database']};charset=utf8mb4\",
        \$db['username'],
        \$db['password']
    );
    echo 'success';
} catch (Exception \$e) {
    echo 'failed: ' . \$e->getMessage();
}
")

if [[ $DB_TEST == "success" ]]; then
    echo -e "${GREEN}✓${NC} 数据库连接正常"
else
    echo -e "${RED}✗${NC} 数据库连接失败: $DB_TEST"
fi

# 6. 文件权限检查
print_section "文件权限检查"

# 检查storage目录权限
STORAGE_PERM=$(stat -c "%a" storage 2>/dev/null || stat -f "%A" storage 2>/dev/null)
echo "storage目录权限: $STORAGE_PERM"

if [ -d "storage/logs" ]; then
    LOGS_PERM=$(stat -c "%a" storage/logs 2>/dev/null || stat -f "%A" storage/logs 2>/dev/null)
    echo "storage/logs权限: $LOGS_PERM"
fi

# 7. 错误日志检查
print_section "错误日志检查"

if [ -f "storage/logs/flarum.log" ]; then
    echo "最新的Flarum错误日志 (最后10行):"
    echo "----------------------------------------"
    tail -10 storage/logs/flarum.log
    echo "----------------------------------------"
    
    # 查找最近的500错误
    echo
    echo "查找最近的500相关错误:"
    grep -i "500\|internal server error\|fatal error" storage/logs/flarum.log | tail -5
else
    echo -e "${YELLOW}! 未找到Flarum日志文件${NC}"
fi

# 8. 缓存状态检查
print_section "缓存状态检查"

if [ -d "storage/cache" ]; then
    CACHE_FILES=$(find storage/cache -type f | wc -l)
    echo "缓存文件数量: $CACHE_FILES"
    
    if [ "$CACHE_FILES" -gt 100 ]; then
        echo -e "${YELLOW}建议: 缓存文件较多，考虑清理缓存${NC}"
        echo "运行: php flarum cache:clear"
    fi
else
    echo -e "${RED}✗${NC} 缓存目录不存在"
fi

# 9. 特定讨论检查（如果提供讨论ID）
print_section "特定讨论检查"

echo "检查讨论ID 317的数据..."
DISCUSSION_CHECK=$(php -r "
try {
    \$config = include 'config.php';
    \$db = \$config['database'];
    \$pdo = new PDO(
        \"mysql:host={\$db['host']};dbname={\$db['database']};charset=utf8mb4\",
        \$db['username'],
        \$db['password']
    );
    
    \$stmt = \$pdo->prepare('SELECT id, title, comment_count FROM discussions WHERE id = ?');
    \$stmt->execute([317]);
    \$discussion = \$stmt->fetch(PDO::FETCH_ASSOC);
    
    if (\$discussion) {
        echo 'found: ' . json_encode(\$discussion);
    } else {
        echo 'not_found';
    }
} catch (Exception \$e) {
    echo 'error: ' . \$e->getMessage();
}
")

if [[ $DISCUSSION_CHECK == found:* ]]; then
    echo -e "${GREEN}✓${NC} 讨论317存在"
    echo "讨论信息: ${DISCUSSION_CHECK#found: }"
elif [[ $DISCUSSION_CHECK == "not_found" ]]; then
    echo -e "${RED}✗${NC} 讨论317不存在"
else
    echo -e "${RED}✗${NC} 检查讨论时出错: ${DISCUSSION_CHECK#error: }"
fi

# 10. 生成修复建议
print_section "修复建议"

echo "基于检查结果，建议按以下顺序操作："
echo
echo "1. 立即操作:"
echo "   php flarum cache:clear"
echo "   php flarum assets:publish"
echo
echo "2. 如果问题持续:"
echo "   - 开启调试模式查看详细错误"
echo "   - 检查Web服务器错误日志"
echo "   - 考虑重新安装插件"
echo
echo "3. 高级诊断:"
echo "   - 临时禁用其他插件测试冲突"
echo "   - 检查数据库中的异常数据"
echo "   - 验证文件完整性"

echo
echo -e "${GREEN}诊断完成！${NC}"
echo "如需详细的排查指南，请查看: docs/500_ERROR_DIAGNOSTIC.md"