## 1. Fix Rename Script

- [x] 1.1 Add `shopt -s nullglob` at the top of the rename script in `.github/workflows/build.yml` (line 194) to prevent loops from iterating with unexpanded glob patterns
- [x] 1.2 Restructure each `for` loop body to use `if [ -f "$f" ]; then ... fi` instead of `[ -f "$f" ] && ...` for clarity and `set -e` safety
- [x] 1.3 Update the `.app` loop to use `if [ -d "$f" ]; then ... fi` block for the zip-and-remove operation

## 2. Verify

- [x] 2.1 Review the updated workflow YAML for syntax correctness
- [x] 2.2 Verify the script handles all three edge cases: missing `.exe`, missing `.apk`, missing `.app`
- [x] 2.3 Confirm existing successful workflow behavior is unchanged (all artifacts present case)
