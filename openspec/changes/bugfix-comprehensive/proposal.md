## Why

Comprehensive code review revealed 50+ bugs across Windows, Android, and CI/CD. Critical issues prevent the app from building (Android), functioning in production (core library export), and compromise security (iframe sandbox). All bugs must be fixed before release.

## What Changes

- Fix webpack UMD export so `MDReaderCore` is accessible to consumers
- Fix Mermaid rendering (never loaded in generated HTML)
- Fix Android build-breaking Gradle config typo
- Fix Android ClassCastException (TextView vs ScrollView)
- Fix Android fragment duplication on rotation
- Fix Android core-bundle.js never loaded
- Fix iframe sandbox security (remove allow-same-origin)
- Fix file-store not reordering on re-open
- Fix CI/CD artifact paths and release logic
- Fix .gitignore (commit gradle wrapper, ignore .build/)
- Fix all other identified bugs at medium+ severity

## Capabilities

### Modified Capabilities
- `project-init`: Update .gitignore
- `markdown-parser`: Fix export structure, remove dead code
- `markdown-renderer`: Fix Mermaid loading, add missing exports
- `file-manager`: Fix reorder, error handling
- `content-index`: Fix type safety
- `ci-cd`: Fix artifact paths, release job

## Impact
All `src/` directories, CI/CD workflow, .gitignore
