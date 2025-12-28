#!/usr/bin/env bash

cd $(dirname "${BASH_SOURCE[0]}")
dir=$(pwd)

# Check test guard to prevent infinite loops
if ! "$dir/test_guard.sh"; then
  exit 1
fi

cd "$dir/go" && ./run_tests.sh
cd "$dir/java" && ./run_tests.sh
cd "$dir/javascript" && ./run_tests.sh
cd "$dir/python" && ./run_tests.sh
cd "$dir/rust" && ./run_tests.sh
