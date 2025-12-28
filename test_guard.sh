#!/usr/bin/env bash

# Test Guard: Prevents infinite test loops by enforcing run limits and cooldowns
# This helps prevent excessive API costs when AI agents get stuck in test loops

# Configuration
MAX_RUNS_PER_HOUR=10
COOLDOWN_SECONDS=30
LOCKFILE="/tmp/roo_evals_test_guard.lock"

# Get current timestamp
current_time=$(date +%s)

# Function to check if we can run tests
can_run_tests() {
  # If lockfile doesn't exist, create it and allow the run
  if [ ! -f "$LOCKFILE" ]; then
    echo "$current_time:1" > "$LOCKFILE"
    return 0
  fi

  # Read lockfile
  read -r last_run_time run_count < <(tr ':' ' ' < "$LOCKFILE")
  
  # Calculate time since last run
  time_since_last_run=$((current_time - last_run_time))
  
  # Check cooldown period
  if [ $time_since_last_run -lt $COOLDOWN_SECONDS ]; then
    remaining=$((COOLDOWN_SECONDS - time_since_last_run))
    echo "⚠️  Test cooldown active. Please wait ${remaining}s before running tests again."
    echo "   This prevents infinite test loops and excessive costs."
    return 1
  fi
  
  # Reset count if more than an hour has passed
  if [ $time_since_last_run -ge 3600 ]; then
    echo "$current_time:1" > "$LOCKFILE"
    return 0
  fi
  
  # Check if we've exceeded max runs per hour
  if [ "$run_count" -ge $MAX_RUNS_PER_HOUR ]; then
    time_until_reset=$((3600 - time_since_last_run))
    minutes=$((time_until_reset / 60))
    seconds=$((time_until_reset % 60))
    echo "⚠️  Maximum test runs per hour exceeded ($MAX_RUNS_PER_HOUR)."
    echo "   Please wait ${minutes}m ${seconds}s before running tests again."
    echo "   This prevents infinite test loops and excessive costs."
    return 1
  fi
  
  # Increment run count and update lockfile
  new_count=$((run_count + 1))
  echo "$current_time:$new_count" > "$LOCKFILE"
  return 0
}

# Function to show stats
show_stats() {
  if [ -f "$LOCKFILE" ]; then
    read -r last_run_time run_count < <(tr ':' ' ' < "$LOCKFILE")
    time_since_last_run=$((current_time - last_run_time))
    
    if [ $time_since_last_run -lt 3600 ]; then
      echo "ℹ️  Test runs in the last hour: $run_count / $MAX_RUNS_PER_HOUR"
    fi
  fi
}

# Function to reset the guard (for manual override)
reset_guard() {
  rm -f "$LOCKFILE"
  echo "✅ Test guard reset. Run limits cleared."
}

# Main execution
if [ "$1" == "--reset" ]; then
  reset_guard
  exit 0
elif [ "$1" == "--stats" ]; then
  show_stats
  exit 0
elif [ "$1" == "--check" ]; then
  can_run_tests
  exit $?
else
  # Default: check and show stats
  if can_run_tests; then
    show_stats
    exit 0
  else
    exit 1
  fi
fi
