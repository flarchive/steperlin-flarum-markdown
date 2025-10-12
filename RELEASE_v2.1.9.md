# 🔍 Release v2.1.9 - 超详细调试日志版本

**发布日期**: 2025-10-12  
**版本号**: v2.1.9  
**提交**: db75dc0  
**Tag**: v2.1.9  
**类型**: 调试诊断版本

---

## 📋 版本说明

这是一个**专门用于调试诊断**的版本，添加了超详细的 console 日志输出，帮助快速定位 Markdown 内容未渲染的问题。

⚠️ **重要提示**：
- **生产环境建议使用 v2.1.8**（无调试日志的稳定版本）
- **此版本仅用于问题诊断**，会输出大量日志
- 调试完成后可回退到 v2.1.8

---

## 🔍 核心功能

### 超详细的调试日志系统

使用 `console.group/groupEnd` 分组输出，包含以下详细信息：

#### 1. 组件生命周期追踪
```javascript
🔧 === CommentPost.oninit 被调用 ===
   添加 detectMarkdownSyntax 方法
   Post ID: 123
   detectMarkdownSyntax 方法已添加
```

#### 2. 内容渲染追踪
```javascript
🎯 === CommentPost.contentHtml 被调用 ===
📍 调用时间: 2025-10-12T08:30:15.123Z
📍 Post ID: 123
📍 Component: CommentPost
```

#### 3. 内容详情输出
```javascript
📋 === 内容详情 ===
   postId: 123
   contentType: undefined
   hasRawContent: true
   rawContentLength: 50
   rawContent 前150字: composer require steperlin/flarum-markdown...
   originalHtml 前150字: <p>composer require...</p>
```

#### 4. Markdown 检测详情
```javascript
🔍 === 检测 Markdown 语法 ===
   内容长度: 50
   内容预览: composer require steperlin/flarum-markdown...
   ✓ 匹配: 分隔线
   
=== 检测结果 ===
   检测到的 Markdown 语法: 分隔线
   最终结果: ✅ 是 Markdown
```

#### 5. 渲染过程追踪
```javascript
✅ === 开始渲染 Markdown ===
   Post ID: 123
   触发原因: 检测到 Markdown 语法
   使用方法: renderSync
   
✨ === Markdown 渲染成功！ ===
   原始内容长度: 50
   渲染后长度: 150
   渲染时间: 5.23 ms
   渲染结果前200字: <p><strong>composer...</strong></p>
   原始HTML前200字: composer require...
   是否改变: true
```

#### 6. 错误详情
```javascript
❌ === Markdown 渲染失败！ ===
   错误类型: TypeError
   错误信息: Cannot read property 'parse' of undefined
   错误堆栈: TypeError: Cannot read...
```

---

## 📝 新增文档

### 1. QUICK_DEBUG_GUIDE.md
快速诊断指南，包含：
- 部署步骤
- 关键日志检查点
- 问题诊断清单
- 5个检查命令
- 常见问题解答

### 2. DEBUG_VERSION_2.1.9.md
详细的调试版本使用说明，包含：
- 完整的日志说明
- 详细的问题排查流程
- 回滚到普通版本的方法
- 收集调试信息的指南

---

## 🚀 使用方法

### 1. 安装调试版本

```bash
# 方式 A: Composer 更新
composer require steperlin/flarum-markdown:^2.1.9
php flarum cache:clear

# 方式 B: Git 拉取
cd /path/to/vendor/steperlin/flarum-markdown
git fetch origin
git checkout v2.1.9
cd ../../../../
php flarum cache:clear

# 方式 C: 手动上传
# 上传 js/dist/forum.js 到服务器
scp js/dist/forum.js user@server:/path/to/vendor/steperlin/flarum-markdown/js/dist/
```

### 2. 打开浏览器开发者工具

1. 访问论坛
2. 按 `F12` 打开开发者工具
3. 切换到 **Console** 标签
4. 硬刷新页面：`Cmd+Shift+R` (Mac) 或 `Ctrl+Shift+R` (Windows)

### 3. 查看日志输出

所有调试日志都以 emoji 开头，便于识别：
- 🎯 - 主要事件
- 📋 - 数据详情
- 🔍 - 检测和分析
- ✅ - 成功操作
- ⚠️ - 警告信息
- ❌ - 错误信息

### 4. 诊断问题

根据日志输出判断问题：

#### 情况 A：没有看到 `🎯 === CommentPost.contentHtml 被调用 ===`
**问题**：扩展未加载或路径错误  
**检查**：
- 文件是否正确上传
- 缓存是否清除
- 浏览器是否硬刷新

#### 情况 B：看到调用但 `detectMarkdownSyntax` 不存在
**问题**：`oninit` 扩展未生效  
**检查**：
- Flarum 版本兼容性
- 是否有其他扩展冲突

#### 情况 C：检测不到 Markdown 语法
**问题**：内容不匹配 Markdown 模式  
**检查**：
- 查看 `rawContent 前150字` 的实际内容
- 确认是否包含 Markdown 语法

#### 情况 D：检测到但渲染失败
**问题**：渲染器错误  
**检查**：
- 查看具体错误信息
- 检查依赖是否正确加载

---

## 🔍 诊断命令

在浏览器控制台运行以下命令收集信息：

### 1. 检查扩展状态
```javascript
console.log('app.markdown:', app.markdown);
console.log('status:', app.markdown?.getStatus());
```

### 2. 检查依赖
```javascript
console.log('marked:', typeof window.marked);
console.log('DOMPurify:', typeof window.DOMPurify);
```

### 3. 检查帖子数据
```javascript
const post = app.store.all('posts')[0];
console.log('Post ID:', post?.id());
console.log('Content:', post?.attribute('content'));
console.log('ContentType:', post?.attribute('contentType'));
```

### 4. 手动测试渲染
```javascript
const test = 'composer require steperlin/flarum-markdown\n======';
const result = app.markdown?.renderSync(test);
console.log('原始:', test);
console.log('渲染:', result);
```

### 5. 检查 CommentPost 组件
```javascript
const CommentPost = flarum.core.compat['common/components/CommentPost'];
console.log('组件:', !!CommentPost);
console.log('contentHtml:', typeof CommentPost?.prototype?.contentHtml);
```

---

## 📊 与 v2.1.8 的区别

| 特性 | v2.1.8 (稳定版) | v2.1.9 (调试版) |
|------|----------------|----------------|
| 功能 | 完整 | 完整 |
| 日志输出 | 基础 | 超详细 |
| 文件大小 | 31.2 KB | 34.4 KB |
| 性能影响 | 无 | 轻微（日志输出） |
| 用途 | 生产环境 | 问题诊断 |
| 推荐使用 | ✅ 是 | 仅调试时 |

---

## 🔄 回滚到稳定版本

如果调试完成，可以回滚到 v2.1.8：

```bash
# Composer 方式
composer require steperlin/flarum-markdown:2.1.8
php flarum cache:clear

# Git 方式
cd /path/to/vendor/steperlin/flarum-markdown
git checkout v2.1.8
cd ../../../../
php flarum cache:clear
```

---

## 📦 文件变更

### 修改的文件
- `CHANGELOG.md` - 添加 v2.1.9 版本说明
- `js/package.json` - 版本号升级到 2.1.9
- `js/src/common/index.js` - 添加详细调试日志
- `js/dist/*` - 重新编译

### 新增的文件
- `QUICK_DEBUG_GUIDE.md` - 快速诊断指南
- `docs/DEBUG_VERSION_2.1.9.md` - 详细使用说明
- `RELEASE_v2.1.9.md` - 本发布说明

---

## 🎯 适用场景

**适合使用此版本的情况**：
- ✅ Markdown 内容不渲染需要诊断
- ✅ 想要了解扩展的工作流程
- ✅ 开发或调试扩展功能
- ✅ 排查兼容性问题

**不适合使用此版本的情况**：
- ❌ 生产环境正常运行
- ❌ 不需要调试信息
- ❌ 关注性能优化
- ❌ 日志输出过多影响使用

---

## 📞 获取帮助

### 提供调试信息

如果问题仍然存在，请提供：

1. **完整的控制台日志**
   - 复制所有以 🎯, 📋, 🔍, ✅, ⚠️, ❌ 开头的日志

2. **5个检查命令的输出**
   - 见上面的"诊断命令"部分

3. **环境信息**
   - `php flarum info` 的输出
   - 浏览器和操作系统版本

4. **帖子内容示例**
   - 提供无法渲染的原始 Markdown 内容

### 联系方式

- 🐛 [GitHub Issues](https://github.com/linkerlin/flarum-markdown/issues)
- 💬 [论坛讨论](https://zhichai.net)
- 📧 steperlin@example.com

---

## 🙏 致谢

感谢所有用户的反馈和测试！

特别感谢：
- Flarum 社区的支持
- marked.js 和 DOMPurify 项目
- 所有报告问题的用户

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

**发布时间**: 2025-10-12  
**Git Commit**: db75dc0  
**Git Tag**: v2.1.9  
**分支**: 2.x

---

**Happy Debugging! 🔍**

使用这个版本，我们一定能找到 Markdown 不渲染的根本原因！
