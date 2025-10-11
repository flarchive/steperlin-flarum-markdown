import Component from 'flarum/common/Component';
import app from 'flarum/common/app';

export default class MarkdownContent extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    this.content = vnode.attrs.content || '';
    this.renderer = app.markdown;
  }

  view() {
    const htmlContent = this.renderer.render(this.content);
    
    return m('div.MarkdownContent', {
      innerHTML: htmlContent
    });
  }

  onupdate(vnode) {
    // 如果内容变化，重新渲染
    if (vnode.attrs.content !== this.content) {
      this.content = vnode.attrs.content;
      m.redraw();
    }
  }
}