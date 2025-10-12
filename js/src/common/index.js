/*!
 * Includes modified code from GitHub Markdown Toolbar Element
 * https://github.com/github/markdown-toolbar-element/
 *
 * Original Copyright GitHub, Inc.
 * Released under the MIT license
 * https://github.com/github/markdown-toolbar-element/blob/master/LICENSE
 */

import app from 'flarum/common/app';
import { extend, override } from 'flarum/common/extend';
import BasicEditorDriver from 'flarum/common/utils/BasicEditorDriver';
import styleSelectedText from 'flarum/common/utils/styleSelectedText';
import CommentPost from 'flarum/common/components/CommentPost';

import MarkdownToolbar from './components/MarkdownToolbar';
import MarkdownButton from './components/MarkdownButton';
import MarkdownRenderer from './utils/MarkdownRenderer';
import { markdownDebugger } from './utils/MarkdownDebugger';
import { dependencyManager } from './utils/DependencyManager';
import MarkdownContent from './components/MarkdownContent';
import MarkdownPreviewEditor from './components/MarkdownPreviewEditor';
import PostContentRenderer from './components/PostContentRenderer';
import extendPostModel from './extend/PostModel';
import ItemList from 'flarum/common/utils/ItemList';

const modifierKey = navigator.userAgent.match(/Macintosh/) ? '⌘' : 'ctrl';

const styles = {
  header: { prefix: '### ' },
  bold: { prefix: '**', suffix: '**', trimFirst: true },
  italic: { prefix: '_', suffix: '_', trimFirst: true },
  strikethrough: { prefix: '~~', suffix: '~~', trimFirst: true },
  quote: { prefix: '> ', multiline: true, surroundWithNewlines: true },
  code: { prefix: '`', suffix: '`', blockPrefix: '```', blockSuffix: '```' },
  link: { prefix: '[', suffix: '](https://)', replaceNext: 'https://', scanFor: 'https?://' },
  image: { prefix: '![', suffix: '](https://)', replaceNext: 'https://', scanFor: 'https?://' },
  unordered_list: { prefix: '- ', multiline: true, surroundWithNewlines: true },
  ordered_list: { prefix: '1. ', multiline: true, orderedList: true },
  spoiler: { prefix: '>!', suffix: '!<', blockPrefix: '>! ', multiline: true, trimFirst: true },
};

const applyStyle = (id, editorDriver) => {
  styleSelectedText(editorDriver.el, styles[id]);
};

function makeShortcut(id, key, editorDriver) {
  return function (e) {
    if (e.key === key && ((e.metaKey && modifierKey === '⌘') || (e.ctrlKey && modifierKey === 'ctrl'))) {
      e.preventDefault();
      applyStyle(id, editorDriver);
    }
  };
}

function markdownToolbarItems(oldFunc) {
  const items = typeof oldFunc === 'function' ? oldFunc() : new ItemList();

  function tooltip(name, hotkey) {
    return app.translator.trans(`flarum-markdown.lib.composer.${name}_tooltip`) + (hotkey ? ` <${modifierKey}-${hotkey}>` : '');
  }

  const makeApplyStyle = (id) => {
    return () => applyStyle(id, this.attrs.composer.editor);
  };

  items.add('header', <MarkdownButton title={tooltip('header')} icon="fas fa-heading" onclick={makeApplyStyle('header')} />, 1000);
  items.add('bold', <MarkdownButton title={tooltip('bold', 'b')} icon="fas fa-bold" onclick={makeApplyStyle('bold')} />, 900);
  items.add('italic', <MarkdownButton title={tooltip('italic', 'i')} icon="fas fa-italic" onclick={makeApplyStyle('italic')} />, 800);
  items.add(
    'strikethrough',
    <MarkdownButton title={tooltip('strikethrough')} icon="fas fa-strikethrough" onclick={makeApplyStyle('strikethrough')} />,
    700
  );
  items.add('quote', <MarkdownButton title={tooltip('quote')} icon="fas fa-quote-left" onclick={makeApplyStyle('quote')} />, 600);
  items.add('spoiler', <MarkdownButton title={tooltip('spoiler')} icon="fas fa-exclamation-triangle" onclick={makeApplyStyle('spoiler')} />, 500);
  items.add('code', <MarkdownButton title={tooltip('code')} icon="fas fa-code" onclick={makeApplyStyle('code')} />, 400);
  items.add('link', <MarkdownButton title={tooltip('link')} icon="fas fa-link" onclick={makeApplyStyle('link')} />, 300);
  items.add('image', <MarkdownButton title={tooltip('image')} icon="fas fa-image" onclick={makeApplyStyle('image')} />, 200);
  items.add(
    'unordered_list',
    <MarkdownButton title={tooltip('unordered_list')} icon="fas fa-list-ul" onclick={makeApplyStyle('unordered_list')} />,
    100
  );
  items.add('ordered_list', <MarkdownButton title={tooltip('ordered_list')} icon="fas fa-list-ol" onclick={makeApplyStyle('ordered_list')} />, 0);

  return items;
}

export function initialize(app) {
  // 初始化依赖管理器
  console.log('🚀 初始化Flarum Markdown插件...');
  
  // 创建Markdown渲染器实例
  app.markdown = new MarkdownRenderer();
  
  // 监听依赖加载事件
  window.addEventListener('flarum-markdown-dependencies-loaded', async () => {
    console.log('✅ 依赖加载完成，启动Markdown功能...');
    
    // 确保渲染器已初始化
    try {
      await app.markdown.initialize();
      console.log('🎯 Markdown渲染器已就绪');
    } catch (error) {
      console.error('❌ Markdown渲染器初始化失败:', error);
    }
    
    // 初始化调试器（如果需要）
    if (markdownDebugger) {
      markdownDebugger.validateRenderer();
    }
  });

  // 扩展Post模型
  extendPostModel();

  // ... existing code ...
  extend(BasicEditorDriver.prototype, 'keyHandlers', function (items) {
    items.add('bold', makeShortcut('bold', 'b', this));
    items.add('italic', makeShortcut('italic', 'i', this));
  });

  override('flarum/common/components/TextEditor', 'markdownToolbarItems', markdownToolbarItems);

  extend('flarum/common/components/TextEditor', 'toolbarItems', function (items) {
    items.add(
      'markdown',
      <MarkdownToolbar for={this.textareaId} setShortcutHandler={(handler) => (shortcutHandler = handler)}>
        {this.markdownToolbarItems().toArray()}
      </MarkdownToolbar>,
      100
    );
  });

  // 添加实时预览功能
  extend('flarum/common/components/TextEditor', 'view', function(vnode) {
    if (this.attrs.preview && this.value()) {
      const previewContent = m(MarkdownContent, { content: this.value() });
      vnode.children.push(m('div.MarkdownPreview', previewContent));
    }
  });

  // 扩展帖子显示 - 详细调试版本
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
}
