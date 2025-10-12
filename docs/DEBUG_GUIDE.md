# 🔍 Flarum 500错误调试指南

## 快速解决方案

### 1. 立即开启调试模式

在Flarum根目录的 `config.php` 文件中，将 `debug` 设置为 `true`：

```php
<?php
return [
    'debug' => true,  // 改为 true
    'database' => [
        // ... 其他配置
    ],
    // ... 其他配置
];
```

### 2. 清除缓存

```bash
php flarum cache:clear
```

### 3. 访问出错页面

现在访问之前出现500错误的页面，你将看到详细的错误信息。

## 问题根本原因

你遇到的错误是因为：

```
InvalidArgumentException: File not found at path: https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js
```

**原因**: Flarum的前端编译器不支持直接使用CDN链接，它会将URL当作本地文件路径处理。

## 已修复的问题

我已经移除了extend.php中的CDN注册，改为使用JavaScript动态加载方式：

- ✅ 移除了导致错误的CDN链接注册
- ✅ 改用DependencyManager动态加载依赖
- ✅ 支持多CDN源自动切换
- ✅ 提供优雅降级机制

## 验证修复

1. 更新插件到最新版本
2. 清除缓存：`php flarum cache:clear`  
3. 访问之前的错误页面
4. 检查浏览器控制台，应该看到依赖正常加载

## 如果仍有问题

请提供：
- 完整的错误堆栈信息
- 浏览器控制台日志
- 插件版本信息