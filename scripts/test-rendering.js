/**
 * Markdown 渲染测试脚本
 * 在浏览器控制台中运行此脚本来测试渲染功能
 */

(function testMarkdownRendering() {
  console.log('🧪 开始 Markdown 渲染测试...\n');

  // 测试1: 检查 app.markdown 是否存在
  console.log('测试1: 检查渲染器实例');
  if (!app.markdown) {
    console.error('❌ app.markdown 不存在！');
    return;
  }
  console.log('✅ app.markdown 存在\n');

  // 测试2: 检查渲染器状态
  console.log('测试2: 检查渲染器状态');
  const status = app.markdown.getStatus();
  console.log('状态:', status);
  
  if (!status.isInitialized) {
    console.warn('⚠️ 渲染器未初始化');
  } else {
    console.log('✅ 渲染器已初始化\n');
  }

  // 测试3: 测试基本渲染
  console.log('测试3: 测试基本 Markdown 渲染');
  const testCases = [
    {
      name: '粗体',
      input: '**这是粗体文本**',
      expected: /<strong>这是粗体文本<\/strong>/
    },
    {
      name: '斜体',
      input: '*这是斜体文本*',
      expected: /<em>这是斜体文本<\/em>/
    },
    {
      name: '标题',
      input: '### 这是三级标题',
      expected: /<h3>这是三级标题<\/h3>/
    },
    {
      name: '代码',
      input: '`代码片段`',
      expected: /<code>代码片段<\/code>/
    },
    {
      name: '分隔线',
      input: 'composer require steperlin/flarum-markdown\n======',
      expected: /composer require steperlin\/flarum-markdown/
    }
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach(test => {
    try {
      const result = app.markdown.renderSync(test.input);
      
      if (test.expected.test(result)) {
        console.log(`  ✅ ${test.name}: 通过`);
        console.log(`     输入: ${test.input}`);
        console.log(`     输出: ${result}`);
        passed++;
      } else {
        console.error(`  ❌ ${test.name}: 失败`);
        console.error(`     输入: ${test.input}`);
        console.error(`     输出: ${result}`);
        console.error(`     期望匹配: ${test.expected}`);
        failed++;
      }
    } catch (error) {
      console.error(`  ❌ ${test.name}: 异常`);
      console.error(`     错误: ${error.message}`);
      failed++;
    }
  });

  console.log(`\n📊 测试结果: ${passed}/${testCases.length} 通过, ${failed} 失败\n`);

  // 测试4: 检查帖子渲染
  console.log('测试4: 检查实际帖子渲染');
  
  const posts = app.store.all('posts');
  console.log(`找到 ${posts.length} 个帖子`);

  if (posts.length > 0) {
    const firstPost = posts[0];
    console.log('第一个帖子信息:');
    console.log('  ID:', firstPost.id());
    console.log('  内容类型:', firstPost.attribute('contentType'));
    console.log('  原始内容:', firstPost.attribute('content')?.substring(0, 100));
    console.log('  HTML内容:', firstPost.contentHtml()?.substring(0, 100));
    
    // 尝试渲染
    const rawContent = firstPost.attribute('content');
    if (rawContent) {
      const rendered = app.markdown.renderSync(rawContent);
      console.log('  手动渲染结果:', rendered.substring(0, 100));
      
      if (rendered !== rawContent) {
        console.log('✅ 渲染功能正常工作');
      } else {
        console.warn('⚠️ 渲染结果与原始内容相同，可能未进行渲染');
      }
    }
  } else {
    console.log('⚠️ 当前页面没有帖子数据');
  }

  // 测试5: 检查依赖
  console.log('\n测试5: 检查外部依赖');
  console.log('  window.marked:', typeof window.marked);
  console.log('  window.DOMPurify:', typeof window.DOMPurify);
  
  if (window.marked && window.DOMPurify) {
    console.log('✅ 所有依赖都已加载\n');
  } else {
    console.error('❌ 缺少必要的依赖\n');
  }

  // 测试6: 检查扩展是否生效
  console.log('测试6: 检查 CommentPost 扩展');
  
  // 尝试访问 CommentPost 组件
  const CommentPost = flarum.core.compat['forum/components/CommentPost'];
  if (CommentPost) {
    console.log('✅ 找到 CommentPost 组件');
    
    // 检查是否有我们的扩展方法
    const instance = new CommentPost();
    if (instance.detectMarkdownSyntax) {
      console.log('✅ detectMarkdownSyntax 方法存在');
      
      // 测试检测逻辑
      const testContent = '**测试**\n======';
      const shouldDetect = instance.detectMarkdownSyntax(testContent);
      console.log(`  测试内容 "${testContent}" 检测结果: ${shouldDetect}`);
      
      if (shouldDetect) {
        console.log('✅ Markdown 检测逻辑正常\n');
      } else {
        console.warn('⚠️ Markdown 检测逻辑可能有问题\n');
      }
    } else {
      console.warn('⚠️ detectMarkdownSyntax 方法不存在\n');
    }
  } else {
    console.error('❌ 未找到 CommentPost 组件\n');
  }

  console.log('🏁 测试完成！');
  console.log('\n如果所有测试都通过，但页面仍未渲染，请：');
  console.log('1. 检查浏览器控制台是否有 "📝 CommentPost.contentHtml called" 日志');
  console.log('2. 尝试刷新页面（Cmd+Shift+R 硬刷新）');
  console.log('3. 清除 Flarum 缓存: php flarum cache:clear');
  console.log('4. 检查是否上传了最新编译的 forum.js 文件');
})();
