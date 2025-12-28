# Test Guard - Preventing Infinite Test Loops

## Overview

The Test Guard is a safety mechanism designed to prevent infinite test loops that can lead to excessive API costs when AI agents work on coding exercises. This addresses the issue where an AI agent could get stuck in a cycle of running tests, making changes, and running tests again indefinitely.

## The Problem

When Elliott was working on a Gemini-powered task, the agent entered an infinite loop of:
1. Running tests
2. Seeing failures
3. Making code changes
4. Running tests again
5. Repeat...

This resulted in over $30 in API costs before it was caught.

## The Solution

The Test Guard implements two safeguards:

### 1. Cooldown Period (30 seconds)
Tests cannot be run more frequently than once every 30 seconds. This prevents rapid-fire test execution loops.

### 2. Hourly Run Limit (10 runs)
Tests can only be run 10 times per hour. After reaching this limit, users must wait for the hour window to reset.

## How It Works

The [`test_guard.sh`](test_guard.sh) script is integrated into all test runners:
- [`run_tests.sh`](run_tests.sh) - Main test runner
- [`java/run_tests.sh`](java/run_tests.sh) - Java tests
- [`python/run_tests.sh`](python/run_tests.sh) - Python tests  
- [`go/run_tests.sh`](go/run_tests.sh) - Go tests
- [`javascript/run_tests.sh`](javascript/run_tests.sh) - JavaScript tests
- [`rust/run_tests.sh`](rust/run_tests.sh) - Rust tests

When tests are run, the guard:
1. Checks the lockfile (`/tmp/roo_evals_test_guard.lock`)
2. Enforces the cooldown period
3. Tracks run count within the hour
4. Blocks execution if limits are exceeded
5. Provides clear error messages with wait times

## Usage

### Normal Test Execution
```bash
./run_tests.sh
```

The guard runs automatically. If blocked, you'll see:
```
⚠️  Test cooldown active. Please wait 15s before running tests again.
   This prevents infinite test loops and excessive costs.
```

or

```
⚠️  Maximum test runs per hour exceeded (10).
   Please wait 45m 30s before running tests again.
   This prevents infinite test loops and excessive costs.
```

### Check Current Stats
```bash
./test_guard.sh --stats
```

Output:
```
ℹ️  Test runs in the last hour: 7 / 10
```

### Reset the Guard (Manual Override)
```bash
./test_guard.sh --reset
```

Output:
```
✅ Test guard reset. Run limits cleared.
```

**Note:** Use reset sparingly and only when you're sure you won't enter an infinite loop.

### Check If Tests Can Run
```bash
./test_guard.sh --check
```

Returns exit code 0 if tests can run, 1 if blocked.

## Configuration

Edit [`test_guard.sh`](test_guard.sh) to adjust limits:

```bash
MAX_RUNS_PER_HOUR=10      # Maximum test runs per hour
COOLDOWN_SECONDS=30        # Minimum seconds between runs
```

## For AI Agents

If you're an AI agent working on these exercises:

1. **Don't run tests repeatedly** - If tests fail, analyze the output carefully before trying again
2. **Check the guard status** - Use `./test_guard.sh --stats` to see remaining runs
3. **Respect the limits** - If you hit the limit, stop and reassess your approach
4. **Consider the cooldown** - Wait at least 30 seconds between test runs
5. **Plan before executing** - Think through your changes before running tests

## Troubleshooting

### "Test cooldown active"
Wait the specified number of seconds before running tests again.

### "Maximum test runs exceeded"
You've hit the hourly limit. Either:
- Wait for the time window to reset
- Use `./test_guard.sh --reset` if you're confident you won't loop

### Guard not working
Check that:
- The script is executable: `chmod +x test_guard.sh`
- The `/tmp` directory is writable
- You're running from the correct directory

## Implementation Details

- **Lockfile location**: `/tmp/roo_evals_test_guard.lock`
- **Data format**: `timestamp:run_count`
- **Parent script bypass**: When the main `run_tests.sh` calls language-specific runners, the guard only runs once by using the `ROO_EVALS_PARENT_GUARD` environment variable

## Related Issues

- Linear Issue: ROO-10 - Fix root cause of Elliott's issue with the $30+ Gemini task
