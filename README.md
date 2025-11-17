# Roo Code Evals

A comprehensive polyglot evaluation suite for testing code generation capabilities across multiple programming languages. This project is based on the outstanding work done by [Aider](https://aider.chat/2024/12/21/polyglot.html).
> *Code tests await,*  
> *Five languages intertwine—*  
> *Solutions take shape.*


## Overview

This repository contains coding exercises from Exercism across six programming languages, designed to evaluate and benchmark code generation tools and AI assistants. Each exercise includes test suites that validate the correctness of generated solutions.

## Supported Languages

- **C++** - Modern C++ exercises
- **Go** - Idiomatic Go programming challenges
- **Java** - Object-oriented Java exercises with Gradle build system
- **JavaScript** - ES6+ JavaScript challenges with Jest testing
- **Python** - Pythonic solutions with pytest
- **Rust** - Safe and concurrent Rust exercises

## Repository Structure

```
evals/
├── README.md           # This file
├── LICENSE            # MIT License
├── run_tests.sh       # Master test runner for all languages
├── prompts/           # Language-specific prompt templates
│   ├── cpp.md
│   ├── go.md
│   ├── java.md
│   ├── javascript.md
│   ├── python.md
│   └── rust.md
├── cpp/               # C++ exercises
├── go/                # Go exercises
├── java/              # Java exercises
├── javascript/        # JavaScript exercises
├── python/            # Python exercises
└── rust/              # Rust exercises
```

Each language directory contains:
- Individual exercise directories with implementation stubs and tests
- A `run_tests.sh` script for running all exercises in that language
- Language-specific build/dependency files

## Prerequisites

To run the exercises, you'll need the following tools installed:

- **C++**: C++17 compatible compiler (GCC/Clang), CMake
- **Go**: Go 1.16 or later
- **Java**: JDK 11 or later, Gradle wrapper included
- **JavaScript**: Node.js 14+, npm/pnpm
- **Python**: Python 3.8+, pytest, uv (optional but recommended)
- **Rust**: Rust 1.56+ (install via rustup)

## Running Tests

### Run All Tests

Execute all tests across all languages:

```bash
./run_tests.sh
```

### Run Tests for a Specific Language

Each language directory has its own test runner:

```bash
# Go exercises
cd go && ./run_tests.sh

# Java exercises
cd java && ./run_tests.sh

# JavaScript exercises
cd javascript && ./run_tests.sh

# Python exercises
cd python && ./run_tests.sh

# Rust exercises
cd rust && ./run_tests.sh
```

### Run a Single Exercise

Navigate to the specific exercise directory and run its tests:

```bash
# Go example
cd go/alphametics && go test

# Java example
cd java/alphametics && ./gradlew test

# JavaScript example
cd javascript/parallel-letter-frequency && npm test

# Python example
cd python/alphametics && pytest

# Rust example
cd rust/parallel-letter-frequency && cargo test
```

## Test Output Format

The test runners provide color-coded output:
- 🟢 Exercise passed all tests
- 🔴 Exercise failed one or more tests
- ⚠️ Exercise skipped (missing required files)

Summary statistics show: `passed / total (percentage%)`

## Using the Prompts

The `prompts/` directory contains language-specific instructions for AI assistants or code generation tools. Each prompt file describes:
- The task structure (implementation stub + tests)
- How to run tests for that language
- Guidelines for completing exercises

## Exercise Categories

Exercises cover various programming concepts:
- **Data Structures**: linked lists, trees, circular buffers
- **Algorithms**: search, sorting, graph traversal
- **String Manipulation**: parsing, pattern matching, transformations
- **Mathematics**: number theory, combinatorics
- **Concurrency**: parallel processing (where applicable)
- **Domain Logic**: game rules, business logic, simulations

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests for:
- Additional exercises
- Bug fixes in existing solutions
- Documentation improvements
- Test runner enhancements

## Acknowledgments

- [Exercism](https://exercism.org) for providing the excellent exercise collection
- [Aider](https://aider.chat) for pioneering polyglot code evaluation methodologies
- All contributors to the Exercism language tracks
