// 不使用顶级await，而是在运行时检查全局变量
export default class MarkdownRenderer {
  constructor() {
    this.configureMarked();
    this.cache = new Map();
  }

  // 检查依赖是否可用
  static checkDependencies() {
    const errors = [];
    
    if (typeof window.marked === 'undefined') {
      errors.push('marked.js library not loaded');
    }
    
    if (typeof window.DOMPurify === 'undefined') {
      errors.push('DOMPurify library not loaded');
    }
    
    return errors;
  }

  configureMarked() {
    // 检查marked是否可用
    if (typeof window.marked === 'undefined') {
      console.error('marked.js 未加载，无法配置 Markdown 渲染器');
      return;
    }

    // 配置marked.js渲染选项
    window.marked.setOptions({
      breaks: true,        // 支持换行
      gfm: true,          // GitHub风格Markdown
      headerIds: false,    // 禁用header ID生成
      mangle: false       // 禁用email混淆
    });

    // 自定义渲染器
    const renderer = new window.marked.Renderer();
    
    // 自定义spoiler渲染（对应原s9e配置）
    renderer.html = (html) => {
      if (html.includes('>!') && html.includes('!<')) {
        return html.replace(
          />!(.*?)!</g, 
          '<span class="spoiler" data-s9e-livepreview-ignore-attrs="class" onclick="removeAttribute(\'class\')">$1</span>'
        );
      }
      return html;
    };

    // 安全的代码块渲染
    renderer.code = (code, language) => {
      const validLang = language && /^[a-zA-Z0-9-_]+$/.test(language) ? language : '';
      const escapedCode = this.escapeHtml(code);
      return `<pre><code class="language-${validLang}">${escapedCode}</code></pre>`;
    };

    window.marked.use({ renderer });
  }

  render(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }

    // 检查依赖
    const errors = MarkdownRenderer.checkDependencies();
    if (errors.length > 0) {
      console.error('Markdown 渲染依赖缺失:', errors);
      return this.escapeHtml(markdown);
    }

    // 检查缓存
    if (this.cache.has(markdown)) {
      return this.cache.get(markdown);
    }

    try {
      // 渲染Markdown
      const rawHtml = window.marked(markdown);
      
      // DOMPurify安全过滤
      const cleanHtml = window.DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'del',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'code', 'pre', 'blockquote',
          'ul', 'ol', 'li',
          'a', 'img',
          'span', 'div'
        ],
        ALLOWED_ATTR: [
          'href', 'src', 'alt', 'title', 'class', 'data-*',
          'onclick'  // 为spoiler保留
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
      });

      // 缓存结果
      this.cache.set(markdown, cleanHtml);
      return cleanHtml;

    } catch (error) {
      console.error('Markdown rendering error:', error);
      return this.escapeHtml(markdown);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  clearCache() {
    this.cache.clear();
  }
}