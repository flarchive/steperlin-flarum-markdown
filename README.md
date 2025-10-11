# Flarum Markdown Extension

[![Latest Version](https://img.shields.io/packagist/v/steperlin/flarum-markdown.svg)](https://packagist.org/packages/steperlin/flarum-markdown)
[![Total Downloads](https://img.shields.io/packagist/dt/steperlin/flarum-markdown.svg)](https://packagist.org/packages/steperlin/flarum-markdown)
[![License](https://img.shields.io/packagist/l/steperlin/flarum-markdown.svg)](https://packagist.org/packages/steperlin/flarum-markdown)

A modern, secure Markdown extension for Flarum with **client-side rendering** using marked.js. This extension provides real-time preview, enhanced security, and improved performance compared to traditional server-side rendering.

## ✨ Features

- 🚀 **Client-side rendering** with marked.js v15.0.12
- 🔒 **XSS protection** using DOMPurify
- 👀 **Real-time preview** with edit/preview mode toggle
- 🎨 **GitHub-flavored Markdown** support
- ⚡ **Performance optimized** with intelligent caching
- 🛡️ **Secure spoiler tags** with click-to-reveal
- 🔧 **Modern toolbar** with all standard Markdown shortcuts
- 🌐 **Fully localized** interface

## 📦 Installation

### Via Composer (Recommended)

```bash
composer require steperlin/flarum-markdown
```

### Manual Installation

1. Download the latest release from [GitHub](https://github.com/linkerlin/flarum-markdown/releases)
2. Extract to your Flarum `extensions` directory
3. Enable the extension in your Flarum admin panel

### Post-Installation

After installation, clear your cache and migrate:

```bash
php flarum cache:clear
php flarum migrate
```

## 🚀 Usage

### Basic Markdown

The extension supports all standard Markdown syntax:

```markdown
# Headers
**Bold text**
*Italic text*
~~Strikethrough~~
`Inline code`

> Blockquotes

- Unordered lists
1. Ordered lists

[Links](https://example.com)
![Images](https://example.com/image.jpg)

```javascript
// Code blocks with syntax highlighting
function hello() {
    console.log("Hello, world!");
}
```

### Spoiler Tags

Create spoiler content that users can click to reveal:

```markdown
>!This is a spoiler!<
```

### Real-time Preview

- Click the **"Preview"** tab to see rendered output
- Switch back to **"Write"** to continue editing
- Changes are rendered instantly as you type

## 🔧 Configuration

The extension works out-of-the-box with sensible defaults. All configuration is handled through the Flarum admin interface.

### Toolbar Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/⌘ + B` | Bold text |
| `Ctrl/⌘ + I` | Italic text |

## 🛡️ Security

This extension prioritizes security:

- **DOMPurify sanitization** prevents XSS attacks
- **Whitelist-based filtering** allows only safe HTML tags
- **Secure spoiler implementation** without unsafe JavaScript
- **URL validation** restricts dangerous protocols

## 🔄 Migration from Other Extensions

### From flarum/markdown

This extension is a drop-in replacement for the official flarum/markdown extension with enhanced features and security.

### From BBCode

While this extension focuses on Markdown, existing BBCode content will remain functional until you choose to migrate.

## 🎨 Customization

### Styling

The extension includes comprehensive CSS classes for customization:

```css
.MarkdownContent {
    /* Style rendered Markdown content */
}

.MarkdownPreviewEditor {
    /* Style the preview editor */
}

.spoiler {
    /* Customize spoiler appearance */
}
```

### Extending Functionality

The extension provides hooks for developers to extend functionality:

```javascript
// Extend the markdown renderer
app.markdown.configureMarked();

// Add custom toolbar items
extend('flarum/common/components/TextEditor', 'markdownToolbarItems', function(items) {
    items.add('custom', <CustomButton />, 50);
});
```

## 📋 Requirements

- **Flarum**: ^2.0.0-beta.3 or higher
- **PHP**: ^8.1 or higher
- **Browser**: Modern browser with ES6 support

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/linkerlin/flarum-markdown.git
cd flarum-markdown

# Install dependencies
cd js
npm install

# Build for development
npm run dev

# Build for production
npm run build
```

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes.

## 🐛 Troubleshooting

### Common Issues

**Issue**: Markdown not rendering
**Solution**: Clear Flarum cache with `php flarum cache:clear`

**Issue**: Toolbar buttons not working
**Solution**: Ensure JavaScript is enabled and rebuild extension assets

**Issue**: Spoilers not working
**Solution**: Check browser console for JavaScript errors

### Getting Help

- 🐛 [Report bugs](https://github.com/linkerlin/flarum-markdown/issues)
- 💬 [Community forum](https://zhichai.net)
- 📚 [Documentation](https://github.com/linkerlin/flarum-markdown/wiki)

## 📄 License

This extension is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [marked.js](https://marked.js.org/) - Fast Markdown parser
- [DOMPurify](https://github.com/cure53/DOMPurify) - XSS sanitizer
- [Flarum](https://flarum.org/) - Modern forum software
- [GitHub Markdown Toolbar](https://github.com/github/markdown-toolbar-element) - Toolbar implementation

## 🌟 Support

If you find this extension helpful, please consider:

- ⭐ Starring the [GitHub repository](https://github.com/linkerlin/flarum-markdown)
- 🐛 Reporting bugs and issues
- 🔧 Contributing improvements
- 💖 [Supporting Flarum development](https://flarum.org/donate/)

---

Made with ❤️ for the Flarum community