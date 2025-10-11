import { extend } from 'flarum/common/extend';
import Post from 'flarum/common/models/Post';
import app from 'flarum/common/app';

export default function extendPostModel() {
  // 添加markdown内容类型支持
  extend(Post.prototype, 'contentHtml', function(html) {
    // 如果是markdown内容，进行客户端渲染
    if (this.attribute('contentType') === 'markdown') {
      const markdownSource = this.attribute('content');
      return app.markdown.render(markdownSource);
    }
    return html;
  });

  // 处理编辑时的内容
  extend(Post.prototype, 'save', function(promise, data) {
    // 确保保存原始markdown而不是渲染后的HTML
    if (data.content && this.attribute('contentType') === 'markdown') {
      // 保存原始markdown内容
      data.contentMarkdown = data.content;
    }
    return promise;
  });
}