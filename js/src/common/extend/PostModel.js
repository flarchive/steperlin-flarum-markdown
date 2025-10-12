import { extend } from 'flarum/common/extend';
import Post from 'flarum/common/models/Post';
import app from 'flarum/common/app';

export default function extendPostModel() {
  // 扩展Post模型以支持客户端Markdown渲染
  extend(Post.prototype, 'contentHtml', function(html) {
    // 检查是否需要进行Markdown渲染
    const contentType = this.attribute('contentType');
    const rawContent = this.attribute('content');
    
    // 如果明确标记为markdown类型，或者内容包含markdown语法
    if (contentType === 'markdown' || this.shouldRenderAsMarkdown(rawContent)) {
      if (app.markdown && rawContent) {
        try {
          return app.markdown.render(rawContent);
        } catch (error) {
          console.error('Markdown rendering error:', error);
          return html; // 降级到原始HTML
        }
      }
    }
    return html;
  });

  // 添加方法来检测内容是否应该作为Markdown渲染
  Post.prototype.shouldRenderAsMarkdown = function(content) {
    if (!content || typeof content !== 'string') {
      return false;
    }
    
    // 检测常见的Markdown语法模式
    const markdownPatterns = [
      /^#{1,6}\s+/m,           // 标题 # ## ###
      /\*\*.*?\*\*/g,          // 粗体 **text**
      /\*.*?\*/g,             // 斜体 *text*
      /\[.*?\]\(.*?\)/g,       // 链接 [text](url)
      /`.*?`/g,               // 行内代码 `code`
      /^```[\s\S]*?```$/m,     // 代码块
      /^>\s+/m,               // 引用 >
      /^[-*+]\s+/m,           // 无序列表
      /^\d+\.\s+/m,           // 有序列表
      />!.*?!</g,             // Spoiler >!text!<
      /~~.*?~~/g              // 删除线 ~~text~~
    ];
    
    return markdownPatterns.some(pattern => pattern.test(content));
  };

  // 处理编辑时的内容
  extend(Post.prototype, 'save', function(promise, data) {
    // 确保保存原始markdown而不是渲染后的HTML
    if (data.content) {
      // 标记内容类型为markdown
      data.contentType = 'markdown';
      data.contentMarkdown = data.content;
    }
    return promise;
  });
}