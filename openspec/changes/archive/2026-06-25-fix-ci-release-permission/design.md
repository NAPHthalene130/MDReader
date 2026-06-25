## Context

The `release` job in `build.yml` uses `softprops/action-gh-release@v1` to create a GitHub Release. Two issues prevent successful releases:

1. **No `permissions` declaration**: GitHub Actions workflows default to read-only `GITHUB_TOKEN`. Creating releases requires `contents: write` permission. Without it, the action receives HTTP 403 from the GitHub API.

2. **Deprecated v1 action**: `softprops/action-gh-release@v1` runs on Node 20, which GitHub Actions is deprecating. The v2 release uses Node 24 and is actively maintained.

## Goals / Non-Goals

**Goals:**
- Grant the workflow sufficient permissions to create GitHub Releases
- Eliminate Node 20 deprecation warnings by upgrading to v2
- Maintain all existing release behavior (tag naming, body content, artifact uploads)

**Non-Goals:**
- Changing the release trigger conditions (still push to main)
- Modifying artifact naming or upload logic
- Adding draft/pre-release toggles or new release features

## Decisions

### Decision 1: Declare `permissions: contents: write` at the top workflow level

**Rationale**: Placing permissions at the top workflow level applies to all jobs, making the permission intent clear and centralized. This is the recommended GitHub Actions practice — grant only what's needed, at the narrowest scope needed. Since only `release` needs `contents: write`, an alternative would be per-job permissions, but workflow-level is simpler and the other jobs have no conflicting needs.

**Alternatives considered**:
- *Per-job permissions on `release` only*: More precise but adds YAML boilerplate to one job. No practical benefit since other jobs already run with read-only defaults.
- *`permissions: write-all`*: Too broad. Violates principle of least privilege.

### Decision 2: Upgrade to `softprops/action-gh-release@v2`

**Rationale**: v2 uses Node 24 (the current default runtime), eliminating deprecation warnings. The parameter interface is backward-compatible for the options we use (`tag_name`, `name`, `body`, `files`, `draft`, `prerelease`, `env.GITHUB_TOKEN`), so the migration is a one-line version change.

**Alternatives considered**:
- *Use `gh release create` CLI*: More control but adds complexity (needs `gh` CLI setup). Not necessary for our simple use case.
- *Stay on v1 with `ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true`*: Only delays the problem. v1 will eventually be blocked entirely.

## Risks / Trade-offs

- [Risk] `softprops/action-gh-release@v2` may have subtle parameter changes in future → **Mitigation**: Pin to `@v2` (major version), which follows semver — compatible updates within v2
- [Risk] `contents: write` grants more permission than strictly needed → **Mitigation**: Scope is limited to this repository only; `GITHUB_TOKEN` is ephemeral and expires after workflow completion
