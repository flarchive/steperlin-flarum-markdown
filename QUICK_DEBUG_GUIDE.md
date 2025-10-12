# 🚨 Markdown 渲染问题 - 快速调试指南

## 问题现状

✅ 依赖加载成功（marked.js + DOMPurify）  
✅ 渲染器初始化成功  
❌ 但 Markdown 内容仍然**没有渲染**

---

## 🔍 新版本：超详细调试日志

已经更新代码添加**超详细的 console 日志**，现在需要你：

### 1️⃣ 下载新编译的文件

```bash
# 方式 A: Git 拉取（如果服务器有 Git）
cd /path/to/flarum/vendor/steperlin/flarum-markdown
git pull origin 2.x

# 方式 B: 手动下载
# 从 GitHub 下载最新的 forum.js 和 admin.js
# https://github.com/linkerlin/flarum-markdown/tree/2.x/js/dist
```

### 2️⃣ 上传到服务器

```bash
# 上传编译后的文件
scp js/dist/forum.js user@server:/path/to/flarum/vendor/steperlin/flarum-markdown/js/dist/
scp js/dist/admin.js user@server:/path/to/flarum/vendor/steperlin/flarum-markdown/js/dist/
```

### 3️⃣ 清除缓存

```bash
# 在服务器上执行
php flarum cache:clear
```

### 4️⃣ 打开浏览器开发者工具

1. 访问你的论坛
2. 按 `F12` 打开开发者工具
3. 切换到 **Console** 标签
4. **硬刷新页面**：`Cmd+Shift+R` (Mac) 或 `Ctrl+Shift+R` (Windows)

---

## 📊 关键日志检查

### ✅ 你应该看到这些日志：

#### 初始化阶段：
```
🚀 初始化Flarum Markdown插件...
🎯 Markdown渲染器已就绪
```

#### 组件初始化：
```
🔧 === CommentPost.oninit 被调用 ===
   添加 detectMarkdownSyntax 方法
   detectMarkdownSyntax 方法已添加
```

#### **最关键** - 内容渲染：
```
🎯 === CommentPost.contentHtml 被调用 ===
📍 Post ID: 123
📋 === 内容详情 ===
   rawContent 前150字: composer require steperlin/flarum-markdown...
🔍 === Markdown 检测 ===
   检测到的 Markdown 语法: 分隔线
✅ === 开始渲染 Markdown ===
✨ === Markdown 渲染成功！ ===
```

---

## 🎯 关键问题诊断

### 问题 A：没有看到 `contentHtml 被调用`

**这是核心问题！** 说明扩展没有生效。

**请检查**：
1. 文件是否正确上传？
   ```bash
   ls -lh /path/to/vendor/steperlin/flarum-markdown/js/dist/forum.js
   # 应该显示约 34.4 KB，更新时间是今天
   ```

2. 缓存是否清除？
   ```bash
   php flarum cache:clear
   ```

3. 浏览器是否硬刷新？
   - 不要只按 F5
   - 必须按 `Cmd+Shift+R` 或 `Ctrl+Shift+R`

4. Flarum 版本？
   ```bash
   php flarum info
   ```

### 问题 B：看到调用但没有渲染

**检查日志中的**：
```
🔍 === Markdown 检测 ===
   检测到的 Markdown 语法: ???
```

如果显示 `无`，说明内容不匹配 Markdown 模式。

**解决方案**：
查看 `rawContent 前150字` 的内容，确认是否包含 Markdown 语法。

### 问题 C：检测到但渲染失败

**查看错误信息**：
```
❌ === Markdown 渲染失败！ ===
   错误信息: ...
```

复制完整错误信息。

---

## 📋 需要你提供的信息

请在控制台运行以下命令并**复制完整输出**：

### 1. 检查扩展状态
```javascript
console.log('=== 扩展状态 ===');
console.log('app.markdown:', app.markdown);
console.log('app.markdown.getStatus():', app.markdown?.getStatus());
```

### 2. 检查依赖
```javascript
console.log('=== 依赖状态 ===');
console.log('window.marked:', typeof window.marked);
console.log('window.DOMPurify:', typeof window.DOMPurify);
```

### 3. 检查帖子数据
```javascript
console.log('=== 帖子数据 ===');
const post = app.store.all('posts')[0];
console.log('Post ID:', post?.id());
console.log('Content:', post?.attribute('content'));
console.log('ContentType:', post?.attribute('contentType'));
```

### 4. 手动测试渲染
```javascript
console.log('=== 手动渲染测试 ===');
const testContent = 'composer require steperlin/flarum-markdown\n======';
console.log('原始内容:', testContent);
const result = app.markdown?.renderSync(testContent);
console.log('渲染结果:', result);
```

### 5. 检查 CommentPost 组件
```javascript
console.log('=== CommentPost 组件 ===');
const CommentPost = flarum.core.compat['common/components/CommentPost'];
console.log('组件存在:', !!CommentPost);
console.log('contentHtml 方法:', typeof CommentPost?.prototype?.contentHtml);
```

---

## 🔄 完整的控制台日志

**请复制 Console 中的所有日志，包括**：
- 所有以 `🎯`, `📝`, `🔍`, `✅`, `⚠️`, `❌` 开头的日志
- 任何红色的错误信息
- 上面 5 个检查命令的输出

**然后发给我或者创建 GitHub Issue**。

---

## 💡 可能的根本原因

### 猜测 1：Flarum 版本不兼容

可能 Flarum 2.x 使用了不同的组件或方法。

**验证**：
```javascript
// 查找所有帖子相关组件
Object.keys(flarum.core.compat).filter(k => k.toLowerCase().includes('post'))
```

### 猜测 2：另一个扩展覆盖了我们的扩展

**验证**：
```bash
# 列出所有扩展
php flarum info
```

尝试禁用其他 Markdown 相关扩展。

### 猜测 3：帖子内容的 contentHtml 来自服务器

如果 Flarum 从服务器直接获取 `contentHtml`，我们的客户端扩展就无效。

**验证**：
查看网络请求中帖子 API 的响应，看是否已经包含渲染后的 HTML。

---

## 📞 联系方式

**GitHub Issue**: https://github.com/linkerlin/flarum-markdown/issues

请附上：
1. ✅ 完整的控制台日志
2. ✅ 上面 5 个检查命令的输出
3. ✅ `php flarum info` 的输出
4. ✅ 帖子的原始内容示例
5. ✅ 浏览器和操作系统信息

---

**当前版本**: v2.1.8-debug  
**提交**: adab395  
**更新时间**: 2025-10-12

---

## 🎯 下一步

1. ⬆️ **立即上传**新的 `forum.js` 文件
2. 🧹 **清除缓存** `php flarum cache:clear`
3. 🔄 **硬刷新**浏览器
4. 📋 **复制**所有控制台日志
5. 📤 **提供**给我进行分析

有了详细日志，我们就能准确定位问题所在！
