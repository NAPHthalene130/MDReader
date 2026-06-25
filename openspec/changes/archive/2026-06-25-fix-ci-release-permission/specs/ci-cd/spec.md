## ADDED Requirements

### Requirement: Workflow has write permission for release creation
The CI/CD workflow SHALL declare `permissions: contents: write` so that the `GITHUB_TOKEN` is authorized to create GitHub Releases.

#### Scenario: Release creation succeeds with write permission
- **WHEN** the release job executes on push to main
- **THEN** the `GITHUB_TOKEN` has sufficient permissions to create a GitHub Release and upload artifacts

#### Scenario: Missing permissions causes clear failure
- **WHEN** the workflow runs without `contents: write` permission
- **THEN** the release step fails with an HTTP 403 error indicating insufficient permissions

### Requirement: Release action uses a supported Node runtime
The CI/CD workflow SHALL use `softprops/action-gh-release@v2` or later to avoid deprecated Node 20 runtime warnings and ensure compatibility with GitHub Actions runner updates.

#### Scenario: No Node deprecation warnings during release
- **WHEN** the release job executes
- **THEN** no deprecation warnings related to Node 20 or `url.parse()` are emitted by the release action
