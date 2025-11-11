# Contributing to Roo Code Evals

Thank you for your interest in contributing to Roo Code Evals! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Adding New Exercises](#adding-new-exercises)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

This project follows a code of conduct that promotes a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/evals.git
   cd evals
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Set up your development environment** (see [README.md](README.md) for prerequisites)

## How to Contribute

### Types of Contributions

We welcome several types of contributions:

- **Bug fixes** - Fix issues in existing exercises or test suites
- **New exercises** - Add exercises from Exercism or create original ones
- **Documentation** - Improve README, prompts, or inline documentation
- **Test improvements** - Enhance test coverage or clarity
- **Tooling** - Improve build scripts, test runners, or CI/CD

### Before You Start

1. **Check existing issues** to see if someone is already working on it
2. **Open an issue** to discuss major changes before implementing them
3. **Keep changes focused** - one feature or fix per pull request
4. **Follow existing patterns** - maintain consistency with the codebase

## Adding New Exercises

When adding a new exercise:

1. **Source from Exercism** when possible to maintain quality and licensing clarity
2. **Create the directory structure**:
   ```
   language/exercise-name/
   ├── .docs/              # Exercise description
   ├── implementation.*    # Stubbed implementation
   ├── test.*             # Comprehensive test suite
   └── [config files]     # Language-specific build/config
   ```
3. **Include comprehensive tests** that cover:
   - Happy path scenarios
   - Edge cases
   - Error conditions
   - Performance considerations (if relevant)
4. **Add to the language's run_tests.sh** if needed
5. **Update documentation** to reference the new exercise

### Exercise Quality Standards

- **Clear instructions** in `.docs/` directory
- **Minimal stub code** - enough to compile but requiring implementation
- **Comprehensive tests** - covering normal and edge cases
- **No test modifications needed** - tests should pass as-is with correct implementation
- **Language idioms** - follow language-specific best practices

## Testing Guidelines

### Before Submitting

Always run tests to ensure your changes work:

```bash
# Test all languages
./run_tests.sh

# Test specific language
cd <language> && ./run_tests.sh

# Test specific exercise
cd <language>/<exercise> && [language-specific test command]
```

### Test Requirements

- All existing tests must continue to pass
- New exercises must include comprehensive test coverage
- Tests should be deterministic (no random failures)
- Tests should complete in reasonable time (< 30 seconds per exercise)

## Pull Request Process

1. **Update your branch** with the latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all tests** to ensure nothing is broken

3. **Commit your changes** with clear, descriptive messages:
   ```bash
   git add .
   git commit -m "feat: add alphametics exercise for Python"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** with:
   - Clear title describing the change
   - Description of what changed and why
   - Reference to any related issues
   - Screenshots or examples if applicable

6. **Respond to feedback** - reviewers may request changes

7. **Wait for CI** - all automated checks must pass

### Commit Message Format

Follow conventional commits format:

- `feat:` - New feature or exercise
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test additions or modifications
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

Examples:
```
feat: add poker exercise for Go
fix: correct edge case in Java circular-buffer
docs: improve setup instructions in README
test: add edge cases for Python alphametics
```

## Style Guidelines

### General

- Use consistent indentation (follow language conventions)
- Include comments for complex logic
- Keep functions/methods focused and small
- Use descriptive variable and function names

### Language-Specific

Follow the established conventions for each language:

- **C++**: Follow C++17 standards, use modern C++ idioms
- **Go**: Follow `gofmt` and Go standard practices
- **Java**: Follow Java naming conventions, use Java 11+ features
- **JavaScript**: Follow ESLint rules, use modern ES6+ syntax
- **Python**: Follow PEP 8, use type hints where helpful
- **Rust**: Follow `rustfmt` and Rust idioms

### Documentation

- Use clear, concise language
- Include code examples where helpful
- Keep documentation up-to-date with code changes
- Use proper markdown formatting

## Questions?

If you have questions:

1. Check existing documentation in [README.md](README.md)
2. Search existing issues on GitHub
3. Open a new issue with the "question" label
4. Reach out to maintainers

## Attribution

When contributing exercises from Exercism or other sources:

- Maintain proper attribution in comments
- Respect original licenses
- Link to source repositories
- Credit original authors

## Thank You!

Your contributions help make this project better for everyone. We appreciate your time and effort!