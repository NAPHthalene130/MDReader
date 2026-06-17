## Why

Reading Markdown files with rich content (LaTeX formulas, Mermaid diagrams, syntax-highlighted code blocks) currently requires separate, often web-based tools. There is no unified, offline-capable Markdown reader that works seamlessly across Windows desktop and Android mobile platforms. This project fills that gap by providing a fast, native cross-platform Markdown reader with file management, content indexing, and full rendering of extended Markdown features.

## What Changes

- **New cross-platform application**: A Markdown reader targeting Windows (desktop) and Android (mobile), with platform-specific code organized under `src/windows` and `src/android`.
- **Shared core library**: Common Markdown parsing and rendering logic shared between both platforms.
- **File manager homepage**: A "recently read" file list with add/remove capabilities, acting as the main entry point.
- **Markdown rendering engine**: Parse and render standard Markdown, LaTeX math formulas (inline and block), Mermaid diagrams (from fenced code blocks with `mermaid` language tag), and syntax-highlighted code blocks.
- **Content index sidebar**: A navigable table of contents that allows jumping to specific sections/headings within a document.
- **CI/CD pipeline**: Automated build and release workflow on push — producing `.exe` for Windows and `.apk` for Android.
- **Project scaffolding**: `.gitignore`, editor config, and other project initialization files.

## Capabilities

### New Capabilities

- `project-init`: Project initialization with `.gitignore`, editor config, CI/CD workflow configuration, and build toolchain setup for both Windows and Android targets.
- `file-manager`: Main page file manager with recently-read file tracking, add new file, and remove entry from history.
- `markdown-parser`: Parse Markdown files including standard syntax, LaTeX formulas (inline `$...$` and block `$$...$$`), Mermaid diagrams in fenced code blocks (` ```mermaid`), and syntax-highlighted code blocks for common programming languages.
- `markdown-renderer`: Render parsed Markdown into platform-native views on Windows and Android, including rendered LaTeX formulas, Mermaid diagrams as vector graphics, and highlighted code blocks.
- `content-index`: Table of contents sidebar generated from document headings, with click-to-scroll navigation to corresponding sections.
- `ci-cd`: GitHub Actions workflow that builds and releases `.exe` (Windows) and `.apk` (Android) artifacts on push to the repository.

### Modified Capabilities

<!-- No existing capabilities to modify -->

## Impact

- **Codebase**: New project — `src/windows/`, `src/android/`, `src/core/` (shared logic), `.github/workflows/` for CI/CD.
- **Dependencies**: Markdown parsing library (e.g., markdown-it or similar), LaTeX rendering (e.g., KaTeX), Mermaid.js for diagram rendering, syntax highlighting library (e.g., Prism or highlight.js).
- **Build tooling**: Windows — .NET or Electron-based; Android — Kotlin/Java with WebView or Compose. CI/CD via GitHub Actions.
- **No breaking changes** — this is a greenfield project.
