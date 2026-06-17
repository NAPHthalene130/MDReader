## Context

The project has a working shared core module (`src/core/`), an Electron Windows app (`src/windows/`), and an Android app (`src/android/`). CI/CD workflows exist but no local build scripts. The user needs a unified build process that outputs `.exe` and `.apk` into `.build/` for manual testing.

## Goals / Non-Goals

**Goals:**
- Single command to build all artifacts into `.build/`
- Core module builds first, then Windows and Android in parallel or sequentially
- `.build/` is gitignored
- Produces a runnable Electron `.exe` via electron-builder
- Produces a debug `.apk` via Gradle

**Non-Goals:**
- Code signing the executables
- Publishing to app stores
- Cross-compiling Android from Windows (Android build requires JDK + Android SDK setup)
- Automatic version bumping (use existing version from package.json)

## Decisions

### 1. Root-level npm scripts as build orchestrator

**Decision**: Add build scripts to the root `package.json` that chain the core build before platform builds. Use platform-conditional logic for Android (only build if JDK + Android SDK are available).

**Rationale**: npm is already the toolchain for core and Windows. Root scripts provide a single entry point without introducing additional build tools (Make, shell scripts, etc.).

**Alternatives considered**:
- PowerShell batch scripts: more Windows-specific, less portable for Android CI
- Makefile: requires MSYS2/Cygwin on Windows, adds unnecessary dependency

### 2. Build output structure

```
.build/
  windows/
    MDReader Setup x.x.x.exe    (NSIS installer)
  android/
    app-debug.apk                (debug APK)
```

**Rationale**: Separate subdirectories keep artifacts organized by platform.

### 3. Electron build via electron-builder

**Decision**: Use `electron-builder --win --publish=never` (already configured in `src/windows/package.json`). Direct the output to `.build/windows/`.

**Rationale**: electron-builder is already a devDependency and configured. No additional setup needed.

### 4. Android build via Gradle

**Decision**: Run `./gradlew assembleDebug` from `src/android/` and copy the resulting APK to `.build/android/`.

**Rationale**: `assembleDebug` produces an unsigned debug APK suitable for local testing without requiring signing keys.

### 5. `.build/` in .gitignore

**Decision**: Add `.build/` as a new entry in the root `.gitignore`. Modify the project-init spec to include it.

## Risks / Trade-offs

- **[Risk] Android build fails on machines without JDK 17 or Android SDK** → Mitigation: Build script checks for prerequisites and prints a clear error message if missing.
- **[Risk] electron-builder may fail on first run due to missing wine/nsis dependencies** → Mitigation: electron-builder handles this; document prerequisites in README.
- **[Trade-off] No incremental builds for Android via npm** → Acceptable for a project of this size; Gradle's own incremental compilation handles this.
