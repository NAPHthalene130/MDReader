## Context

The CI/CD release job uses a bash script with `set -e` (via `bash -e`) to rename downloaded artifacts before creating a GitHub Release. The script iterates over glob patterns to find `.exe`, `.apk`, and `.app` artifacts. When no files match a glob, bash without `nullglob` iterates once with the literal pattern string (e.g., `artifacts/*.exe`). While `[ -f "$f" ]` and `[ -d "$f" ]` guards prevent incorrect commands from running, the script can still fail under `set -e` if certain commands produce unexpected exit codes.

## Goals / Non-Goals

**Goals:**
- Make the artifact rename step tolerant of missing platform artifacts
- Prevent the release workflow from failing when one or more platform builds produce no artifact

**Non-Goals:**
- Changing the artifact naming convention
- Modifying platform build jobs or upload steps
- Adding new platform targets

## Decisions

### Decision 1: Use `shopt -s nullglob` before loops

**Rationale**: With `nullglob` enabled, a glob that matches nothing expands to zero arguments, causing the `for` loop to skip entirely instead of iterating with the literal glob pattern. This eliminates the need for `[ -f "$f" ]` / `[ -d "$f" ]` guards and prevents any edge cases with `set -e`.

**Alternatives considered**:
- *Keep guards only*: The existing `[ -f "$f" ]` checks already prevent incorrect commands. However, if bash's `-e` flag interacts unexpectedly with the compound `[ ... ] && cmd` expression (e.g., in older bash versions), the script could still fail. `nullglob` is the standard solution and eliminates this class of issue entirely.
- *Use `find` instead of glob*: More explicit but adds complexity and an external command dependency. Glob with `nullglob` is simpler and idiomatic in bash.

### Decision 2: Use `if` blocks instead of `&&` chains

**Rationale**: Replacing `[ -f "$f" ] && mv ...` with `if [ -f "$f" ]; then mv ...; fi` makes the intent clearer and avoids edge cases with `set -e` where a failed test inside `&&` could propagate the exit code in unexpected ways.

**Alternatives considered**:
- *`|| true` at end of each command*: Works but is less readable and avoids the real issue.
- *Remove `bash -e`*: Would prevent the script from failing but also suppresses legitimate errors.

## Risks / Trade-offs

- **Risk**: The fixed script might silently skip renaming if an artifact is present but in an unexpected location → **Mitigation**: The artifact download paths are deterministic; glob patterns cover the expected location
- **Risk**: Removing `[ -d "$f" ]` check after using `nullglob` removes validation → **Mitigation**: Keep the check inside an `if` block as a belt-and-suspenders measure
