# ci-cd

## Purpose

GitHub Actions workflow that builds and releases `.exe` (Windows) and `.apk` (Android) artifacts on push to the repository. The shared core module builds first, platform builds depend on it, and artifacts are versioned.

## Requirements

### Requirement: Push to main branch triggers automated build
The CI/CD pipeline SHALL trigger automatically when commits are pushed to the `main` branch.

#### Scenario: Push triggers build
- **WHEN** a developer pushes a commit to the `main` branch
- **THEN** the GitHub Actions workflow starts automatically and runs both Windows and Android build jobs

### Requirement: Windows build produces a release artifact
The CI/CD pipeline SHALL build the Windows Electron application and produce a `.exe` installer as a workflow artifact.

#### Scenario: Successful Windows build
- **WHEN** the Windows build job completes successfully
- **THEN** a `.exe` installer file is produced and uploaded as a workflow artifact accessible from the GitHub Actions run page

### Requirement: Android build produces a release artifact
The CI/CD pipeline SHALL build the Android application and produce a `.apk` file as a workflow artifact.

#### Scenario: Successful Android build
- **WHEN** the Android build job completes successfully
- **THEN** a `.apk` file is produced and uploaded as a workflow artifact accessible from the GitHub Actions run page

### Requirement: Build failures are reported
The CI/CD pipeline SHALL report build failures with clear error messages in the workflow logs and notify via GitHub commit status.

#### Scenario: Build fails due to compilation error
- **WHEN** a push introduces a compilation error in the Windows or Android build
- **THEN** the workflow fails, the commit status shows a red X, and the build logs contain the specific error details

### Requirement: Shared core module is built before platform targets
The CI/CD pipeline SHALL build the shared core module first, and platform builds SHALL depend on the core build succeeding.

#### Scenario: Core build failure blocks platform builds
- **WHEN** the shared core module fails to build
- **THEN** both Windows and Android platform build jobs are skipped

### Requirement: Release artifacts are versioned
The CI/CD pipeline SHALL include a version identifier in the produced artifact filenames (e.g., `md-reader-1.0.0.exe`, `md-reader-1.0.0.apk`).

#### Scenario: Versioned artifact filenames
- **WHEN** the build completes and the project version is `1.0.0`
- **THEN** the produced artifacts are named `md-reader-1.0.0.exe` and `md-reader-1.0.0.apk`

### Requirement: Local build is available as an alternative to CI/CD
The project SHALL provide a local build mechanism that mirrors the CI/CD pipeline, allowing developers to produce artifacts without pushing to the repository.

#### Scenario: Local build produces same artifacts as CI/CD
- **WHEN** a developer runs the local build command
- **THEN** the resulting `.exe` and `.apk` files are functionally identical to those produced by the CI/CD pipeline (same code, same dependencies, same packaging)
