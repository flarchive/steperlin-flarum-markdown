/**
 * 本地依赖加载器
 * 当CDN加载失败时的备用方案
 */
export default class LocalDependencyLoader {
  constructor() {
    this.fallbackSources = {
      marked: this.getMarkedFallback(),
      dompurify: this.getDOMPurifyFallback()
    };
  }

  /**
   * 获取marked.js的本地备用版本（简化版）
   */
  getMarkedFallback() {
    return `
    // Marked.js simplified fallback version
    (function() {
      'use strict';
      
      function marked(src) {
        if (typeof src !== 'string') return '';
        
        var html = src
          // Headers
          .replace(/^#{6}\\s+(.+)$/gm, '<h6>$1</h6>')
          .replace(/^#{5}\\s+(.+)$/gm, '<h5>$1</h5>')
          .replace(/^#{4}\\s+(.+)$/gm, '<h4>$1</h4>')
          .replace(/^#{3}\\s+(.+)$/gm, '<h3>$1</h3>')
          .replace(/^#{2}\\s+(.+)$/gm, '<h2>$1</h2>')
          .replace(/^#{1}\\s+(.+)$/gm, '<h1>$1</h1>')
          
          // Bold and Italic
          .replace(/\\*\\*\\*(.+?)\\*\\*\\*/g, '<strong><em>$1</em></strong>')
          .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
          .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
          
          // Code
          .replace(/\`(.+?)\`/g, '<code>$1</code>')
          
          // Links
          .replace(/\\[([^\\]]+)\\]\\(([^\\)]+)\\)/g, '<a href="$2">$1</a>')
          
          // Line breaks
          .replace(/\\n/g, '<br>')
          
          // Paragraphs
          .replace(/^(?!<[hH][1-6]|<br|<code|<strong|<em|<a)(.+)$/gm, '<p>$1</p>');
          
        return html;
      }
      
      marked.setOptions = function(options) {
        // Simplified options handling
        console.log('📝 Marked fallback: options set', options);
      };
      
      marked.Renderer = function() {
        this.html = function(html) { return html; };
        this.code = function(code, language) {
          var lang = language && /^[a-zA-Z0-9-_]+$/.test(language) ? language : '';
          return '<pre><code class="language-' + lang + '">' + code + '</code></pre>';
        };
      };
      
      marked.use = function(config) {
        console.log('📝 Marked fallback: using config', config);
      };
      
      marked.version = '15.0.12-fallback';
      
      window.marked = marked;
      console.log('📝 Marked fallback loaded successfully');
    })();
    `;
  }

  /**
   * 获取DOMPurify的本地备用版本（简化版）
   */
  getDOMPurifyFallback() {
    return `
    // DOMPurify simplified fallback version
    (function() {
      'use strict';
      
      function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }
      
      function sanitizeHtml(html, options) {
        if (typeof html !== 'string') return '';
        
        var allowedTags = options && options.ALLOWED_TAGS ? options.ALLOWED_TAGS : [
          'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'del',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'code', 'pre', 'blockquote',
          'ul', 'ol', 'li',
          'a', 'img',
          'span', 'div'
        ];
        
        // 基本的HTML清理（移除危险标签）
        var cleaned = html
          .replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, '')
          .replace(/<iframe[^>]*>[\\s\\S]*?<\\/iframe>/gi, '')
          .replace(/<object[^>]*>[\\s\\S]*?<\\/object>/gi, '')
          .replace(/<embed[^>]*>/gi, '')
          .replace(/on\\w+\\s*=\\s*"[^"]*"/gi, '') // 移除事件处理器（除了特定的）
          .replace(/javascript:/gi, '')
          .replace(/vbscript:/gi, '');
          
        return cleaned;
      }
      
      var DOMPurify = {
        sanitize: sanitizeHtml,
        version: '3.0.5-fallback'
      };
      
      window.DOMPurify = DOMPurify;
      console.log('🛡️ DOMPurify fallback loaded successfully');
    })();
    `;
  }

  /**
   * 加载本地备用依赖
   */
  async loadFallbackDependencies() {
    console.log('🔄 加载本地备用依赖...');
    
    try {
      // 加载marked备用版本
      if (typeof window.marked === 'undefined') {
        console.log('📝 加载 marked.js 备用版本...');
        this.executeScript(this.fallbackSources.marked);
        console.log('✅ marked.js 备用版本加载完成');
      }
      
      // 加载DOMPurify备用版本
      if (typeof window.DOMPurify === 'undefined') {
        console.log('🛡️ 加载 DOMPurify 备用版本...');
        this.executeScript(this.fallbackSources.dompurify);
        console.log('✅ DOMPurify 备用版本加载完成');
      }
      
      return true;
    } catch (error) {
      console.error('❌ 本地备用依赖加载失败:', error);
      return false;
    }
  }

  /**
   * 执行脚本代码
   */
  executeScript(code) {
    try {
      const script = document.createElement('script');
      script.textContent = code;
      document.head.appendChild(script);
      
      // 立即移除脚本元素
      setTimeout(() => {
        script.remove();
      }, 100);
      
    } catch (error) {
      // 备用方法：使用eval（在某些环境中可能被阻止）
      console.warn('⚠️ 脚本注入失败，尝试备用方法...');
      try {
        new Function(code)();
      } catch (evalError) {
        console.error('❌ 所有脚本执行方法都失败了:', evalError);
        throw evalError;
      }
    }
  }

  /**
   * 检查依赖是否可用
   */
  validateDependencies() {
    const results = {
      marked: typeof window.marked === 'function',
      dompurify: typeof window.DOMPurify === 'object' && typeof window.DOMPurify.sanitize === 'function'
    };
    
    console.log('📊 依赖验证结果:', results);
    return results;
  }
}