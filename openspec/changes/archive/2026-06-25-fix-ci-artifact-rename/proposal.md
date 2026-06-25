## Why

The CI/CD release job fails at the artifact rename step with exit code 1. The bash script iterates over glob patterns (`artifacts/*.exe`, `artifacts/*.apk`, `artifacts/*.app`) but does not handle edge cases where matching files/directories are missing, causing the script to fail under `bash -e` (exit-on-error) mode. This blocks automated releases on push to main.

## What Changes

- Update the `Rename artifacts with version` step in `.github/workflows/build.yml` to use `shopt -s nullglob` so that loops do not iterate with literal glob strings when no files match
- Restructure the rename script to explicitly check for file existence and handle missing artifacts gracefully
- Add `|| true` guards where appropriate to prevent `set -e` from halting on expected empty-glob conditions

## Capabilities

### New Capabilities
<!-- No new capabilities introduced -->

### Modified Capabilities
- `ci-cd`: The release artifact renaming step behavior changes to be tolerant of missing artifacts instead of failing the workflow

## Impact

- **Affected file**: `.github/workflows/build.yml` (lines 193–204, the `Rename artifacts with version` step)
- No code, API, or dependency changes
- No breaking changes — existing successful workflows continue to work identically
