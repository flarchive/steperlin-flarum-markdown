# 🚨 Flarum Markdown插件500错误诊断指南

## 错误概述
**错误类型**: 500 Internal Server Error  
**影响范围**: 特定讨论页面访问  
**可能原因**: 服务器端PHP代码执行异常

## 🔍 系统性诊断流程

### 第一步：检查服务器错误日志

#### 1.1 Flarum错误日志
```bash
# 查看Flarum应用日志
tail -f storage/logs/flarum.log

# 或者查看最新的错误
tail -100 storage/logs/flarum.log | grep -i error
```

#### 1.2 Web服务器错误日志
```bash
# Apache错误日志
tail -f /var/log/apache2/error.log

# Nginx错误日志  
tail -f /var/log/nginx/error.log

# 如果使用cPanel/WHM
tail -f /usr/local/apache/logs/error_log
```

#### 1.3 PHP错误日志
```bash
# 查看PHP错误日志
tail -f /var/log/php_errors.log

# 或者检查php.ini中指定的错误日志路径
php -i | grep error_log
```

### 第二步：启用Flarum调试模式

#### 2.1 临时开启调试模式
在Flarum根目录的 `config.php` 文件中：
```php
<?php return [
    'debug' => true,  // 临时设置为true
    'database' => [
        // ... 数据库配置
    ],
    // ... 其他配置
];
```

#### 2.2 访问问题页面
重新访问出错的URL，查看详细的错误堆栈信息。

⚠️ **安全警告**: 调试模式会暴露敏感信息，排查完成后务必关闭！

### 第三步：检查插件状态

#### 3.1 验证插件安装状态
```bash
# 检查插件是否正确安装
composer show steperlin/flarum-markdown

# 查看插件版本
php flarum info
```

#### 3.2 重新安装插件
```bash
# 完全移除插件
composer remove steperlin/flarum-markdown

# 清除缓存
php flarum cache:clear

# 重新安装最新版本
composer require steperlin/flarum-markdown

# 运行迁移
php flarum migrate
```

### 第四步：数据库诊断

#### 4.1 检查数据库连接
```php
<?php
// 在Flarum根目录创建test_db.php
$config = include 'config.php';
$db = $config['database'];

try {
    $pdo = new PDO(
        "mysql:host={$db['host']};dbname={$db['database']};charset=utf8mb4",
        $db['username'],
        $db['password']
    );
    echo "数据库连接正常\n";
} catch (PDOException $e) {
    echo "数据库连接失败: " . $e->getMessage() . "\n";
}
?>
```

#### 4.2 检查相关数据表
```sql
-- 检查讨论表
SELECT id, title, comment_count FROM discussions WHERE id = 317;

-- 检查帖子表
SELECT id, discussion_id, content FROM posts WHERE discussion_id = 317 LIMIT 5;

-- 检查是否有损坏的数据
SELECT id, content FROM posts WHERE discussion_id = 317 AND content IS NULL;
```

### 第五步：插件兼容性检查

#### 5.1 临时禁用其他插件
```bash
# 查看已安装的插件
php flarum info

# 临时禁用所有插件（除了markdown）
php flarum extension:disable flarum-tags
php flarum extension:disable flarum-likes
# ... 逐个禁用其他插件
```

#### 5.2 测试插件冲突
逐个重新启用插件，找出可能冲突的扩展。

### 第六步：内存和PHP配置检查

#### 6.1 检查PHP内存限制
```php
<?php
echo "Memory Limit: " . ini_get('memory_limit') . "\n";
echo "Max Execution Time: " . ini_get('max_execution_time') . "\n";
echo "Post Max Size: " . ini_get('post_max_size') . "\n";
?>
```

#### 6.2 调整PHP配置（如需要）
```ini
; 在php.ini中增加内存限制
memory_limit = 256M
max_execution_time = 300
post_max_size = 64M
upload_max_filesize = 64M
```

## 🔧 常见问题解决方案

### 问题1: Markdown内容解析错误
**现象**: 特定内容导致渲染失败  
**解决方案**:
```sql
-- 查找可能有问题的内容
SELECT id, LEFT(content, 100) as content_preview 
FROM posts 
WHERE discussion_id = 317 
AND content REGEXP '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]';
```

### 问题2: 字符编码问题
**现象**: 特殊字符导致数据库错误  
**解决方案**:
```sql
-- 检查字符集设置
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';

-- 修复字符集（如需要）
ALTER TABLE posts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 问题3: 文件权限问题
**现象**: 无法写入缓存或日志文件  
**解决方案**:
```bash
# 设置正确的文件权限
chown -R www-data:www-data storage/
chmod -R 755 storage/
chmod -R 775 storage/cache/
chmod -R 775 storage/logs/
```

### 问题4: 扩展配置冲突
**现象**: 与其他扩展的配置冲突  
**解决方案**:
```bash
# 重置扩展配置
php flarum migrate:reset --extension=steperlin-markdown
php flarum migrate --extension=steperlin-markdown
```

## 🛠️ 紧急修复脚本

创建紧急修复脚本 `fix_500_error.sh`:
```bash
#!/bin/bash
echo "开始修复Flarum 500错误..."

# 备份当前状态
cp config.php config.php.backup
cp -r storage/logs storage/logs.backup

# 清除所有缓存
php flarum cache:clear

# 重新构建资源
php flarum assets:publish

# 检查文件权限
chown -R $(whoami):$(whoami) .
chmod -R 755 .
chmod -R 775 storage/

# 重新安装插件
composer dump-autoload
php flarum migrate

echo "修复完成，请测试访问..."
```

## 📊 监控和预防

### 1. 设置错误监控
```php
// 在config.php中添加错误处理
'log_level' => 'debug',
'error_reporting' => E_ALL,
```

### 2. 定期备份
```bash
# 创建定期备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u username -p database_name > backup_$DATE.sql
tar -czf site_backup_$DATE.tar.gz . --exclude='storage/cache/*'
```

### 3. 性能监控
```javascript
// 添加到前端代码中
console.time('pageLoad');
window.addEventListener('load', function() {
    console.timeEnd('pageLoad');
    console.log('Page loaded successfully');
});
```

## 🆘 如果问题持续存在

1. **收集完整错误信息**:
   - Flarum版本
   - PHP版本
   - 插件版本
   - 完整的错误日志
   - 数据库相关信息

2. **创建最小化复现环境**:
   ```bash
   # 在测试环境中只安装markdown插件
   composer create-project flarum/flarum test_forum
   cd test_forum
   composer require steperlin/flarum-markdown
   ```

3. **联系支持**:
   - GitHub Issues: https://github.com/linkerlin/flarum-markdown/issues
   - 提供详细的错误信息和复现步骤

---

## 📋 检查清单

在排查过程中，请逐项确认：

- [ ] 服务器错误日志已检查
- [ ] Flarum调试模式已开启
- [ ] 插件版本是最新的(2.1.2+)
- [ ] 数据库连接正常
- [ ] 文件权限正确设置
- [ ] 缓存已清除
- [ ] 其他插件冲突已排除
- [ ] PHP配置满足要求
- [ ] 备份已创建

完成排查后，记得关闭调试模式并恢复生产环境配置！