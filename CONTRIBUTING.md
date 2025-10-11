# Contributing to Flarum Markdown Extension

Thank you for your interest in contributing to the Flarum Markdown extension! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- PHP 8.1 or higher
- Node.js 16 or higher
- Composer 2.0 or higher
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/linkerlin/flarum-markdown.git
   cd flarum-markdown
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   cd js
   npm install
   ```

4. **Build for development**
   ```bash
   npm run dev
   ```

## 📝 Development Guidelines

### Code Style

#### PHP
- Follow PSR-12 coding standards
- Use meaningful variable and function names
- Add PHPDoc comments for all public methods
- Keep methods focused and single-purpose

#### JavaScript
- Use ES6+ features
- Follow Prettier formatting (run `npm run format`)
- Use JSDoc comments for complex functions
- Prefer functional programming patterns

#### CSS/LESS
- Use BEM naming convention
- Keep selectors specific but not overly nested
- Use CSS custom properties for theming
- Ensure responsive design

### Commit Messages

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(renderer): add syntax highlighting support
fix(spoiler): resolve click event handling
docs(readme): update installation instructions
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment information**:
   - Flarum version
   - PHP version
   - Browser and version
   - Extension version
5. **Console errors** (if any)
6. **Screenshots** (if applicable)

## ✨ Feature Requests

For feature requests:

1. **Check existing issues** to avoid duplicates
2. **Describe the use case** clearly
3. **Explain the expected behavior**
4. **Consider implementation impact**
5. **Provide examples** if possible

## 🔧 Pull Requests

### Before Submitting

1. **Create an issue** to discuss major changes
2. **Fork the repository** and create a feature branch
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Test thoroughly** in different scenarios

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages follow conventional format

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** in development environment
4. **Documentation review**
5. **Final approval** and merge

## 🧪 Testing

### Running Tests

```bash
# PHP tests (when available)
composer test

# JavaScript tests
cd js
npm test

# Linting
npm run format-check
```

### Manual Testing

1. **Install in development Flarum**
2. **Test all toolbar buttons**
3. **Verify preview functionality**
4. **Check spoiler behavior**
5. **Test with various Markdown content**
6. **Validate security features**

## 📚 Documentation

### Types of Documentation

- **Code comments**: For complex logic
- **README.md**: User-facing documentation
- **CHANGELOG.md**: Version history
- **API documentation**: For extensibility

### Documentation Standards

- Use clear, concise language
- Provide examples where helpful
- Keep documentation up-to-date with code changes
- Consider both beginners and advanced users

## 🔒 Security

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead:
1. Email security concerns to: [security@example.com]
2. Include detailed description
3. Provide reproduction steps
4. Wait for response before disclosure

### Security Guidelines

- Always sanitize user input
- Use whitelist-based validation
- Avoid dangerous HTML/JavaScript
- Test XSS prevention thoroughly
- Review dependencies for vulnerabilities

## 🌐 Internationalization

### Adding Translations

1. **Edit locale files** in `/locale/`
2. **Follow existing key structure**
3. **Provide context** for translators
4. **Test with different languages**

### Translation Guidelines

- Use descriptive keys
- Avoid concatenating translated strings
- Support pluralization where needed
- Consider RTL languages

## 📋 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Steps

1. **Update CHANGELOG.md**
2. **Bump version** in relevant files
3. **Create release tag**
4. **Build production assets**
5. **Publish to Packagist**
6. **Update documentation**

## 🤝 Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Forum**: [Community discussions](https://zhichai.net)

### Code of Conduct

We follow the [Flarum Code of Conduct](https://flarum.org/code-of-conduct). Please:

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Report unacceptable behavior

## 🎯 Project Goals

### Short-term
- Maintain compatibility with Flarum updates
- Fix reported bugs promptly
- Improve documentation
- Add comprehensive tests

### Long-term
- Enhanced syntax highlighting
- Advanced preview features
- Better mobile experience
- Plugin ecosystem support

## 📞 Getting Help

- **Documentation**: Check README.md first
- **Search Issues**: Look for existing solutions
- **Create Issue**: For bugs or feature requests
- **Community Forum**: For general questions

Thank you for contributing to make Flarum Markdown extension better! 🙏