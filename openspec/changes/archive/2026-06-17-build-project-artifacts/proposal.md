## Why

The project currently has CI/CD workflows defined for automated builds, but there is no way to produce local, testable `.exe` and `.apk` artifacts for manual verification. Developers need a simple local build process that outputs working executables to a unified `.build/` directory for immediate testing.

## What Changes

- Add `.build/` to `.gitignore` to exclude local build outputs from version control
- Create build scripts that produce a working `.exe` (Electron) and `.apk` (Android) into `.build/`
- Wire up the shared core module build as a prerequisite for both platform builds
- Ensure the Electron Windows app produces a runnable `.exe` via electron-builder
- Ensure the Android project can produce a debug `.apk` via Gradle

## Capabilities

### New Capabilities

- `local-build`: Local build scripts that compile the shared core, then package Windows and Android artifacts into `.build/` directory, producing verified `.exe` and `.apk` files ready for testing.

### Modified Capabilities

- `project-init`: Add `.build/` to `.gitignore` entries to prevent local build artifacts from being committed.
- `ci-cd`: Align the CI/CD build output paths with the local `.build/` convention (optional, for consistency).

## Impact

- **Codebase**: Root-level build scripts (npm scripts / batch files), updated `.gitignore`
- **Dependencies**: Electron + electron-builder (already declared in `src/windows/`), Android Gradle toolchain (already declared in `src/android/`)
- **No breaking changes** — only additive build scripting
