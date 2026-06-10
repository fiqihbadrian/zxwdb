# Contributing to ZxwDB

First off, thank you for considering contributing to ZxwDB! It's people like you that make ZxwDB such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, Node.js version, MySQL/MariaDB version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would be used**

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes with clear commit messages:
   ```bash
   git commit -m "Add feature: description of your feature"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Open a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/ZxwDB.git
cd ZxwDB

# Install dependencies
npm run install:all

# Start development servers
npm run dev
```

### Coding Standards

- Use TypeScript for type safety
- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

### Testing

Before submitting a pull request:

1. Test your changes manually
2. Make sure the application builds without errors:
   ```bash
   npm run build
   ```
3. Check for TypeScript errors
4. Test with different MySQL/MariaDB versions if possible

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing! 🎉
