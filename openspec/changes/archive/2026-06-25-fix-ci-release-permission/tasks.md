## 1. Fix Permissions

- [x] 1.1 Add `permissions: contents: write` at the top workflow level in `.github/workflows/build.yml`

## 2. Upgrade Release Action

- [x] 2.1 Change `softprops/action-gh-release@v1` to `softprops/action-gh-release@v2` in `.github/workflows/build.yml` line 215

## 3. Verify

- [x] 3.1 Review the updated workflow YAML for syntax correctness
- [x] 3.2 Confirm the v2 action parameter interface is compatible with existing `with` block
