import Component from 'flarum/common/Component';
import app from 'flarum/common/app';

/**
 * PostContentRenderer 组件
 * 专门处理帖子内容的 Markdown 渲染
 */
export default class PostContentRenderer extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    this.post = vnode.attrs.post;
    this.renderedContent = null;
    this.lastContentHash = null;
  }

  view() {
    if (!this.post) {
      return m('div');
    }

    const rawContent = this.post.attribute('content');
    const contentType = this.post.attribute('contentType');
    
    // 调试信息
    console.log('🎯 PostContentRenderer processing post:', {
      postId: this.post.id(),
      rawContent,
      contentType,
      shouldRender: this.detectMarkdownSyntax(rawContent)
    });
    
    // 生成内容哈希来检测变化
    const contentHash = this.generateContentHash(rawContent);
    
    // 如果内容发生变化，重新渲染
    if (this.lastContentHash !== contentHash) {
      this.renderedContent = this.renderContent(rawContent, contentType);
      this.lastContentHash = contentHash;
    }

    return m('div.PostContent', {
      innerHTML: this.renderedContent
    });
  }

  /**
   * 渲染内容 - 支持异步渲染
   */
  renderContent(content, contentType) {
    if (!content || typeof content !== 'string') {
      return '';
    }

    // 如果明确标记为 markdown 或检测到 markdown 语法
    if (contentType === 'markdown' || this.detectMarkdownSyntax(content)) {
      if (app.markdown) {
        try {
          // 使用同步渲染方法以兼容现有代码
          const result = app.markdown.renderSync ? 
            app.markdown.renderSync(content) : 
            app.markdown.render(content);
          
          // 如果是Promise，处理异步结果
          if (result && typeof result.then === 'function') {
            result.then(html => {
              this.renderedContent = html;
              m.redraw(); // 重新绘制组件
            }).catch(error => {
              console.error('Async markdown rendering failed:', error);
              this.renderedContent = this.escapeHtml(content);
              m.redraw();
            });
            
            // 返回加载状态或缓存结果
            return this.renderedContent || this.getLoadingHtml();
          }
          
          return result;
        } catch (error) {
          console.error('Markdown rendering failed:', error);
          return this.escapeHtml(content);
        }
      }
    }

    // 如果不是 markdown，返回原始内容（转义HTML）
    return this.escapeHtml(content);
  }

  /**
   * 获取加载中的HTML
   */
  getLoadingHtml() {
    return '<div class="MarkdownRenderer-loading">🔄 正在渲染Markdown...</div>';
  }

  /**
   * 检测是否包含 Markdown 语法
   */
  detectMarkdownSyntax(content) {
    if (!content || typeof content !== 'string') {
      return false;
    }

    // 检测常见的 Markdown 语法模式
    const markdownPatterns = [
      /^#{1,6}\s+/m,           // 标题
      /\*\*.*?\*\*/,           // 粗体
      /\*.*?\*/,               // 斜体（不匹配粗体）
      /\[.*?\]\(.*?\)/,        // 链接
      /`.*?`/,                 // 行内代码
      /^```[\s\S]*?```$/m,     // 代码块
      /^>\s+/m,                // 引用
      /^[-*+]\s+/m,            // 无序列表
      /^\d+\.\s+/m,            // 有序列表
      />!.*?!</,               // Spoiler
      /~~.*?~~/,               // 删除线
      /======/,                // 分隔线（用户示例中的）
    ];

    return markdownPatterns.some(pattern => pattern.test(content));
  }

  /**
   * 转义HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 生成内容哈希
   */
  generateContentHash(content) {
    if (!content) return '';
    // 简单的哈希函数
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString();
  }
}