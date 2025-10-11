# 🔧 Flarum Markdown 扩展故障排除指南

## 🚨 常见问题：Markdown 内容不渲染

### 问题描述
- 帖子内容显示原始 Markdown 语法而不是渲染后的格式
- 内容出现在 `<noscript>` 标签中
- 工具栏按钮正常，但现有帖子不渲染

### 🔍 诊断步骤

#### 1. 检查扩展状态
```bash
# 确认扩展已启用
php flarum extension:list

# 应该看到：
# ✓ steperlin-markdown
```

#### 2. 清除缓存
```bash
# 清除所有缓存
php flarum cache:clear

# 重建前端资源
php flarum assets:publish
```

#### 3. 检查浏览器控制台
1. 打开浏览器开发者工具 (F12)
2. 查看 Console 标签页
3. 寻找相关错误信息

#### 4. 使用调试工具
在浏览器控制台中运行：
```javascript
// 检查渲染器状态
MarkdownDebug.testRenderer('**测试文本**');

// 检查特定帖子
MarkdownDebug.inspectPost('帖子ID');

// 强制重新渲染
MarkdownDebug.reRenderPosts();
```

### 🛠️ 解决方案

#### 方案 1：强制重新构建
```bash
cd /path/to/flarum
cd extensions/steperlin-markdown/js
npm run build
php flarum cache:clear
```

#### 方案 2：检查依赖库
在浏览器控制台检查：
```javascript
// 检查核心依赖
console.log('marked:', window.marked);
console.log('DOMPurify:', window.DOMPurify);
console.log('app.markdown:', window.app.markdown);
```

#### 方案 3：手动触发渲染
```javascript
// 获取所有帖子并强制重新渲染
document.querySelectorAll('.PostContent').forEach(el => {
    const post = el.closest('[data-id]');
    if (post) {
        const postId = post.getAttribute('data-id');
        MarkdownDebug.inspectPost(postId);
    }
});
```

#### 方案 4：检查内容类型
某些情况下需要手动标记内容类型：
```sql
-- 在数据库中标记帖子为 markdown 类型
UPDATE posts SET content_type = 'markdown' WHERE content LIKE '%**%' OR content LIKE '%##%';
```

### 🔧 高级故障排除

#### 检查扩展加载顺序
```bash
# 查看扩展加载顺序
php flarum extension:list

# 确保 markdown 扩展在其他格式化扩展之后加载
```

#### 调试渲染过程
在 `PostContentRenderer.js` 中添加调试日志：
```javascript
renderContent(content, contentType) {
    console.log('🎨 Rendering content:', { content, contentType });
    
    // ... 现有代码 ...
    
    const result = app.markdown.render(content);
    console.log('✅ Render result:', result);
    return result;
}
```

#### 检查 Mithril 组件渲染
```javascript
// 在浏览器控制台中
m.mount(document.createElement('div'), require('./components/PostContentRenderer'));
```

### 📊 性能问题

#### 缓存问题
```javascript
// 清除渲染缓存
app.markdown.clearCache();

// 检查缓存状态
console.log('Cache size:', app.markdown.cache.size);
```

#### 内存泄漏
```javascript
// 监控内存使用
setInterval(() => {
    console.log('Cache size:', app.markdown.cache.size);
    if (app.markdown.cache.size > 1000) {
        app.markdown.clearCache();
        console.log('🗑️ Cache cleared due to size limit');
    }
}, 30000);
```

### 🔒 安全问题

#### DOMPurify 配置问题
检查是否有内容被过度过滤：
```javascript
// 测试 DOMPurify 配置
const testHtml = '<strong>测试</strong>';
const purified = DOMPurify.sanitize(testHtml);
console.log('Original:', testHtml);
console.log('Purified:', purified);
```

#### Spoiler 标签问题
```javascript
// 测试 spoiler 渲染
MarkdownDebug.testRenderer('>!这是一个剧透!<');
```

### 🚀 数据库迁移问题

#### 现有内容兼容性
```sql
-- 检查现有帖子的内容类型
SELECT content_type, COUNT(*) FROM posts GROUP BY content_type;

-- 标记包含 Markdown 语法的帖子
UPDATE posts 
SET content_type = 'markdown' 
WHERE content_type IS NULL 
  AND (
    content LIKE '%**%' OR 
    content LIKE '%*%' OR 
    content LIKE '%#%' OR 
    content LIKE '%```%' OR
    content LIKE '%>!%!<%'
  );
```

### 📱 移动端问题

#### 触摸设备上的 Spoiler
```css
/* 确保 spoiler 在移动设备上可点击 */
.spoiler {
    touch-action: manipulation;
    -webkit-touch-callout: none;
}
```

#### 响应式布局
```css
/* 预览编辑器在小屏幕上的布局 */
@media (max-width: 768px) {
    .MarkdownPreviewEditor .PreviewToolbar {
        flex-direction: column;
    }
}
```

### 🔄 与其他扩展的兼容性

#### BBCode 扩展冲突
```php
// 在 extend.php 中调整加载优先级
(new Extend\ServiceProvider())
    ->register(MarkdownServiceProvider::class);
```

#### 富文本编辑器冲突
如果安装了其他编辑器扩展，可能需要禁用或调整加载顺序。

### 📝 常见错误代码

| 错误信息 | 原因 | 解决方案 |
|---------|------|----------|
| `marked is not defined` | marked.js 未加载 | 检查依赖安装和构建 |
| `DOMPurify is not defined` | DOMPurify 未加载 | 重新构建扩展 |
| `app.markdown is undefined` | 渲染器未初始化 | 检查扩展初始化代码 |
| `Cannot read property 'render'` | 渲染器实例问题 | 重启 PHP-FPM 和清除缓存 |

### 📞 获取更多帮助

如果问题仍然存在：

1. **收集信息**：
   - Flarum 版本
   - PHP 版本
   - 浏览器和版本
   - 控制台错误信息
   - 其他安装的扩展

2. **创建最小化测试用例**：
   - 创建新帖子测试
   - 记录具体的 Markdown 语法
   - 截图或视频演示

3. **提交 Issue**：
   - [GitHub Issues](https://github.com/linkerlin/flarum-markdown/issues)
   - 包含所有收集的信息
   - 使用提供的 Issue 模板

### 🧪 测试检核表

在报告问题前，请确认已测试：

- [ ] 扩展已正确启用
- [ ] 已清除所有缓存
- [ ] 浏览器控制台无错误
- [ ] 新帖子可以正常渲染
- [ ] 工具栏按钮功能正常
- [ ] 预览功能工作正常
- [ ] 其他扩展已临时禁用测试

### 🎯 预防性维护

定期执行以下操作：

```bash
# 每周清理
php flarum cache:clear
php flarum assets:publish

# 每月更新
composer update steperlin/flarum-markdown
cd extensions/steperlin-markdown/js && npm run build
```

---

**记住**：大多数问题都可以通过清除缓存和重新构建解决。如果问题持续存在，请不要犹豫寻求帮助！