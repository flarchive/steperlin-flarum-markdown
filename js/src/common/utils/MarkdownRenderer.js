import { dependencyManager } from './DependencyManager';

/**
 * 增强版 Markdown 渲染器
 * 集成智能依赖管理和错误恢复机制
 */
export default class MarkdownRenderer {
  constructor() {
    this.cache = new Map();
    this.isInitialized = false;
    this.initPromise = null;
    
    // 监听依赖加载事件
    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    window.addEventListener('flarum-markdown-dependencies-loaded', () => {
      this.onDependenciesLoaded();
    });

    window.addEventListener('flarum-markdown-dependencies-failed', (event) => {
      this.onDependenciesFailed(event.detail.failedDependencies);
    });
  }

  /**
   * 依赖加载完成回调
   */
  onDependenciesLoaded() {
    console.log('🎨 Markdown渲染器初始化中...');
    this.configureMarked();
    this.isInitialized = true;
    console.log('✅ Markdown渲染器初始化完成');
  }

  /**
   * 依赖加载失败回调
   */
  onDependenciesFailed(failedDeps) {
    console.error('❌ Markdown渲染器初始化失败，缺少依赖:', failedDeps);
    this.isInitialized = false;
  }

  /**
   * 异步初始化渲染器
   */
  async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      // 如果依赖已经可用，直接初始化
      if (this.checkDependencies().length === 0) {
        this.onDependenciesLoaded();
        resolve();
        return;
      }

      // 等待依赖加载完成
      const timeout = setTimeout(() => {
        reject(new Error('Markdown渲染器初始化超时'));
      }, 30000); // 30秒超时

      const onLoaded = () => {
        clearTimeout(timeout);
        window.removeEventListener('flarum-markdown-dependencies-loaded', onLoaded);
        window.removeEventListener('flarum-markdown-dependencies-failed', onFailed);
        resolve();
      };

      const onFailed = (event) => {
        clearTimeout(timeout);
        window.removeEventListener('flarum-markdown-dependencies-loaded', onLoaded);
        window.removeEventListener('flarum-markdown-dependencies-failed', onFailed);
        reject(new Error('依赖加载失败: ' + event.detail.failedDependencies.map(d => d.name).join(', ')));
      };

      window.addEventListener('flarum-markdown-dependencies-loaded', onLoaded);
      window.addEventListener('flarum-markdown-dependencies-failed', onFailed);
    });

    return this.initPromise;
  }

  /**
   * 检查依赖是否可用 - 使用依赖管理器
   */
  checkDependencies() {
    const errors = [];
    
    if (!dependencyManager.isDependencyAvailable('marked')) {
      errors.push('marked.js library not loaded');
    }
    
    if (!dependencyManager.isDependencyAvailable('DOMPurify')) {
      errors.push('DOMPurify library not loaded');
    }
    
    return errors;
  }

  configureMarked() {
    const marked = dependencyManager.getDependency('marked');
    
    if (!marked) {
      console.error('marked.js 未加载，无法配置 Markdown 渲染器');
      return;
    }

    // 配置marked.js渲染选项
    marked.setOptions({
      breaks: true,        // 支持换行
      gfm: true,          // GitHub风格Markdown
      headerIds: false,    // 禁用header ID生成
      mangle: false       // 禁用email混淆
    });

    // 自定义渲染器
    const renderer = new marked.Renderer();
    
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

    marked.use({ renderer });
    console.log('⚙️ marked.js 配置完成');
  }

  /**
   * 渲染Markdown内容 - 增强版本
   */
  async render(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }

    // 确保渲染器已初始化
    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (error) {
        console.error('渲染器初始化失败:', error);
        return this.renderFallback(markdown);
      }
    }

    // 检查依赖
    const errors = this.checkDependencies();
    if (errors.length > 0) {
      console.error('Markdown 渲染依赖缺失:', errors);
      return this.renderFallback(markdown);
    }

    // 检查缓存
    if (this.cache.has(markdown)) {
      return this.cache.get(markdown);
    }

    try {
      const marked = dependencyManager.getDependency('marked');
      const DOMPurify = dependencyManager.getDependency('DOMPurify');

      if (!marked || !DOMPurify) {
        throw new Error('关键依赖不可用');
      }

      // 渲染Markdown
      const rawHtml = marked(markdown);
      
      // DOMPurify安全过滤
      const cleanHtml = DOMPurify.sanitize(rawHtml, {
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
      return this.renderFallback(markdown);
    }
  }

  /**
   * 降级渲染 - 当主要渲染失败时使用
   */
  renderFallback(markdown) {
    console.warn('🔄 使用降级渲染模式');
    
    // 基本的文本格式化
    let html = this.escapeHtml(markdown);
    
    // 简单的换行处理
    html = html.replace(/\n/g, '<br>');
    
    // 简单的粗体处理
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 简单的斜体处理
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return html;
  }

  /**
   * 同步渲染方法 - 向后兼容
   */
  renderSync(markdown) {
    if (!this.isInitialized) {
      return this.renderFallback(markdown);
    }
    
    // 使用Promise但不等待
    this.render(markdown).catch(error => {
      console.error('异步渲染失败:', error);
    });
    
    // 立即返回缓存或降级结果
    if (this.cache.has(markdown)) {
      return this.cache.get(markdown);
    }
    
    return this.renderFallback(markdown);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * 获取渲染器状态
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      dependencyStatus: dependencyManager.getDependencyStatus(),
      cacheSize: this.cache.size
    };
  }
}