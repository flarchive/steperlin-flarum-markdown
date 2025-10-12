console.log('🔍 Debug Markdown Renderer Status:'); 
console.log('app.markdown:', window.app?.markdown); 
console.log('MarkdownDebug helpers:', window.MarkdownDebug);
if (window.app?.markdown) {
  console.log('Renderer status:', window.app.markdown.getStatus());
  console.log('Test render:', window.app.markdown.render('**test**'));
}
console.log('Post 804 data:', window.app?.store?.getById('posts', '804'));

