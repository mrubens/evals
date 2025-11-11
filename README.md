# Roo Code Evals

A comprehensive polyglot evaluation suite for testing AI coding capabilities across multiple programming languages. This repository contains coding exercises from Exercism, adapted for systematic evaluation of code generation and problem-solving abilities.

This is based on the outstanding work done by [Aider](https://aider.chat/2024/12/21/polyglot.html).

## Overview

This repository provides a standardized testing framework for evaluating AI coding assistants across six programming languages:

- **C++** - Systems programming and performance-critical code
- **Go** - Concurrent systems and backend services
- **Java** - Enterprise applications and object-oriented design
- **JavaScript** - Web development and async programming
- **Python** - Data processing and scripting
- **Rust** - Memory-safe systems programming

Each language track contains multiple exercises of varying difficulty, from basic algorithms to complex problem-solving challenges.

## Repository Structure

```
evals/
├── README.md              # This file
├── run_tests.sh          # Master test runner for all languages
├── prompts/              # Language-specific evaluation prompts
│   ├── cpp.md
│   ├── go.md
│   ├── java.md
│   ├── javascript.md
│   ├── python.md
│   └── rust.md
├── cpp/                  # C++ exercises
├── go/                   # Go exercises
├── java/                 # Java exercises
├── javascript/           # JavaScript exercises
├── python/               # Python exercises
└── rust/                 # Rust exercises
```

Each language directory contains:
- Multiple exercise subdirectories
- A `run_tests.sh` script for running all tests in that language
- Exercise-specific implementation files and test suites

Each exercise directory typically includes:
- `.docs/` - Exercise description and instructions
- Implementation file(s) - Stubbed code to complete
- Test file(s) - Comprehensive test suite
- Language-specific build/config files

## Getting Started

### Prerequisites

Ensure you have the following tools installed:

- **C++**: CMake 3.x+, C++17 compatible compiler
- **Go**: Go 1.21+
- **Java**: JDK 11+, Gradle
- **JavaScript**: Node.js 18+, pnpm
- **Python**: Python 3.11+, uv
- **Rust**: Rust 1.70+ (via rustup)

### Running Tests

#### Run All Tests

Execute tests across all languages:

```bash
./run_tests.sh
```

#### Run Language-Specific Tests

Navigate to a language directory and run its test suite:

```bash
cd go && ./run_tests.sh
cd java && ./run_tests.sh
cd javascript && ./run_tests.sh
cd python && ./run_tests.sh
cd rust && ./run_tests.sh
```

#### Run Individual Exercise Tests

Each language has its own test command format:

**C++:**
```bash
cd cpp/exercise-name
mkdir -p build && cd build
cmake -G "Unix Makefiles" -DEXERCISM_RUN_ALL_TESTS=1 ..
make
```

**Go:**
```bash
cd go/exercise-name
go test
```

**Java:**
```bash
cd java/exercise-name
./gradlew test
```

**JavaScript:**
```bash
cd javascript/exercise-name
pnpm install --frozen-lockfile
pnpm test
```

**Python:**
```bash
cd python/exercise-name
uv run python3 -m pytest -o markers=task exercise_test.py
```

**Rust:**
```bash
cd rust/exercise-name
cargo test
```

## Using the Evaluation Prompts

The `prompts/` directory contains language-specific instructions for AI evaluation. Each prompt file provides:

- Task description format
- Test execution commands
- Constraints and rules
- Success criteria

These prompts are designed to be used with AI coding assistants to evaluate their ability to:
1. Understand problem descriptions
2. Implement correct solutions
3. Pass comprehensive test suites
4. Follow language-specific best practices

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

When contributing:
- Ensure all tests pass before submitting
- Follow the existing code structure and conventions
- Add tests for new exercises
- Update documentation as needed

## Source Attribution

All exercises in this repository are sourced from the following Exercism language tracks:

- [C++ Track](https://github.com/exercism/cpp)
- [Go Track](https://github.com/exercism/go) 
- [Java Track](https://github.com/exercism/java)
- [JavaScript Track](https://github.com/exercism/javascript)
- [Python Track](https://github.com/exercism/python)
- [Rust Track](https://github.com/exercism/rust)

All exercise content is copyright © [Exercism](https://exercism.org). These exercises are used in accordance with Exercism's open source licenses.

Please visit [Exercism](https://exercism.org) or the repositories above to see licensing of these coding exercises.

## License

See individual exercise directories for specific licensing information. All Exercism content is used in accordance with their respective open source licenses.

## Acknowledgments

- **Exercism** - For providing high-quality coding exercises across multiple languages
- **Aider** - For pioneering polyglot evaluation approaches and inspiring this work
- The open source community for maintaining excellent language tooling and test frameworks
