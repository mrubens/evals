#!/usr/bin/env bash

cd $(dirname "${BASH_SOURCE[0]}")
dir=$(pwd)

cd "$dir/cobol" && ./run_tests.sh
cd "$dir/go" && ./run_tests.sh
cd "$dir/java" && ./run_tests.sh
cd "$dir/javascript" && ./run_tests.sh
cd "$dir/python" && ./run_tests.sh
cd "$dir/rust" && ./run_tests.sh
