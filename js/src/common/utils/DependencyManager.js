/**
 * 依赖管理器 - 处理外部库的加载和监控
 * 
 * 核心功能：
 * 1. 运行时依赖检查
 * 2. 加载失败监控
 * 3. 自动重试机制
 * 4. 降级处理方案
 * 5. 详细的错误报告
 */
export default class DependencyManager {
  constructor() {
    this.dependencies = new Map();
    this.loadAttempts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1秒
    this.checkInterval = null;
    
    this.init();
  }

  init() {
    // 注册依赖项
    this.registerDependency('marked', {
      globalVar: 'marked',
      cdnUrls: [
        'https://cdn.jsdelivr.net/npm/marked@15.0.12/marked.min.js',
        'https://unpkg.com/marked@15.0.12/marked.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/marked/15.0.12/marked.min.js'
      ],
      validator: () => typeof window.marked === 'function'
    });

    this.registerDependency('DOMPurify', {
      globalVar: 'DOMPurify',
      cdnUrls: [
        'https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js',
        'https://unpkg.com/dompurify@3.0.5/dist/purify.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.5/purify.min.js'
      ],
      validator: () => typeof window.DOMPurify === 'object' && typeof window.DOMPurify.sanitize === 'function'
    });

    // 立即开始加载依赖
    this.loadAllDependencies();
    
    // 开始监控
    this.startMonitoring();
  }

  /**
   * 加载所有依赖
   */
  async loadAllDependencies() {
    console.log('🚀 开始加载Markdown依赖库...');
    
    const promises = [];
    
    for (const [name, config] of this.dependencies) {
      if (!config.validator()) {
        promises.push(this.attemptManualLoad(name));
      } else {
        console.log(`✅ ${name} 已存在，跳过加载`);
        config.status = 'loaded';
      }
    }
    
    await Promise.allSettled(promises);
  }

  /**
   * 注册依赖项
   */
  registerDependency(name, config) {
    this.dependencies.set(name, {
      ...config,
      status: 'pending',
      loadTime: null,
      errors: []
    });
  }

  /**
   * 开始监控依赖加载状态
   */
  startMonitoring() {
    let checkCount = 0;
    const maxChecks = 30; // 最多检查30次（30秒）

    this.checkInterval = setInterval(() => {
      checkCount++;
      
      const allLoaded = this.checkAllDependencies();
      
      if (allLoaded || checkCount >= maxChecks) {
        clearInterval(this.checkInterval);
        
        if (allLoaded) {
          console.log('🎉 所有依赖加载完成');
          this.onAllDependenciesLoaded();
        } else {
          console.error('⏰ 依赖加载超时');
          this.handleLoadTimeout();
        }
      }
    }, 1000);
  }

  /**
   * 检查所有依赖项状态
   */
  checkAllDependencies() {
    let allLoaded = true;

    for (const [name, config] of this.dependencies) {
      if (config.status === 'pending') {
        if (config.validator()) {
          config.status = 'loaded';
          config.loadTime = Date.now();
          console.log(`✅ ${name} 加载成功`);
        } else {
          allLoaded = false;
          
          // 如果还没有尝试过手动加载，则尝试
          if (!this.loadAttempts.has(name)) {
            this.attemptManualLoad(name);
          }
        }
      } else if (config.status === 'failed') {
        allLoaded = false;
      }
    }

    return allLoaded;
  }

  /**
   * 尝试手动加载依赖
   */
  async attemptManualLoad(name) {
    const config = this.dependencies.get(name);
    if (!config) return;

    this.loadAttempts.set(name, 0);

    for (const url of config.cdnUrls) {
      const attempts = this.loadAttempts.get(name);
      
      if (attempts >= this.maxRetries) {
        config.status = 'failed';
        config.errors.push(`Max retries (${this.maxRetries}) exceeded`);
        console.error(`❌ ${name} 加载失败，已达到最大重试次数`);
        break;
      }

      try {
        console.log(`🔄 尝试加载 ${name} 从: ${url}`);
        await this.loadScript(url);
        
        // 等待一小段时间让脚本执行
        await this.delay(500);
        
        if (config.validator()) {
          config.status = 'loaded';
          config.loadTime = Date.now();
          console.log(`✅ ${name} 手动加载成功`);
          return;
        }
        
      } catch (error) {
        config.errors.push(`Failed to load from ${url}: ${error.message}`);
        console.warn(`⚠️ ${name} 从 ${url} 加载失败:`, error.message);
      }

      this.loadAttempts.set(name, attempts + 1);
      
      // 重试延迟
      if (attempts < this.maxRetries - 1) {
        await this.delay(this.retryDelay);
      }
    }

    config.status = 'failed';
    console.error(`❌ ${name} 所有CDN源都加载失败`);
  }

  /**
   * 动态加载脚本
   */
  loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Script load failed'));
      
      // 设置超时
      const timeout = setTimeout(() => {
        reject(new Error('Script load timeout'));
      }, 10000); // 10秒超时

      script.onload = () => {
        clearTimeout(timeout);
        resolve();
      };

      document.head.appendChild(script);
    });
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 所有依赖加载完成后的回调
   */
  onAllDependenciesLoaded() {
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('flarum-markdown-dependencies-loaded', {
      detail: { dependencies: this.getDependencyStatus() }
    }));

    // 验证最终状态
    this.validateFinalState();
  }

  /**
   * 处理加载超时
   */
  handleLoadTimeout() {
    const failedDeps = this.getFailedDependencies();
    
    console.error('🚨 依赖加载超时，以下依赖未能加载:');
    failedDeps.forEach(dep => {
      console.error(`- ${dep.name}: ${dep.errors.join(', ')}`);
    });

    // 显示用户友好的错误提示
    this.showUserError(failedDeps);

    // 触发错误事件
    window.dispatchEvent(new CustomEvent('flarum-markdown-dependencies-failed', {
      detail: { failedDependencies: failedDeps }
    }));
  }

  /**
   * 显示用户错误提示
   */
  showUserError(failedDeps) {
    if (typeof app !== 'undefined' && app.alerts) {
      const depNames = failedDeps.map(d => d.name).join(', ');
      app.alerts.show({
        type: 'error',
        message: `Markdown渲染依赖加载失败: ${depNames}。请检查网络连接或联系管理员。`,
        controls: [
          m('button.Button', {
            onclick: () => window.location.reload()
          }, '重新加载页面')
        ]
      });
    }
  }

  /**
   * 验证最终状态
   */
  validateFinalState() {
    const status = this.getDependencyStatus();
    const allLoaded = status.every(dep => dep.status === 'loaded');

    if (allLoaded) {
      console.log('🎯 依赖验证通过，Markdown渲染器可以正常工作');
      
      // 进行功能测试
      this.performFunctionalTest();
    } else {
      console.error('⚠️ 部分依赖未能加载，Markdown渲染可能无法正常工作');
    }

    return allLoaded;
  }

  /**
   * 执行功能测试
   */
  performFunctionalTest() {
    try {
      // 测试marked
      if (window.marked) {
        const testMarkdown = '**测试**';
        const result = window.marked(testMarkdown);
        if (result.includes('<strong>')) {
          console.log('✅ marked.js 功能测试通过');
        } else {
          console.error('❌ marked.js 功能测试失败');
        }
      }

      // 测试DOMPurify
      if (window.DOMPurify) {
        const testHtml = '<script>alert("test")</script><p>safe</p>';
        const result = window.DOMPurify.sanitize(testHtml);
        if (result === '<p>safe</p>') {
          console.log('✅ DOMPurify 功能测试通过');
        } else {
          console.error('❌ DOMPurify 功能测试失败');
        }
      }

    } catch (error) {
      console.error('🚨 功能测试异常:', error);
    }
  }

  /**
   * 获取依赖状态
   */
  getDependencyStatus() {
    return Array.from(this.dependencies.entries()).map(([name, config]) => ({
      name,
      status: config.status,
      loadTime: config.loadTime,
      errors: config.errors
    }));
  }

  /**
   * 获取失败的依赖
   */
  getFailedDependencies() {
    return this.getDependencyStatus().filter(dep => dep.status === 'failed');
  }

  /**
   * 检查特定依赖是否可用
   */
  isDependencyAvailable(name) {
    const config = this.dependencies.get(name);
    return config && config.status === 'loaded';
  }

  /**
   * 获取依赖的全局变量
   */
  getDependency(name) {
    if (!this.isDependencyAvailable(name)) {
      console.error(`❌ 依赖 ${name} 不可用`);
      return null;
    }

    const config = this.dependencies.get(name);
    return window[config.globalVar];
  }

  /**
   * 生成诊断报告
   */
  generateDiagnosticReport() {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      dependencies: this.getDependencyStatus(),
      networkStatus: navigator.onLine ? 'online' : 'offline',
      loadAttempts: Object.fromEntries(this.loadAttempts)
    };

    console.group('📊 依赖加载诊断报告');
    console.table(report.dependencies);
    console.log('完整报告:', report);
    console.groupEnd();

    return report;
  }
}

// 全局实例
export const dependencyManager = new DependencyManager();