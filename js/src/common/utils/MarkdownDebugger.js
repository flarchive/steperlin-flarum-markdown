/**
 * Markdown调试工具
 * 用于诊断Markdown渲染问题
 */
export default class MarkdownDebugger {
  constructor() {
    this.enabled = false;
    this.init();
  }

  init() {
    // 在开发模式下自动启用调试
    this.enabled = window.app?.forum?.attribute('debug') || 
                   localStorage.getItem('flarum_markdown_debug') === 'true';
    
    if (this.enabled) {
      console.log('🔧 Flarum Markdown Debug Mode Enabled');
      this.setupGlobalHelpers();
    }
  }

  /**
   * 设置全局调试辅助函数
   */
  setupGlobalHelpers() {
    window.MarkdownDebug = {
      // 测试渲染器
      testRenderer: (content) => {
        console.log('📝 Testing Markdown Renderer:');
        console.log('Input:', content);
        try {
          const result = window.app.markdown.render(content);
          console.log('Output:', result);
          return result;
        } catch (error) {
          console.error('❌ Rendering Error:', error);
          return null;
        }
      },

      // 检查帖子数据
      inspectPost: (postId) => {
        const post = window.app.store.getById('posts', postId);
        if (post) {
          console.log('📄 Post Data:', {
            id: post.id(),
            content: post.attribute('content'),
            contentHtml: post.attribute('contentHtml'),
            contentType: post.attribute('contentType'),
            data: post.data
          });
          return post;
        } else {
          console.log('❌ Post not found:', postId);
          return null;
        }
      },

      // 强制重新渲染页面上的所有帖子
      reRenderPosts: () => {
        console.log('🔄 Force re-rendering all posts...');
        window.m.redraw();
        console.log('✅ Re-render complete');
      },

      // 清除渲染器缓存
      clearCache: () => {
        if (window.app.markdown) {
          window.app.markdown.clearCache();
          console.log('🗑️ Markdown cache cleared');
        }
      },

      // 切换调试模式
      toggle: () => {
        this.enabled = !this.enabled;
        localStorage.setItem('flarum_markdown_debug', this.enabled.toString());
        console.log(`🔧 Debug mode ${this.enabled ? 'enabled' : 'disabled'}`);
        if (this.enabled) {
          this.setupGlobalHelpers();
        }
      }
    };

    // 添加控制台样式
    console.log('%c🎯 Markdown Debug Helpers Available:', 'color: #58a6ff; font-weight: bold;');
    console.log('- MarkdownDebug.testRenderer(content)');
    console.log('- MarkdownDebug.inspectPost(postId)');
    console.log('- MarkdownDebug.reRenderPosts()');
    console.log('- MarkdownDebug.clearCache()');
    console.log('- MarkdownDebug.toggle()');
  }

  /**
   * 记录渲染信息
   */
  logRender(input, output, duration) {
    if (!this.enabled) return;
    
    console.group('🎨 Markdown Render');
    console.log('Input:', input);
    console.log('Output:', output);
    console.log('Duration:', duration + 'ms');
    console.groupEnd();
  }

  /**
   * 记录错误
   */
  logError(error, context) {
    if (!this.enabled) return;
    
    console.group('❌ Markdown Error');
    console.error('Error:', error);
    console.log('Context:', context);
    console.groupEnd();
  }

  /**
   * 记录性能指标
   */
  logPerformance(stats) {
    if (!this.enabled) return;
    
    console.group('⚡ Performance Stats');
    console.table(stats);
    console.groupEnd();
  }

  /**
   * 验证渲染器状态
   */
  validateRenderer() {
    const issues = [];
    
    if (!window.app) {
      issues.push('App not initialized');
    }
    
    if (!window.app?.markdown) {
      issues.push('Markdown renderer not initialized');
    }
    
    if (!window.marked) {
      issues.push('marked.js library not loaded');
    }
    
    if (!window.DOMPurify) {
      issues.push('DOMPurify library not loaded');
    }
    
    if (issues.length > 0) {
      console.error('🚨 Renderer Validation Failed:', issues);
      return false;
    }
    
    console.log('✅ Renderer validation passed');
    return true;
  }
}

// 自动初始化调试器
export const markdownDebugger = new MarkdownDebugger();