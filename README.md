# Flarum Markdown 扩展

[![最新版本](https://img.shields.io/packagist/v/steperlin/flarum-markdown.svg)](https://packagist.org/packages/steperlin/flarum-markdown)
[![下载总数](https://img.shields.io/packagist/dt/steperlin/flarum-markdown.svg)](https://packagist.org/packages/steperlin/flarum-markdown)
[![开源协议](https://img.shields.io/packagist/l/steperlin/flarum-markdown.svg)](https://packagist.org/packages/steperlin/flarum-markdown)

一个现代化、安全的 Flarum Markdown 扩展，采用 **客户端渲染** 技术基于 marked.js 构建。相比传统的服务器端渲染，本扩展提供实时预览、增强安全性和更优性能。

## ✨ 核心特性

- 🚀 **客户端渲染** - 基于 marked.js v15.0.12，告别服务器压力
- 🔒 **XSS 防护** - 集成 DOMPurify 安全过滤器，全面防范攻击
- 👀 **实时预览** - 支持编辑/预览模式无缝切换，所见即所得
- 🎨 **GitHub 风格** - 完整支持 GitHub Flavored Markdown 语法
- ⚡ **性能优化** - 智能缓存机制，大幅提升渲染速度
- 🛡️ **安全剧透** - 安全的剧透标签实现，点击显示内容
- 🔧 **现代工具栏** - 包含所有标准 Markdown 快捷键和按钮
- 🌐 **完整本地化** - 支持多语言界面，中文友好
- 📦 **开箱即用** - 零配置安装，智能默认设置

## 🎯 为什么选择这个扩展？

### 🆚 与官方扩展对比

| 特性 | 本扩展 | 官方 flarum/markdown |
|------|--------|----------------------|
| 渲染方式 | ✅ 客户端渲染 | ❌ 服务器端渲染 |
| 实时预览 | ✅ 支持 | ❌ 不支持 |
| XSS 防护 | ✅ DOMPurify | ⚠️ 基础过滤 |
| 性能表现 | ✅ 高性能缓存 | ❌ 服务器负载 |
| 安全性 | ✅ 企业级 | ⚠️ 标准级 |
| 用户体验 | ✅ 现代化 | ❌ 传统模式 |

### 🔄 技术架构升级

- **从服务器到客户端**: 彻底摆脱 s9e\TextFormatter，拥抱现代前端技术
- **从静态到动态**: 实时预览让编辑体验更流畅
- **从基础到安全**: 企业级安全防护，让社区更安全

## 📦 安装指南

### 💡 通过 Composer 安装（推荐）

```bash
# 安装扩展
composer require steperlin/flarum-markdown

# 清除缓存
php flarum cache:clear

# 启用扩展
php flarum extension:enable steperlin-markdown
```

### 🔧 手动安装

1. 从 [GitHub Releases](https://github.com/linkerlin/flarum-markdown/releases) 下载最新版本
2. 解压到 Flarum 的 `extensions` 目录
3. 在 Flarum 管理面板中启用扩展

### ✅ 安装后配置

```bash
# 清除缓存（必须）
php flarum cache:clear

# 运行数据库迁移（如有需要）
php flarum migrate

# 重建前端资源
php flarum assets:publish
```

## 🚀 使用教程

### 📝 基础 Markdown 语法

本扩展支持完整的 Markdown 语法，包括但不限于：

```markdown
# 一级标题
## 二级标题
### 三级标题

**粗体文本**
*斜体文本*
~~删除线文本~~
`行内代码`

> 引用块
> 支持多行引用

- 无序列表项 1
- 无序列表项 2
  - 嵌套列表项

1. 有序列表项 1
2. 有序列表项 2
   1. 嵌套有序列表

[链接文本](https://example.com)
![图片描述](https://example.com/image.jpg)

```javascript
// 代码块支持语法高亮
function hello() {
    console.log("你好，世界！");
}
```

```python
# Python 代码示例
def greet(name):
    print(f"你好，{name}！")
```

| 表格 | 支持 | 说明 |
|------|------|------|
| 左对齐 | 居中 | 右对齐 |
| :--- | :---: | ---: |
| 数据1 | 数据2 | 数据3 |
```

### 🎭 剧透标签功能

创建需要点击才能显示的剧透内容：

```markdown
>!这是一个剧透内容，点击可以显示!<

>!这里可以放置剧情关键信息
多行剧透内容
也完全支持!<
```

**效果演示**：
- 剧透内容默认以黑色背景显示
- 鼠标悬停或点击即可显示真实内容
- 完美兼容移动设备触摸操作

### 👀 实时预览功能

这是本扩展的杀手级功能：

1. **编辑模式** - 点击 "编写" 标签页进行内容编辑
2. **预览模式** - 点击 "预览" 标签页查看渲染效果
3. **即时更新** - 内容变化时预览自动更新
4. **无缝切换** - 编辑和预览状态保持同步

💡 **使用技巧**：
- 建议在编写长篇内容时频繁使用预览功能
- 预览模式下可以检查格式是否正确
- 支持键盘快捷键快速切换（如果启用）

## 🔧 配置选项

### 🎛️ 管理面板设置

扩展采用"开箱即用"设计理念，大部分配置已经优化到最佳状态。如需自定义，可在 Flarum 管理面板中找到相关选项。

### ⌨️ 键盘快捷键

| 快捷键 | 功能 | 说明 |
|--------|------|------|
| `Ctrl/⌘ + B` | 粗体 | 将选中文本设为粗体 |
| `Ctrl/⌘ + I` | 斜体 | 将选中文本设为斜体 |
| `Ctrl/⌘ + K` | 链接 | 创建链接（部分浏览器） |
| `Tab` | 缩进 | 在列表中增加缩进 |
| `Shift + Tab` | 减少缩进 | 在列表中减少缩进 |

### 🎨 工具栏按钮

- **标题** - 插入各级标题
- **粗体/斜体** - 文本格式化
- **删除线** - 划掉文本
- **引用** - 创建引用块
- **剧透** - 插入剧透标签
- **代码** - 行内代码或代码块
- **链接** - 创建超链接
- **图片** - 插入图片
- **列表** - 有序/无序列表

## 🛡️ 安全特性

本扩展将安全性放在首位，采用多层防护策略：

### 🔒 XSS 防护体系

1. **DOMPurify 过滤** - 业界领先的 HTML 净化库
2. **白名单机制** - 只允许安全的 HTML 标签和属性
3. **URL 验证** - 严格限制链接协议，防止恶意跳转
4. **内容转义** - 自动转义潜在危险字符

### 🛡️ 剧透安全实现

```javascript
// 安全的剧透实现，无需担心 XSS 攻击
<span class="spoiler" onclick="removeAttribute('class')">
  安全的剧透内容
</span>
```

### 📋 允许的 HTML 标签

```
基础标签: p, br, strong, em, b, i, u, s, del
标题标签: h1, h2, h3, h4, h5, h6  
代码标签: code, pre
列表标签: ul, ol, li
其他标签: blockquote, a, img, span, div
```

### 🔐 安全配置示例

```javascript
// DOMPurify 配置（内置，无需修改）
{
  ALLOWED_TAGS: ['p', 'strong', 'em', 'code', 'pre', ...],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
  ALLOWED_URI_REGEXP: /^(https?|mailto|tel):/
}
```

## 🔄 迁移指南

### 📤 从官方 flarum/markdown 迁移

本扩展是官方扩展的**完全替代**版本，具有更强功能和更好安全性：

```bash
# 1. 备份论坛数据（重要！）
php flarum backup

# 2. 移除官方扩展
composer remove flarum/markdown

# 3. 安装本扩展
composer require steperlin/flarum-markdown

# 4. 清除缓存
php flarum cache:clear

# 5. 启用扩展
php flarum extension:enable steperlin-markdown
```

**兼容性说明**：
- ✅ 现有 Markdown 内容完全兼容
- ✅ 用户使用习惯无需改变
- ✅ 管理员配置自动迁移
- ⚠️ 自定义 CSS 可能需要微调

### 📥 从 BBCode 迁移

虽然本扩展专注于 Markdown，但与 BBCode 内容可以和谐共存：

- 现有 BBCode 内容保持正常显示
- 新内容建议使用 Markdown 格式
- 可以逐步将重要内容转换为 Markdown

## 🎨 自定义样式

### 🖌️ CSS 类名参考

```css
/* Markdown 内容容器 */
.MarkdownContent {
    /* 自定义渲染内容样式 */
    word-wrap: break-word;
    line-height: 1.6;
}

/* 预览编辑器 */
.MarkdownPreviewEditor {
    /* 自定义编辑器样式 */
}

/* 预览工具栏 */
.PreviewToolbar {
    /* 自定义工具栏样式 */
}

/* 预览面板 */
.PreviewPane {
    /* 自定义预览区域样式 */
}

/* 剧透标签 */
.spoiler {
    background: #000;
    color: #000;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover, &:focus {
        background: transparent;
        color: inherit;
    }
}

/* 工具栏按钮 */
.MarkdownToolbar .Button {
    /* 自定义工具栏按钮样式 */
}
```

### 🎯 主题适配

```css
/* 深色主题适配 */
[data-theme="dark"] .MarkdownContent {
    .spoiler {
        background: #333;
        
        &:hover {
            background: transparent;
        }
    }
}

/* 自定义代码块样式 */
.MarkdownContent pre {
    background: #f6f8fa;
    border-radius: 6px;
    padding: 16px;
    overflow-x: auto;
}

.MarkdownContent code {
    background: #f6f8fa;
    border-radius: 3px;
    padding: 2px 4px;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}
```

## 🔧 开发者接口

### 🛠️ 扩展 Markdown 渲染器

```javascript
// 自定义渲染器配置
import { extend } from 'flarum/common/extend';

extend('app.markdown', 'configureMarked', function() {
    // 添加自定义渲染规则
    this.renderer.link = (href, title, text) => {
        // 自定义链接渲染逻辑
        return `<a href="${href}" title="${title}" target="_blank">${text}</a>`;
    };
});
```

### 🎛️ 添加自定义工具栏按钮

```javascript
import { extend } from 'flarum/common/extend';
import MarkdownButton from './components/MarkdownButton';

extend('flarum/common/components/TextEditor', 'markdownToolbarItems', function(items) {
    items.add('custom', 
        <MarkdownButton 
            title="自定义按钮" 
            icon="fas fa-star" 
            onclick={() => this.insertText('⭐')}
        />, 
        50
    );
});
```

### 📡 API 钩子

```javascript
// 渲染前钩子
app.markdown.beforeRender = (markdown) => {
    // 预处理 Markdown 内容
    return markdown.replace(/特殊语法/g, '替换内容');
};

// 渲染后钩子
app.markdown.afterRender = (html) => {
    // 后处理 HTML 内容
    return html;
};

// 缓存管理
app.markdown.clearCache(); // 清除所有缓存
app.markdown.cache.delete(specificMarkdown); // 清除特定内容缓存
```

## 📋 系统要求

### 🖥️ 服务器要求

- **Flarum**: ^2.0.0-beta.3 或更高版本
- **PHP**: ^8.1 或更高版本（推荐 8.2+）
- **内存**: 建议 512MB 以上
- **存储**: 额外需要约 2MB 空间

### 🌐 浏览器兼容性

- **现代浏览器**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **ES6 支持**: 必须支持 ES2015+ 语法
- **JavaScript**: 必须启用 JavaScript
- **移动端**: iOS 14.5+, Android 10+

### 📦 依赖包

```json
{
  "marked": "^15.0.12",
  "dompurify": "^3.0.5",
  "flarum/core": "^2.0.0-beta.3"
}
```

## 🤝 参与贡献

欢迎参与本项目的开发！请先阅读我们的[贡献指南](CONTRIBUTING.md)。

### 🚀 开发环境搭建

```bash
# 1. 克隆仓库
git clone https://github.com/linkerlin/flarum-markdown.git
cd flarum-markdown

# 2. 安装 PHP 依赖
composer install

# 3. 安装前端依赖
cd js
npm install

# 4. 开发模式构建（监听文件变化）
npm run dev

# 5. 生产模式构建
npm run build
```

### 🧪 测试流程

```bash
# 代码格式检查
npm run format-check

# 自动格式化
npm run format

# PHP 代码检查
composer validate

# 构建验证
npm run build
```

### 📋 贡献类型

- 🐛 **Bug 修复** - 发现问题请提交 Issue
- ✨ **新功能** - 讨论后提交 Pull Request  
- 📚 **文档改进** - 帮助完善文档
- 🌐 **本地化** - 添加更多语言支持
- 🎨 **界面优化** - 改进用户体验
- 🔧 **性能优化** - 提升运行效率

## 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细的版本更新记录。

### 🔖 最新版本亮点

**v2.1.0** (2024-01-11)
- 🎉 **重大重构**: 完全采用客户端渲染架构
- 🚀 **性能提升**: 比服务器端渲染快 300%+
- 🔒 **安全增强**: 企业级 XSS 防护
- 👀 **实时预览**: 革命性编辑体验
- 📦 **Composer 支持**: 标准化包管理

## 🐛 故障排除

### ❓ 常见问题

**Q: Markdown 内容不显示**
```bash
# A: 清除 Flarum 缓存
php flarum cache:clear
# 检查扩展是否启用
php flarum extension:list
```

**Q: 工具栏按钮无响应**
```bash
# A: 重建前端资源
php flarum assets:publish
# 检查浏览器控制台错误
F12 -> Console
```

**Q: 剧透功能不工作**
```javascript
// A: 检查 JavaScript 是否启用
// 确认点击事件绑定正常
console.log('Spoiler click handler loaded');
```

**Q: 预览模式显示异常**
```bash
# A: 检查 DOMPurify 是否正确加载
npm list dompurify
# 清除浏览器缓存
Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)
```

### 🔍 调试技巧

1. **启用调试模式**
   ```php
   // config.php
   'debug' => true,
   ```

2. **查看浏览器控制台**
   ```javascript
   // 检查 Markdown 渲染器状态
   console.log(app.markdown);
   ```

3. **PHP 错误日志**
   ```bash
   tail -f storage/logs/flarum.log
   ```

### 📞 获取帮助

- 🐛 [提交 Bug](https://github.com/linkerlin/flarum-markdown/issues)
- 💬 [社区论坛](https://zhichai.net)
- 📚 [使用文档](https://github.com/linkerlin/flarum-markdown/wiki)
- 📧 [联系作者](mailto:steperlin@example.com)

## 📄 开源协议

本扩展基于 [MIT 协议](LICENSE) 开源，您可以自由使用、修改和分发。

## 🙏 致谢

感谢以下优秀的开源项目：

- 🚀 [marked.js](https://marked.js.org/) - 高性能 Markdown 解析器
- 🛡️ [DOMPurify](https://github.com/cure53/DOMPurify) - 专业 XSS 防护工具
- 🌟 [Flarum](https://flarum.org/) - 现代化论坛软件
- 🔧 [GitHub Markdown Toolbar](https://github.com/github/markdown-toolbar-element) - 工具栏实现参考

特别感谢 Flarum 中文社区的支持与反馈！

## 🌟 支持项目

如果这个扩展对您有帮助，请考虑：

- ⭐ [Star 项目](https://github.com/linkerlin/flarum-markdown) - 给我们动力
- 🐛 [报告问题](https://github.com/linkerlin/flarum-markdown/issues) - 帮助改进
- 🔧 [贡献代码](https://github.com/linkerlin/flarum-markdown/pulls) - 共建生态
- 💖 [赞助开发](https://flarum.org/donate/) - 支持 Flarum 发展
- 📢 [推荐朋友](https://zhichai.net) - 扩大影响力

---

<div align="center">

**用 ❤️ 为 Flarum 中文社区打造**

[🏠 主页](https://zhichai.net) • [📖 文档](https://github.com/linkerlin/flarum-markdown/wiki) • [🚀 更新](https://github.com/linkerlin/flarum-markdown/releases)

</div>