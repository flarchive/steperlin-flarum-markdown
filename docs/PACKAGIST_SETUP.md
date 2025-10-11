# Packagist 自动更新配置指南

本指南将帮助您配置 GitHub 到 Packagist 的自动更新 webhook，确保包版本能够自动同步。

## 🎯 配置目标

- ✅ 当推送新标签时自动更新 Packagist
- ✅ 当发布 GitHub Release 时自动同步
- ✅ 确保用户总能获得最新版本

## 📋 配置步骤

### 1. 在 Packagist 上提交包

#### 1.1 注册/登录 Packagist
1. 访问 [https://packagist.org](https://packagist.org)
2. 如果没有账户，点击 "Sign Up" 注册
3. 建议使用 GitHub 账户直接登录

#### 1.2 提交包
1. 登录后点击 "Submit" 按钮
2. 在 "Repository URL" 输入：
   ```
   https://github.com/linkerlin/flarum-markdown
   ```
3. 点击 "Check" 验证包信息
4. 确认以下信息正确：
   - 包名：`steperlin/flarum-markdown`
   - 描述：A modern, secure Markdown extension for Flarum...
   - 许可证：MIT
5. 点击 "Submit" 完成提交

#### 1.3 获取 API Token
1. 在 Packagist 个人资料页面找到 "API Token" 部分
2. 生成新的 API Token（如果没有的话）
3. 复制并妥善保存这个 Token

### 2. 配置 GitHub Secrets

#### 2.1 添加 Packagist 凭据
1. 进入 GitHub 仓库页面
2. 点击 "Settings" -> "Secrets and variables" -> "Actions"
3. 点击 "New repository secret" 添加以下密钥：

**PACKAGIST_USERNAME**
```
值：您的 Packagist 用户名
```

**PACKAGIST_TOKEN**
```
值：从 Packagist 复制的 API Token
```

### 3. 配置 GitHub Webhook（可选）

#### 3.1 获取 Packagist Webhook URL
1. 在 Packagist 上找到您的包页面
2. 进入包的设置页面
3. 找到 "GitHub Service Hook" 部分
4. 复制提供的 Webhook URL，格式类似：
   ```
   https://packagist.org/api/github?username=steperlin
   ```

#### 3.2 在 GitHub 添加 Webhook
1. 进入 GitHub 仓库设置
2. 点击 "Webhooks" -> "Add webhook"
3. 配置如下：
   - **Payload URL**: 从 Packagist 复制的 URL
   - **Content type**: application/json
   - **Secret**: 留空
   - **Events**: 选择 "Just the push event"
4. 点击 "Add webhook"

### 4. 测试自动更新

#### 4.1 创建测试标签
```bash
# 创建一个测试标签
git tag v2.1.1
git push origin v2.1.1
```

#### 4.2 验证更新
1. 检查 GitHub Actions 是否成功运行
2. 访问 Packagist 包页面确认版本已更新
3. 测试 composer 安装：
   ```bash
   composer require steperlin/flarum-markdown:^2.1
   ```

## 🔄 自动更新机制

### GitHub Actions 触发器
- ✅ 推送任何 `v*` 格式的标签
- ✅ 发布新的 GitHub Release
- ✅ 自动调用 Packagist API 更新包信息

### Webhook 触发器（备用）
- ✅ 任何推送到主分支的提交
- ✅ 直接通过 HTTP 请求通知 Packagist
- ✅ 作为 GitHub Actions 的补充机制

## 🐛 故障排除

### 常见问题

**Q: GitHub Actions 失败，提示 "Unauthorized"**
```bash
# A: 检查 Secrets 配置
# 1. 确认 PACKAGIST_USERNAME 正确
# 2. 确认 PACKAGIST_TOKEN 有效且未过期
# 3. 重新生成 Token 并更新 Secret
```

**Q: Packagist 显示 "Could not retrieve package information"**
```bash
# A: 检查 composer.json 格式
composer validate
# 确保所有必需字段都存在且格式正确
```

**Q: Webhook 返回 404 错误**
```bash
# A: 检查 Webhook URL
# 1. 确认 URL 中的用户名正确
# 2. 确认包已在 Packagist 上成功提交
# 3. 尝试手动触发更新
```

### 手动更新包
如果自动更新失败，可以手动更新：

1. 访问 Packagist 包页面
2. 点击 "Update" 按钮
3. 等待几分钟让系统同步

### 检查更新状态
```bash
# 检查最新版本
composer show steperlin/flarum-markdown

# 强制更新本地缓存
composer clear-cache
composer update steperlin/flarum-markdown
```

## 📊 监控和维护

### 定期检查
- 🔍 每月检查 GitHub Actions 运行状态
- 🔍 验证 Packagist 版本同步是否正常
- 🔍 确认 API Token 未过期

### 最佳实践
- 📝 使用语义化版本标签（v2.1.0, v2.1.1）
- 📝 发布前先测试 composer.json 有效性
- 📝 保持 GitHub Release 和标签同步
- 📝 在 Release 中提供详细的更新日志

## 🎉 完成确认

配置完成后，您的包将具备以下能力：

- ✅ 自动版本同步
- ✅ 用户可通过 Composer 安装最新版本
- ✅ 支持版本约束和依赖管理
- ✅ 与 Flarum 扩展生态完全集成

现在用户可以通过以下命令轻松安装您的扩展：

```bash
composer require steperlin/flarum-markdown
```

恭喜！您的 Flarum Markdown 扩展现在已经完全集成到 Composer 生态系统中！