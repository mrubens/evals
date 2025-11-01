# Roo Code Evals (draftyyy)

A polyglot evaluation suite for testing AI coding assistants across multiple programming languages. This project is based on the outstanding work done by [Aider](https://aider.chat/2024/12/21/polyglot.html).

## Overview

This repository contains coding exercises from [Exercism](https://exercism.org) across six programming languages, designed to evaluate the performance of AI coding assistants. Each exercise includes:

- Implementation stubs
- Comprehensive test suites
- Exercise documentation in `.docs` directories
- Language-specific test runners

## Supported Languages

- **C++** - Modern C++ exercises
- **Go** - Idiomatic Go challenges
- **Java** - Object-oriented Java problems
- **JavaScript** - ES6+ JavaScript exercises
- **Python** - Pythonic coding challenges
- **Rust** - Safe and concurrent Rust exercises

## Getting Started

### Prerequisites

Ensure you have the following tools installed for the languages you want to test:

- **JavaScript**: [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/)
- **Python**: [Python 3](https://www.python.org/) and [uv](https://github.com/astral-sh/uv)
- **Go**: [Go toolchain](https://go.dev/)
- **Rust**: [Rust toolchain](https://www.rust-lang.org/)
- **Java**: [JDK](https://openjdk.org/) and [Gradle](https://gradle.org/)
- **C++**: C++ compiler and [CMake](https://cmake.org/)

### Running Tests

#### Run All Tests

Execute tests across all languages:

```bash
./run_tests.sh
```

#### Run Tests for a Specific Language

Navigate to the language directory and run its test script:

```bash
cd javascript && ./run_tests.sh
cd python && ./run_tests.sh
cd go && ./run_tests.sh
cd rust && ./run_tests.sh
cd java && ./run_tests.sh
```

#### Run Tests for a Single Exercise

**JavaScript:**
```bash
cd javascript/alphametics
pnpm install --frozen-lockfile
pnpm test
```

**Python:**
```bash
cd python/alphametics
uv run python3 -m pytest -o markers=task alphametics_test.py
```

## Project Structure

```
.
├── README.md
├── LICENSE
├── run_tests.sh          # Master test runner for all languages
├── prompts/              # Language-specific prompt templates
│   ├── javascript.md
│   ├── python.md
│   └── ...
├── javascript/           # JavaScript exercises
│   ├── run_tests.sh
│   └── [exercise-name]/
│       ├── package.json
│       ├── [exercise].js
│       └── [exercise].spec.js
├── python/               # Python exercises
│   ├── run_tests.sh
│   └── [exercise-name]/
│       ├── [exercise].py
│       └── [exercise]_test.py
└── [other-languages]/    # Similar structure for Go, Rust, Java, C++
```

## Using with AI Coding Assistants

Each language directory contains a `prompts/` folder with instructions for AI assistants. These prompts guide the AI to:

1. Read exercise documentation from `.docs` directories
2. Implement solutions in the provided stub files
3. Run tests to verify correctness
4. Avoid modifying test files

## Evaluation Metrics

The test runners provide:

- **Success count**: Number of exercises passing all tests
- **Failure count**: Number of exercises with failing tests
- **Success rate**: Percentage of exercises completed successfully

Example output:
```
🟢 javascript/alphametics
🔴 javascript/binary
🟢 javascript/bottle-song
...
25 / 30 (83%)
```

## Source Attribution

All exercises in this repository are sourced from the following Exercism language tracks:

- [C++ Track](https://github.com/exercism/cpp)
- [Go Track](https://github.com/exercism/go) 
- [Java Track](https://github.com/exercism/java)
- [JavaScript Track](https://github.com/exercism/javascript)
- [Python Track](https://github.com/exercism/python)
- [Rust Track](https://github.com/exercism/rust)

All exercise content is copyright © [Exercism](https://exercism.org). These exercises are used in accordance with Exercism's open source licenses.

Please visit [Exercism](https://exercism.org) or the repos above to see licensing of these coding exercises.
