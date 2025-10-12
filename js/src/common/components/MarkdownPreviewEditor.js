import Component from 'flarum/common/Component';
import TextEditor from 'flarum/common/components/TextEditor';
import MarkdownContent from './MarkdownContent';
import app from 'flarum/common/app';

export default class MarkdownPreviewEditor extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    this.showPreview = false;
    this.content = vnode.attrs.value || '';
  }

  view(vnode) {
    return m('div.MarkdownPreviewEditor', [
      // 工具栏
      m('div.PreviewToolbar', [
        m('button.Button', {
          className: !this.showPreview ? 'active' : '',
          onclick: () => { this.showPreview = false; }
        }, app.translator.trans('flarum-markdown.lib.composer.write')),
        
        m('button.Button', {
          className: this.showPreview ? 'active' : '',
          onclick: () => { this.showPreview = true; }
        }, app.translator.trans('flarum-markdown.lib.composer.preview'))
      ]),

      // 编辑器或预览
      this.showPreview 
        ? m('div.PreviewPane', m(MarkdownContent, { content: this.content }))
        : m(TextEditor, {
            ...vnode.attrs,
            oninput: (value) => {
              this.content = value;
              if (vnode.attrs.oninput) vnode.attrs.oninput(value);
            }
          })
    ]);
  }
}