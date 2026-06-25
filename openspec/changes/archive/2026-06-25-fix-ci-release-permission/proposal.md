## Why

The CI/CD release job fails with HTTP 403 when `softprops/action-gh-release@v1` attempts to create a GitHub Release. The workflow does not declare `permissions: contents: write`, and by default the `GITHUB_TOKEN` has read-only permissions. Additionally, the action uses the deprecated v1 version (Node 20 runtime). Both issues block automated releases on push to main.

## What Changes

- Add `permissions: contents: write` to the workflow to grant the `GITHUB_TOKEN` release creation permission
- Upgrade `softprops/action-gh-release` from v1 to v2 to resolve Node 20 deprecation warnings and ensure future compatibility

## Capabilities

### New Capabilities
<!-- No new capabilities introduced -->

### Modified Capabilities
- `ci-cd`: The release job now requires `contents: write` permission, and the release action is upgraded to v2

## Impact

- **Affected file**: `.github/workflows/build.yml` (workflow-level permissions + line 215 action version)
- No code, API, or dependency changes
- No breaking changes — the v2 action has a compatible interface for the parameters used
