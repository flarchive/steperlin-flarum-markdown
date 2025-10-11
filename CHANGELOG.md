# Changelog

All notable changes to the Flarum Markdown extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2024-01-11

### Fixed
- **CRITICAL**: Fixed Markdown content not rendering in existing posts
- **CRITICAL**: Resolved noscript tag content display issues
- **CRITICAL**: Fixed client-side rendering components not properly replacing server-side content
- Enhanced PostModel extension with intelligent Markdown syntax detection
- Improved content type detection for automatic Markdown rendering
- Fixed CommentPost and DiscussionPost component integration

### Added
- Comprehensive debugging tools with MarkdownDebugger class
- Global debug helpers accessible via `MarkdownDebug.*` in browser console
- PostContentRenderer component for dedicated content processing
- Intelligent content hashing to prevent unnecessary re-renders
- Enhanced error handling and fallback mechanisms
- Complete troubleshooting documentation
- Packagist webhook configuration for automatic updates

### Improved
- Better Markdown syntax pattern detection (supports more edge cases)
- Enhanced content caching with performance monitoring
- Improved security with additional DOMPurify configurations
- Better integration with Flarum's component lifecycle
- More robust error recovery and debugging capabilities

### Technical
- Added PostContentRenderer for specialized content handling
- Integrated MarkdownDebugger for development and production debugging
- Enhanced component extension patterns for better Flarum integration
- Improved build process with better error reporting
- Added comprehensive documentation for troubleshooting common issues

## [2.1.0] - 2024-01-11

### Added
- **BREAKING**: Complete rewrite with client-side rendering using marked.js v15.0.12
- Real-time preview functionality with edit/preview toggle
- XSS protection using DOMPurify v3.0.5
- Secure spoiler tag implementation
- Performance optimizations with intelligent caching
- GitHub-flavored Markdown support
- Modern toolbar with keyboard shortcuts
- Comprehensive localization support
- Complete Composer package support
- Professional documentation and CI/CD pipeline

### Changed
- **BREAKING**: Migrated from server-side s9e\TextFormatter to client-side marked.js
- **BREAKING**: Minimum PHP version now 8.1+
- **BREAKING**: Minimum Flarum version now 2.0.0-beta.3+
- Improved security with whitelist-based HTML filtering
- Enhanced user experience with real-time preview
- Modernized codebase with ES6+ features
- Optimized bundle size and performance

### Removed
- **BREAKING**: Server-side Markdown processing
- Legacy s9e\TextFormatter configuration

### Security
- Added comprehensive XSS protection
- Implemented secure spoiler rendering without unsafe JavaScript
- Added URL validation and protocol restrictions
- Enhanced content sanitization with DOMPurify

## [Unreleased]

## [2.0.0] - 2024-01-XX

### Added
- **BREAKING**: Complete rewrite for Flarum v2.0 compatibility
- Client-side Markdown rendering for improved performance
- Real-time preview with seamless edit/preview switching
- Enhanced security with DOMPurify sanitization
- Modern ES6+ JavaScript codebase
- Comprehensive CSS styling for all components
- Full localization support with English base

### Changed
- **BREAKING**: Removed dependency on s9e\TextFormatter
- **BREAKING**: Minimum PHP version now 8.1+
- **BREAKING**: Minimum Flarum version now 2.0.0-beta.3+
- Improved spoiler implementation with better accessibility
- Enhanced toolbar with modern icons and tooltips
- Optimized caching system for better performance

### Removed
- **BREAKING**: Server-side Markdown processing
- Legacy s9e\TextFormatter configuration
- Outdated JavaScript patterns

### Fixed
- Cross-site scripting (XSS) vulnerabilities
- Performance issues with large Markdown documents
- Accessibility issues with spoiler tags
- Memory leaks in client-side rendering

### Security
- Implemented comprehensive XSS protection
- Added secure content sanitization
- Enhanced spoiler tag security
- Improved URL validation

## [1.x.x] - Legacy Versions

### Note
Versions 1.x.x used server-side rendering with s9e\TextFormatter. 
This version 2.0.0 represents a complete architectural rewrite for modern Flarum installations.

For legacy version history, please refer to the git history or previous release notes.

---

## Migration Guide

### From 1.x.x to 2.0.0

**Important**: This is a major version upgrade with breaking changes.

#### Prerequisites
- Flarum 2.0.0-beta.3 or higher
- PHP 8.1 or higher
- Modern browser with ES6 support

#### Installation Steps
1. **Backup your forum** before upgrading
2. Remove the old extension: `composer remove steperlin/markdown`
3. Install the new version: `composer require steperlin/flarum-markdown`
4. Clear cache: `php flarum cache:clear`
5. Run migrations: `php flarum migrate`

#### What Changed
- **Rendering**: Now happens client-side for better performance
- **Security**: Enhanced XSS protection with DOMPurify
- **Preview**: Real-time preview functionality added
- **Spoilers**: Improved implementation with better security

#### Potential Issues
- Existing posts will render correctly, but may look slightly different
- Custom CSS targeting old classes may need updates
- Extensions that modify Markdown rendering will need adaptation

---

## Contributing

When contributing to this project, please:

1. Add entries to the `[Unreleased]` section
2. Follow the format: `### Added/Changed/Deprecated/Removed/Fixed/Security`
3. Include issue/PR references where applicable
4. Use semantic versioning for releases

## Support

- 🐛 [Report issues](https://github.com/linkerlin/flarum-markdown/issues)
- 💬 [Community forum](https://zhichai.net)
- 📚 [Documentation](https://github.com/linkerlin/flarum-markdown/blob/main/README.md)