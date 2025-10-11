# 🧪 Flarum Markdown 插件测试指南

## 修复验证步骤

### 步骤 1: 更新插件
```bash
# 在你的Flarum网站根目录执行
composer update steperlin/flarum-markdown
php flarum cache:clear
```

### 步骤 2: 检查浏览器控制台
1. 打开你的Flarum论坛
2. 按 `F12` 打开开发者工具
3. 查看 Console 标签页
4. 应该**不再**看到以下错误：
   ```
   🚨 Renderer Validation Failed: 
   ['marked.js library not loaded', 'DOMPurify library not loaded']
   ```

### 步骤 3: 测试Markdown渲染
创建一个新帖子或回复，使用以下Markdown内容测试：

```markdown
# 标题测试
这是一个**粗体**文本和*斜体*文本的测试。

## 代码测试
```javascript
console.log('Hello World!');
```

## 列表测试
- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2

## 链接测试
[Flarum官网](https://flarum.org)

## 引用测试
> 这是一个引用块
> 可以包含多行内容

## Spoiler测试
>! 这是隐藏内容 !<
```

### 步骤 4: 验证渲染效果
确认以下内容正确渲染：
- ✅ 标题显示为大字体
- ✅ **粗体**和*斜体*正常显示
- ✅ 代码块有语法高亮背景
- ✅ 列表项有正确的项目符号
- ✅ 链接可以点击
- ✅ 引用块有特殊样式
- ✅ Spoiler内容可以点击显示/隐藏

### 步骤 5: 开启调试模式（可选）
在浏览器控制台中执行：
```javascript
// 开启调试模式
localStorage.setItem('flarum_markdown_debug', 'true');
location.reload();

// 测试渲染器
MarkdownDebug.testRenderer('**测试内容**');

// 检查依赖
MarkdownDebug.validateRenderer();
```

## 已知问题解决方案

### 问题：CDN加载慢
如果CDN加载较慢，可以在extend.php中更换CDN源：
```php
// 更换为更快的CDN
->js('https://unpkg.com/marked@15.0.12/marked.min.js')
->js('https://unpkg.com/dompurify@3.0.5/dist/purify.min.js')
```

### 问题：网络限制
如果无法访问CDN，可以下载库文件到本地：
1. 下载marked.min.js和purify.min.js到 `public/assets/` 目录
2. 修改extend.php中的路径为本地路径

## 性能监控

使用调试工具监控性能：
```javascript
// 查看渲染性能统计
MarkdownDebug.logPerformance();

// 清除缓存重新测试
MarkdownDebug.clearCache();
MarkdownDebug.reRenderPosts();
```

## 报告问题

如果仍有问题，请提供以下信息：
1. 浏览器控制台完整错误信息
2. 网络请求状态（Network标签页）
3. Flarum版本和PHP版本
4. 插件版本（应为2.1.2或更高）

---

## 技术说明

此版本的关键修复：
- 🔄 **依赖加载方式改变**: 从webpack bundle改为CDN加载
- 🌐 **全局变量访问**: 使用 `window.marked` 和 `window.DOMPurify`
- 🛠️ **错误处理增强**: 更好的依赖检查和回退机制
- 📦 **构建简化**: 移除复杂的外部依赖配置

这些更改确保了库能够正确加载并在所有支持的浏览器中工作。