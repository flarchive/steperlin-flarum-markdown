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
  // This is a nasty hack that breaks encapsulation of the editor.
  // In future releases, we'll need to tweak the editor driver interface
  // to support triggering events like this.
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

  // 扩展帖子显示 - 修改 contentHtml 方法而不是 content
  // 这是Flarum正确的扩展方式
  extend('flarum/common/components/CommentPost', 'contentHtml', function(html) {
    console.log('📝 CommentPost.contentHtml called for post:', this.attrs.post?.id());
    
    const post = this.attrs.post;
    if (!post || !app.markdown) {
      console.log('⚠️ No post or markdown renderer available');
      return html;
    }

    const rawContent = post.attribute('content');
    const contentType = post.attribute('contentType');
    
    console.log('� Content info:', { 
      postId: post.id(), 
      contentType, 
      hasRawContent: !!rawContent,
      rawContentPreview: rawContent?.substring(0, 100)
    });

    // 检测是否需要渲染 Markdown
    if (contentType === 'markdown' || this.detectMarkdownSyntax(rawContent)) {
      console.log('✅ Rendering markdown for post:', post.id());
      try {
        const rendered = app.markdown.renderSync 
          ? app.markdown.renderSync(rawContent)
          : app.markdown.render(rawContent);
        console.log('✨ Markdown rendered successfully');
        return rendered;
      } catch (error) {
        console.error('❌ Markdown rendering failed:', error);
      }
    }

    return html;
  });

  // 添加 Markdown 检测辅助方法到 CommentPost
  extend('flarum/common/components/CommentPost', 'oninit', function() {
    this.detectMarkdownSyntax = function(content) {
      if (!content || typeof content !== 'string') {
        return false;
      }

      const markdownPatterns = [
        /^#{1,6}\s+/m,           // 标题
        /\*\*.*?\*\*/,           // 粗体
        /\*.*?\*/,               // 斜体
        /\[.*?\]\(.*?\)/,        // 链接
        /`.*?`/,                 // 行内代码
        /^```[\s\S]*?```$/m,     // 代码块
        /^>\s+/m,                // 引用
        /^[-*+]\s+/m,            // 无序列表
        /^\d+\.\s+/m,            // 有序列表
        />!.*?!</,               // Spoiler
        /~~.*?~~/,               // 删除线
        /======/,                // 分隔线
      ];

      return markdownPatterns.some(pattern => pattern.test(content));
    };
  });
}
