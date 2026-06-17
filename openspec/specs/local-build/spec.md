# local-build

## Purpose

Local build scripts that compile the shared core, then package Windows and Android artifacts into the `.build/` directory, producing verified `.exe` and `.apk` files ready for testing. The build fails gracefully on missing prerequisites.

## Requirements

### Requirement: Local build produces Windows executable
The build system SHALL produce a runnable Windows `.exe` in `.build/windows/` when the build command is executed.

#### Scenario: Windows build succeeds
- **WHEN** a developer runs the local build command on a machine with Node.js 18+
- **THEN** a `.exe` file is created in `.build/windows/` that can be executed to run the MDReader application

### Requirement: Local build produces Android APK
The build system SHALL produce a debug `.apk` file in `.build/android/` when the build command is executed on a machine with JDK 17+ and Android SDK.

#### Scenario: Android build succeeds
- **WHEN** a developer runs the local build command on a machine with JDK 17+ and Android SDK configured
- **THEN** a debug `.apk` file is created in `.build/android/` that can be installed on an Android device

### Requirement: Core module builds before platform targets
The local build SHALL build the shared core module before building Windows and Android targets.

#### Scenario: Core build succeeds before platform builds
- **WHEN** the local build command is executed
- **THEN** the core module compiles first, and Windows/Android builds proceed only after core succeeds

### Requirement: Build output is excluded from version control
The `.build/` directory SHALL be excluded from version control via `.gitignore`.

#### Scenario: Build artifacts are not tracked by git
- **WHEN** the build completes and produces files in `.build/`
- **THEN** running `git status` does not show any untracked files under `.build/`

### Requirement: Build fails gracefully on missing prerequisites
The build system SHALL report a clear message when required prerequisites are not available.

#### Scenario: Android build skipped when JDK is missing
- **WHEN** the local build command is executed on a machine without JDK 17+
- **THEN** the Android build is skipped with a message indicating JDK is required, and the Windows build still proceeds if possible
