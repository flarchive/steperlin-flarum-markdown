import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import CommentPost from 'flarum/forum/components/CommentPost';
import { initialize } from '../common/index';

app.initializers.add('flarum-markdown', () => {
  // 先执行通用初始化
  initialize(app);
  
  // 扩展 CommentPost - 只在论坛端
  extend(CommentPost.prototype, 'contentHtml', function(html) {
    console.group('🎯 === CommentPost.contentHtml 被调用 ===');
    console.log('📍 调用时间:', new Date().toISOString());
    console.log('📍 Post ID:', this.attrs.post?.id());
    console.log('📍 Component:', this.constructor.name);
    
    const post = this.attrs.post;
    if (!post) {
      console.warn('⚠️ post 对象不存在！');
      console.log('   this.attrs:', this.attrs);
      console.groupEnd();
      return html;
    }

    if (!app.markdown) {
      console.warn('⚠️ app.markdown 渲染器不存在！');
      console.log('   app.markdown:', app.markdown);
      console.log('   检查 app 对象:', Object.keys(app));
      console.groupEnd();
      return html;
    }

    const rawContent = post.attribute('content');
    const contentType = post.attribute('contentType');
    
    console.log('📋 === 内容详情 ===');
    console.log('   postId:', post.id());
    console.log('   contentType:', contentType);
    console.log('   hasRawContent:', !!rawContent);
    console.log('   rawContentLength:', rawContent?.length);
    console.log('   rawContent 前150字:', rawContent?.substring(0, 150) + (rawContent?.length > 150 ? '...' : ''));
    console.log('   originalHtml 前150字:', html?.substring(0, 150) + (html?.length > 150 ? '...' : ''));

    // 详细检测 Markdown 语法
    const hasDetectMethod = !!this.detectMarkdownSyntax;
    console.log('🔍 === Markdown 检测 ===');
    console.log('   hasDetectMethod:', hasDetectMethod);
    
    let hasMarkdownSyntax = false;
    if (hasDetectMethod) {
      hasMarkdownSyntax = this.detectMarkdownSyntax(rawContent);
    } else {
      console.warn('   ⚠️ detectMarkdownSyntax 方法不存在！');
    }
    
    console.log('   检测结果:', {
      contentType: contentType,
      detectedMarkdown: hasMarkdownSyntax,
      willRender: contentType === 'markdown' || hasMarkdownSyntax
    });

    // 检测是否需要渲染 Markdown
    if (contentType === 'markdown' || hasMarkdownSyntax) {
      console.log('✅ === 开始渲染 Markdown ===');
      console.log('   Post ID:', post.id());
      console.log('   触发原因:', contentType === 'markdown' ? 'contentType=markdown' : '检测到 Markdown 语法');
      console.log('   使用方法:', app.markdown.renderSync ? 'renderSync' : 'render');
      
      try {
        const startTime = performance.now();
        const rendered = app.markdown.renderSync 
          ? app.markdown.renderSync(rawContent)
          : app.markdown.render(rawContent);
        const endTime = performance.now();
        
        console.log('✨ === Markdown 渲染成功！ ===');
        console.log('   原始内容长度:', rawContent?.length);
        console.log('   渲染后长度:', rendered?.length);
        console.log('   渲染时间:', (endTime - startTime).toFixed(2), 'ms');
        console.log('   渲染结果前200字:', rendered?.substring(0, 200) + (rendered?.length > 200 ? '...' : ''));
        console.log('   原始HTML前200字:', html?.substring(0, 200) + (html?.length > 200 ? '...' : ''));
        console.log('   是否改变:', rendered !== html);
        console.groupEnd();
        
        return rendered;
      } catch (error) {
        console.error('❌ === Markdown 渲染失败！ ===');
        console.error('   错误类型:', error.constructor.name);
        console.error('   错误信息:', error.message);
        console.error('   错误堆栈:', error.stack);
        console.groupEnd();
        return html;
      }
    } else {
      console.log('⏭️ === 跳过渲染 ===');
      console.log('   原因: 不是 Markdown 内容');
      console.log('   contentType:', contentType);
      console.log('   检测到 Markdown:', hasMarkdownSyntax);
      console.groupEnd();
    }

    return html;
  });

  // 添加 Markdown 检测辅助方法到 CommentPost
  extend(CommentPost.prototype, 'oninit', function() {
    console.log('🔧 === CommentPost.oninit 被调用 ===');
    console.log('   添加 detectMarkdownSyntax 方法');
    console.log('   Post ID:', this.attrs.post?.id());
    
    this.detectMarkdownSyntax = function(content) {
      console.group('🔍 === 检测 Markdown 语法 ===');
      
      if (!content || typeof content !== 'string') {
        console.log('❌ 内容为空或不是字符串');
        console.log('   content类型:', typeof content);
        console.log('   content值:', content);
        console.groupEnd();
        return false;
      }

      console.log('   内容长度:', content.length);
      console.log('   内容预览:', content.substring(0, 100));

      const markdownPatterns = [
        { name: '标题', pattern: /^#{1,6}\s+/m },
        { name: '粗体', pattern: /\*\*.*?\*\*/ },
        { name: '斜体', pattern: /\*.*?\*/ },
        { name: '链接', pattern: /\[.*?\]\(.*?\)/ },
        { name: '行内代码', pattern: /`.*?`/ },
        { name: '代码块', pattern: /^```[\s\S]*?```$/m },
        { name: '引用', pattern: /^>\s+/m },
        { name: '无序列表', pattern: /^[-*+]\s+/m },
        { name: '有序列表', pattern: /^\d+\.\s+/m },
        { name: 'Spoiler', pattern: />!.*?!</ },
        { name: '删除线', pattern: /~~.*?~~/ },
        { name: '分隔线', pattern: /======/ },
      ];

      const matches = [];
      for (const { name, pattern } of markdownPatterns) {
        if (pattern.test(content)) {
          matches.push(name);
          console.log(`   ✓ 匹配: ${name}`);
        }
      }

      const hasMarkdown = matches.length > 0;
      console.log('=== 检测结果 ===');
      console.log('   检测到的 Markdown 语法:', matches.length > 0 ? matches.join(', ') : '无');
      console.log('   最终结果:', hasMarkdown ? '✅ 是 Markdown' : '❌ 不是 Markdown');
      console.groupEnd();

      return hasMarkdown;
    };
    
    console.log('   detectMarkdownSyntax 方法已添加');
  });
});

