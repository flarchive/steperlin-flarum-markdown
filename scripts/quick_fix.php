<?php
/**
 * Flarum Markdown插件500错误快速修复工具
 * 
 * 使用方法: php quick_fix.php
 * 
 * 此脚本将尝试修复常见的500错误问题
 */

echo "🛠️ Flarum Markdown插件500错误快速修复工具\n";
echo "==========================================\n\n";

// 颜色代码
const RED = "\033[31m";
const GREEN = "\033[32m";
const YELLOW = "\033[33m";
const BLUE = "\033[34m";
const RESET = "\033[0m";

function colorLog($message, $color = RESET) {
    echo $color . $message . RESET . "\n";
}

function section($title) {
    echo "\n" . BLUE . "=== $title ===" . RESET . "\n\n";
}

function success($message) {
    colorLog("✓ $message", GREEN);
}

function warning($message) {
    colorLog("⚠ $message", YELLOW);
}

function error($message) {
    colorLog("✗ $message", RED);
}

// 检查是否在Flarum根目录
if (!file_exists('flarum') || !file_exists('config.php')) {
    error("请在Flarum根目录中运行此脚本！");
    exit(1);
}

section("步骤1: 环境检查");

// 检查PHP版本
$phpVersion = PHP_VERSION;
colorLog("PHP版本: $phpVersion");

if (version_compare($phpVersion, '8.1.0', '<')) {
    warning("PHP版本可能过低，建议使用PHP 8.1+");
}

// 检查内存限制
$memoryLimit = ini_get('memory_limit');
colorLog("内存限制: $memoryLimit");

$memoryInBytes = preg_replace('/[^0-9]/', '', $memoryLimit) * (1024 * 1024);
if ($memoryInBytes < 128 * 1024 * 1024) { // 小于128MB
    warning("内存限制可能不足，建议至少256MB");
}

section("步骤2: 配置检查和修复");

// 读取配置文件
try {
    $config = include 'config.php';
    success("配置文件读取成功");
    
    // 检查调试模式
    if (!isset($config['debug']) || !$config['debug']) {
        warning("调试模式未开启，建议临时开启以查看详细错误");
        echo "临时开启方法: 在config.php中设置 'debug' => true\n";
    } else {
        success("调试模式已开启");
    }
    
} catch (Exception $e) {
    error("配置文件读取失败: " . $e->getMessage());
    exit(1);
}

section("步骤3: 数据库连接测试");

try {
    $db = $config['database'];
    $dsn = "mysql:host={$db['host']};dbname={$db['database']};charset=utf8mb4";
    $pdo = new PDO($dsn, $db['username'], $db['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    success("数据库连接正常");
    
    // 测试查询讨论317
    try {
        $stmt = $pdo->prepare("SELECT id, title, slug, comment_count FROM discussions WHERE id = ?");
        $stmt->execute([317]);
        $discussion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($discussion) {
            success("讨论317存在: " . $discussion['title']);
            colorLog("评论数: " . $discussion['comment_count']);
            
            // 检查相关帖子
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM posts WHERE discussion_id = ?");
            $stmt->execute([317]);
            $postCount = $stmt->fetch(PDO::FETCH_ASSOC);
            colorLog("实际帖子数: " . $postCount['count']);
            
            // 检查是否有异常内容
            $stmt = $pdo->prepare("
                SELECT id, type, LENGTH(content) as content_length 
                FROM posts 
                WHERE discussion_id = ? 
                AND (content IS NULL OR content = '' OR LENGTH(content) > 65535)
                LIMIT 5
            ");
            $stmt->execute([317]);
            $problematicPosts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if ($problematicPosts) {
                warning("发现可能有问题的帖子:");
                foreach ($problematicPosts as $post) {
                    echo "  - 帖子ID: {$post['id']}, 类型: {$post['type']}, 内容长度: {$post['content_length']}\n";
                }
            } else {
                success("帖子内容检查正常");
            }
            
        } else {
            error("讨论317不存在！");
            echo "可能的原因:\n";
            echo "1. 讨论已被删除\n";
            echo "2. 数据库数据不一致\n";
            echo "3. URL路由问题\n";
        }
        
    } catch (PDOException $e) {
        error("查询讨论时出错: " . $e->getMessage());
    }
    
} catch (PDOException $e) {
    error("数据库连接失败: " . $e->getMessage());
    echo "请检查数据库配置和服务状态\n";
}

section("步骤4: 文件权限修复");

$directories = ['storage', 'storage/cache', 'storage/logs', 'storage/views'];

foreach ($directories as $dir) {
    if (is_dir($dir)) {
        $perm = substr(sprintf('%o', fileperms($dir)), -4);
        colorLog("$dir 权限: $perm");
        
        if (!is_writable($dir)) {
            warning("$dir 不可写，尝试修复...");
            if (chmod($dir, 0775)) {
                success("$dir 权限已修复");
            } else {
                error("$dir 权限修复失败");
            }
        } else {
            success("$dir 权限正常");
        }
    } else {
        warning("目录 $dir 不存在");
    }
}

section("步骤5: 缓存清理");

echo "清理缓存中...\n";
$commands = [
    'php flarum cache:clear',
    'php flarum assets:publish'
];

foreach ($commands as $cmd) {
    echo "执行: $cmd\n";
    $output = [];
    $returnCode = 0;
    exec($cmd . ' 2>&1', $output, $returnCode);
    
    if ($returnCode === 0) {
        success("命令执行成功");
    } else {
        error("命令执行失败:");
        foreach ($output as $line) {
            echo "  $line\n";
        }
    }
}

section("步骤6: 插件状态检查");

// 检查composer.json中的依赖
if (file_exists('composer.json')) {
    $composerData = json_decode(file_get_contents('composer.json'), true);
    if (isset($composerData['require']['steperlin/flarum-markdown'])) {
        $version = $composerData['require']['steperlin/flarum-markdown'];
        success("Markdown插件已在composer.json中: $version");
    } else {
        warning("Markdown插件未在composer.json中找到");
    }
}

// 检查vendor目录
if (is_dir('vendor/steperlin/flarum-markdown')) {
    success("插件文件存在于vendor目录");
    
    // 检查插件版本
    $extendFile = 'vendor/steperlin/flarum-markdown/extend.php';
    if (file_exists($extendFile)) {
        success("插件extend.php文件存在");
    } else {
        error("插件extend.php文件缺失");
    }
} else {
    error("插件文件在vendor目录中缺失");
    echo "请运行: composer require steperlin/flarum-markdown\n";
}

section("步骤7: 日志分析");

$logFile = 'storage/logs/flarum.log';
if (file_exists($logFile)) {
    colorLog("分析最近的错误日志...");
    
    $logContent = file_get_contents($logFile);
    $lines = explode("\n", $logContent);
    $recentErrors = array_slice(array_reverse($lines), 0, 20);
    
    $errorPatterns = [
        'Fatal error',
        'Uncaught exception',
        'Class.*not found',
        'Call to undefined',
        'syntax error',
        '500',
        'Internal Server Error'
    ];
    
    $foundErrors = [];
    foreach ($recentErrors as $line) {
        foreach ($errorPatterns as $pattern) {
            if (stripos($line, $pattern) !== false) {
                $foundErrors[] = $line;
                break;
            }
        }
    }
    
    if ($foundErrors) {
        warning("发现相关错误:");
        foreach (array_slice($foundErrors, 0, 5) as $error) {
            echo "  " . trim($error) . "\n";
        }
    } else {
        success("日志中未发现明显错误");
    }
} else {
    warning("未找到Flarum日志文件");
}

section("修复完成");

echo GREEN . "快速修复已完成！" . RESET . "\n\n";

echo "下一步建议:\n";
echo "1. 重新访问问题页面测试\n";
echo "2. 如果仍有问题，开启调试模式查看详细错误\n";
echo "3. 检查Web服务器错误日志\n";
echo "4. 考虑运行完整诊断: bash scripts/diagnose.sh\n\n";

echo "如果问题持续存在，请提供以下信息寻求支持:\n";
echo "- Flarum版本\n";
echo "- PHP版本: $phpVersion\n";
echo "- 插件版本\n";
echo "- 完整的错误日志\n";
echo "- 上述诊断结果\n";

?>