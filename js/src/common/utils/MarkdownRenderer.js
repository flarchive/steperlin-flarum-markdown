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
    const { configModule, configSource } = this.resolveMarkedResources();

    if (!configModule) {
      console.error('marked.js 未加载或缺少配置能力，无法配置 Markdown 渲染器');
      return;
    }

    if (typeof configModule.setOptions !== 'function' || typeof configModule.Renderer !== 'function') {
      console.error('marked.js 模块缺少 setOptions 或 Renderer，无法配置', {
        configSource,
        availableKeys: Object.keys(configModule || {})
      });
      return;
    }

    console.log('⚙️ marked.js 配置来源:', configSource);

    configModule.setOptions({
      breaks: true,
      gfm: true,
      headerIds: false,
      mangle: false
    });

    const renderer = new configModule.Renderer();

    renderer.html = (html) => {
      if (typeof html === 'string' && html.includes('>!') && html.includes('!<')) {
        return html.replace(
          />!(.*?)!</g,
          '<span class="spoiler" data-s9e-livepreview-ignore-attrs="class" onclick="removeAttribute(\'class\')">$1</span>'
        );
      }
      return html;
    };

    renderer.code = (code, language) => {
      const validLang = language && /^[a-zA-Z0-9-_]+$/.test(language) ? language : '';
      const escapedCode = this.escapeHtml(code);
      return `<pre><code class="language-${validLang}">${escapedCode}</code></pre>`;
    };

    if (typeof configModule.use === 'function') {
      configModule.use({ renderer });
    } else {
      console.warn('marked 模块未提供 use 方法，跳过自定义 renderer 注入');
    }

    console.log('⚙️ marked.js 配置完成');
  }

  /**
  async render(markdown) {
    console.group('🖌️ [MarkdownRenderer.render] 渲染开始');
    console.log('参数 markdown:', typeof markdown, markdown?.substring?.(0, 100));
    console.log('isInitialized:', this.isInitialized);
    console.log('依赖状态:', dependencyManager.getDependencyStatus());

    if (!markdown || typeof markdown !== 'string') {
      console.warn('⚠️ 输入内容为空或非字符串，直接返回空字符串');
      console.groupEnd();
      return '';
    }

    if (!this.isInitialized) {
      try {
        await this.initialize();
        console.log('✅ 渲染器初始化完成');
      } catch (error) {
        console.error('渲染器初始化失败:', error);
        console.groupEnd();
        return this.renderFallback(markdown);
      }
    }

    const errors = this.checkDependencies();
    if (errors.length > 0) {
      console.error('Markdown 渲染依赖缺失:', errors);
      console.groupEnd();
      return this.renderFallback(markdown);
    }

    if (this.cache.has(markdown)) {
      console.log('📦 使用缓存结果');
      console.groupEnd();
      return this.cache.get(markdown);
    }

    try {
      const { parser, parserSource } = this.resolveMarkedResources();
      const { sanitizer, sanitizerSource } = this.resolveDOMPurifyResources();

      if (!parser) {
        throw new TypeError('未找到有效的 marked 解析函数');
      }

      if (!sanitizer) {
        throw new TypeError('未找到有效的 DOMPurify.sanitize 函数');
      }

      console.log('使用 marked 解析来源:', parserSource);
      const rawHtml = parser(markdown);
      console.log('📝 marked 渲染后HTML前200字:', rawHtml?.substring?.(0, 200));

      console.log('使用 DOMPurify 过滤来源:', sanitizerSource);
      const cleanHtml = sanitizer(rawHtml, {
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
          'onclick'
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+\.\-]+(?:[^a-z+\.\-:]|$))/i
      }) || '';

      console.log('✨ 最终 cleanHtml 前200字:', cleanHtml?.substring?.(0, 200));
      this.cache.set(markdown, cleanHtml);
      console.groupEnd();
      return cleanHtml;

    } catch (error) {
      console.error('Markdown rendering error:', error);
      console.groupEnd();
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
   * 同步渲染方法 - 用于实时渲染
   */
  renderSync(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }

    console.group('🖌️ [MarkdownRenderer.renderSync] 同步渲染开始');
    console.log('参数 markdown:', typeof markdown, markdown?.substring?.(0, 100));
    console.log('isInitialized:', this.isInitialized);
    console.log('依赖状态:', dependencyManager.getDependencyStatus());

    if (this.cache.has(markdown)) {
      console.log('📋 使用缓存的渲染结果');
      console.groupEnd();
      return this.cache.get(markdown);
    }

    const { parser, parserSource } = this.resolveMarkedResources();
    const { sanitizer, sanitizerSource } = this.resolveDOMPurifyResources();

    if (!parser || !sanitizer) {
      console.warn('⚠️ 关键依赖解析失败，使用降级渲染', { parserSource, sanitizerSource });
      console.groupEnd();
      return this.renderFallback(markdown);
    }

    try {
      console.log('🎨 执行同步Markdown渲染...');

      if (!this.isInitialized) {
        this.configureMarked();
        this.isInitialized = true;
      }

      console.log('使用 marked 解析来源:', parserSource);
      const rawHtml = parser(markdown);
      console.log('📝 marked 渲染后HTML前200字:', rawHtml?.substring?.(0, 200));

      console.log('使用 DOMPurify 过滤来源:', sanitizerSource);
      const cleanHtml = sanitizer(rawHtml, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'del',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'code', 'pre', 'blockquote',
          'ul', 'ol', 'li',
          'a', 'img',
          'span', 'div', 'hr'
        ],
        ALLOWED_ATTR: [
          'href', 'src', 'alt', 'title', 'class', 'data-*',
          'onclick'
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+\.\-]+(?:[^a-z+\.\-:]|$))/i
      }) || '';

      console.log('✨ 渲染成功，结果长度:', cleanHtml.length);
      this.cache.set(markdown, cleanHtml);
      console.groupEnd();
      return cleanHtml;

    } catch (error) {
      console.error('❌ 同步渲染失败:', error);
      console.groupEnd();
      return this.renderFallback(markdown);
    }
  }

  resolveMarkedResources() {
    const rawMarked = dependencyManager.getDependency('marked');

    const parserCandidates = [];
    const addParser = (moduleRef, fn, source) => {
      if (typeof fn === 'function') {
        parserCandidates.push({ moduleRef, fn, source });
      }
    };

    addParser(rawMarked, typeof rawMarked === 'function' ? rawMarked : null, 'window.marked (function)');
    addParser(rawMarked, rawMarked?.parse ? rawMarked.parse.bind(rawMarked) : null, 'window.marked.parse');
    addParser(rawMarked, rawMarked?.marked ? rawMarked.marked.bind(rawMarked) : null, 'window.marked.marked');

    if (rawMarked?.default) {
      const defaultExport = rawMarked.default;
      addParser(defaultExport, typeof defaultExport === 'function' ? defaultExport : null, 'window.marked.default (function)');
      addParser(defaultExport, defaultExport?.parse ? defaultExport.parse.bind(defaultExport) : null, 'window.marked.default.parse');
      addParser(defaultExport, defaultExport?.marked ? defaultExport.marked.bind(defaultExport) : null, 'window.marked.default.marked');
    }

    const parserEntry = parserCandidates.find(Boolean) || null;

    const configCandidates = [];
    const addConfig = (moduleRef, source) => {
      if (moduleRef && typeof moduleRef.setOptions === 'function' && typeof moduleRef.Renderer === 'function') {
        configCandidates.push({ moduleRef, source });
      }
    };

    addConfig(rawMarked, 'window.marked');
    addConfig(rawMarked?.default, 'window.marked.default');

    const configEntry = configCandidates[0] || (parserEntry ? { moduleRef: parserEntry.moduleRef, source: parserEntry.source } : null);

    if (!parserEntry) {
      console.error('❌ 未能解析到有效的 marked 解析函数', {
        hasRaw: !!rawMarked,
        keys: rawMarked ? Object.keys(rawMarked) : []
      });
    }

    return {
      raw: rawMarked,
      parser: parserEntry?.fn || null,
      parserSource: parserEntry?.source || null,
      configModule: configEntry?.moduleRef || null,
      configSource: configEntry?.source || null
    };
  }

  resolveDOMPurifyResources() {
    const rawPurify = dependencyManager.getDependency('DOMPurify');

    const sanitizerCandidates = [];
    const addSanitizer = (moduleRef, fn, source) => {
      if (typeof fn === 'function') {
        sanitizerCandidates.push({ moduleRef, fn, source });
      }
    };

    addSanitizer(rawPurify, rawPurify?.sanitize ? rawPurify.sanitize.bind(rawPurify) : null, 'DOMPurify.sanitize');
    addSanitizer(rawPurify, typeof rawPurify === 'function' ? rawPurify : null, 'DOMPurify (function)');

    if (rawPurify?.default) {
      const defaultExport = rawPurify.default;
      addSanitizer(defaultExport, defaultExport?.sanitize ? defaultExport.sanitize.bind(defaultExport) : null, 'DOMPurify.default.sanitize');
      addSanitizer(defaultExport, typeof defaultExport === 'function' ? defaultExport : null, 'DOMPurify.default (function)');
    }

    const sanitizerEntry = sanitizerCandidates.find(Boolean) || null;

    if (!sanitizerEntry) {
      console.error('❌ 未能解析到有效的 DOMPurify.sanitize 函数', {
        hasRaw: !!rawPurify,
        keys: rawPurify ? Object.keys(rawPurify) : []
      });
    }

    return {
      raw: rawPurify,
      sanitizer: sanitizerEntry?.fn || null,
      sanitizerSource: sanitizerEntry?.source || null
    };
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