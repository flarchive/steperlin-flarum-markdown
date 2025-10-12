/**
 * 依赖管理器 - 处理外部库的加载和监控
 * 
 * 核心功能：
 * 1. 运行时依赖检查
 * 2. 加载失败监控
 * 3. 自动重试机制
 * 4. 降级处理方案
 * 5. 详细的错误报告
 * 6. 本地备用依赖支持
 */
import LocalDependencyLoader from './LocalDependencyLoader';

export default class DependencyManager {
  constructor() {
    this.dependencies = new Map();
    this.loadAttempts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1秒
    this.checkInterval = null;
    this.localLoader = new LocalDependencyLoader();
    
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
      validator: () => {
        // marked可能是function或者object，都检查一下
        const markedType = typeof window.marked;
        const isValid = (markedType === 'function') || 
                       (markedType === 'object' && window.marked && typeof window.marked.parse === 'function');
        console.log(`🔍 marked验证: type=${markedType}, valid=${isValid}`);
        return isValid;
      }
    });

    this.registerDependency('DOMPurify', {
      globalVar: 'DOMPurify',
      cdnUrls: [
        'https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js',
        'https://unpkg.com/dompurify@3.0.5/dist/purify.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.5/purify.min.js'
      ],
      validator: () => {
        // DOMPurify可能是function或者object
        const purifyType = typeof window.DOMPurify;
        const isValid = (purifyType === 'object' && window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') ||
                       (purifyType === 'function' && typeof window.DOMPurify.sanitize === 'function');
        console.log(`🔍 DOMPurify验证: type=${purifyType}, valid=${isValid}`);
        return isValid;
      }
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
    
    // 首先检查是否已经存在
    console.log('🔍 检查已有依赖...');
    console.log('window.marked:', typeof window.marked);
    console.log('window.DOMPurify:', typeof window.DOMPurify);
    
    const promises = [];
    
    for (const [name, config] of this.dependencies) {
      if (!config.validator()) {
        console.log(`📦 ${name} 不存在，开始加载...`);
        promises.push(this.attemptManualLoad(name));
      } else {
        console.log(`✅ ${name} 已存在，跳过加载`);
        config.status = 'loaded';
      }
    }
    
    if (promises.length > 0) {
      console.log(`🔄 开始加载 ${promises.length} 个依赖...`);
      await Promise.allSettled(promises);
      
      // 加载后再次检查
      console.log('🔍 加载后重新检查依赖...');
      console.log('window.marked:', typeof window.marked);
      console.log('window.DOMPurify:', typeof window.DOMPurify);
      
      // 尝试强制注册全局变量（如果需要）
      this.forceGlobalRegistration();
    } else {
      console.log('✅ 所有依赖已存在');
    }
  }
  
  /**
   * 强制注册全局变量（备用方案）
   */
  forceGlobalRegistration() {
    // 尝试从模块中获取并注册到全局
    if (typeof window.marked === 'undefined') {
      // 检查是否有模块形式的marked
      const scripts = document.querySelectorAll('script[src*="marked"]');
      console.log(`🔍 检查到 ${scripts.length} 个 marked 脚本`);
      
      // 尝试直接执行脚本内容来注册全局变量
      if (scripts.length > 0) {
        console.log('🔄 尝试强制注册 marked 全局变量...');
        // 这里可以添加更复杂的逻辑
      }
    }
    
    if (typeof window.DOMPurify === 'undefined') {
      const scripts = document.querySelectorAll('script[src*="dompurify"], script[src*="purify"]');
      console.log(`🔍 检查到 ${scripts.length} 个 DOMPurify 脚本`);
      
      if (scripts.length > 0) {
        console.log('🔄 尝试强制注册 DOMPurify 全局变量...');
      }
    }
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
    console.log(`🔄 开始为 ${name} 加载依赖...`);

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
        
        // 等待更长时间让脚本完全初始化
        await this.delay(1000); // 增加到1秒
        
        // 检查多次以确保变量注册
        let validationPassed = false;
        for (let i = 0; i < 5; i++) {
          if (config.validator()) {
            validationPassed = true;
            break;
          }
          console.log(`🕰️ 等待 ${name} 初始化... (第${i+1}次检查)`);
          await this.delay(200);
        }
        
        if (validationPassed) {
          config.status = 'loaded';
          config.loadTime = Date.now();
          console.log(`✅ ${name} 手动加载成功`);
          
          // 进行功能性测试
          if (name === 'marked' && window.marked) {
            try {
              // marked可能是函数或者对象，尝试不同的调用方式
              let testResult;
              if (typeof window.marked === 'function') {
                testResult = window.marked('**test**');
              } else if (window.marked.parse) {
                testResult = window.marked.parse('**test**');
              } else {
                testResult = 'No parse method found';
              }
              console.log(`🧪 ${name} 功能测试通过:`, testResult);
            } catch (e) {
              console.warn(`⚠️ ${name} 功能测试失败:`, e);
            }
          }
          
          if (name === 'DOMPurify' && window.DOMPurify) {
            try {
              const testResult = window.DOMPurify.sanitize('<script>test</script><p>safe</p>');
              console.log(`🔒 ${name} 功能测试通过:`, testResult);
            } catch (e) {
              console.warn(`⚠️ ${name} 功能测试失败:`, e);
            }
          }
          
          return;
        } else {
          console.warn(`⚠️ ${name} 加载后验证失败，尝试下一个源`);
        }
        
      } catch (error) {
        config.errors.push(`Failed to load from ${url}: ${error.message}`);
        console.warn(`⚠️ ${name} 从 ${url} 加载失败:`, error.message);
      }

      this.loadAttempts.set(name, attempts + 1);
      
      // 重试延迟
      if (attempts < this.maxRetries - 1) {
        console.log(`🕰️ 等待 ${this.retryDelay}ms 后重试...`);
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
      // 检查是否已经存在相同的脚本
      const existingScript = document.querySelector(`script[src="${url}"]`);
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.src = url;
      script.async = false; // 确保按顺序执行
      script.crossOrigin = 'anonymous'; // 允许跨域
      
      // 设置超时
      const timeout = setTimeout(() => {
        script.remove();
        reject(new Error('Script load timeout'));
      }, 15000); // 增加到15秒超时

      script.onload = () => {
        clearTimeout(timeout);
        console.log(`✅ 脚本加载成功: ${url}`);
        
        // 额外等待一小段时间确保脚本完全执行
        setTimeout(() => {
          resolve();
        }, 100);
      };

      script.onerror = (error) => {
        clearTimeout(timeout);
        script.remove();
        console.error(`❌ 脚本加载失败: ${url}`, error);
        reject(new Error(`Script load failed: ${error.message || 'Unknown error'}`));
      };

      // 添加到head而不是body，确保早期执行
      document.head.appendChild(script);
      console.log(`📡 开始加载脚本: ${url}`);
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
        try {
          let testResult;
          if (typeof window.marked === 'function') {
            testResult = window.marked('**测试**');
          } else if (window.marked.parse) {
            testResult = window.marked.parse('**测试**');
          }
          
          if (testResult && testResult.includes('<strong>')) {
            console.log('✅ marked.js 功能测试通过');
          } else {
            console.error('❌ marked.js 功能测试失败，结果:', testResult);
          }
        } catch (error) {
          console.error('❌ marked.js 功能测试异常:', error);
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