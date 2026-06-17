## ADDED Requirements

### Requirement: Project repository is initialized with standard configuration files
The project SHALL include `.gitignore`, `.editorconfig`, and basic project metadata files at the repository root.

#### Scenario: Git ignores appropriate files
- **WHEN** the repository is initialized
- **THEN** a `.gitignore` file exists that excludes `node_modules/`, build outputs (`dist/`, `build/`, `out/`), platform-specific IDE files (`.idea/`, `.vs/`, `*.suo`), OS files (`.DS_Store`, `Thumbs.db`), and environment files (`.env*`)

#### Scenario: Editor configuration is consistent
- **WHEN** any developer opens the project in an editor
- **THEN** an `.editorconfig` file exists that enforces UTF-8 encoding, LF line endings, 2-space indentation for JSON/YAML/Markdown, and 4-space indentation for Kotlin/Java/TypeScript

### Requirement: Build toolchain is configured for Windows target
The Windows target SHALL have a configured build toolchain using Electron with all dependencies declared.

#### Scenario: Windows project is buildable
- **WHEN** a developer runs `npm install && npm run build` in `src/windows/`
- **THEN** the Electron application is compiled successfully and produces a runnable executable

### Requirement: Build toolchain is configured for Android target
The Android target SHALL have a configured build toolchain using Kotlin/Gradle with all dependencies declared.

#### Scenario: Android project is buildable
- **WHEN** a developer runs `./gradlew assembleDebug` in `src/android/`
- **THEN** the Android APK is compiled successfully

### Requirement: Shared core module is set up with dependencies
The shared core module at `src/core/` SHALL be a TypeScript project with markdown-it, KaTeX, Mermaid.js, and Prism.js as declared dependencies.

#### Scenario: Core module builds successfully
- **WHEN** a developer runs `npm install && npm run build` in `src/core/`
- **THEN** the TypeScript code compiles to a single JavaScript bundle without errors
