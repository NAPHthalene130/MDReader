## Context

This is a greenfield cross-platform Markdown reader targeting Windows (desktop) and Android (mobile). There is no existing codebase. The project must parse and render Markdown with extended features (LaTeX, Mermaid diagrams, syntax-highlighted code blocks) and provide a file manager homepage with recently-read tracking. No editing capabilities are required — this is a read-only viewer.

## Goals / Non-Goals

**Goals:**
- Single shared Markdown rendering engine used by both Windows and Android platforms
- Native-feeling UI on each platform (Windows desktop window, Android mobile app)
- File manager homepage with recently-read file list, add file, and remove entry
- Parse and render: standard Markdown, LaTeX math (inline and block), Mermaid diagrams from fenced code blocks, syntax-highlighted code blocks
- Content index sidebar with heading-based navigation
- CI/CD pipeline: automated `.exe` and `.apk` builds on push

**Non-Goals:**
- Markdown editing (read-only viewer)
- iOS/macOS/Linux support (Windows and Android only)
- Cloud sync or online accounts
- PDF export or any file format conversion
- Plugin/extension system

## Decisions

### 1. Architecture: Electron (Windows) + Android WebView (Android) with Shared JS Renderer

**Decision**: Use Electron for the Windows desktop app and a Kotlin WebView-based app for Android. Both platforms share an identical TypeScript/JavaScript rendering engine that handles Markdown parsing, LaTeX rendering, Mermaid diagram generation, and syntax highlighting.

**Alternatives considered**:
- **Flutter/Dart**: Would require a custom Markdown renderer in Dart, lacking mature LaTeX and Mermaid rendering libraries. Rejected due to ecosystem maturity for the required features.
- **.NET MAUI / WPF with WebView2**: Possible for Windows but adds unnecessary complexity for Android. The WebView approach on both platforms keeps the renderer consistent.
- **React Native**: Good cross-platform option but adds complexity for a read-only viewer and may have issues with large Mermaid diagrams in WebView.

**Rationale**: The web ecosystem has the most mature libraries for Markdown (markdown-it), LaTeX (KaTeX), Mermaid (mermaid.js), and syntax highlighting (Prism/highlight.js). By using a shared JS renderer injected into a WebView on both platforms, we get identical rendering with minimal platform-specific code.

### 2. Shared Core Module Structure

**Decision**: Place the shared rendering engine at `src/core/` as a standalone TypeScript project compiled to a single JS bundle. Both Windows (Electron) and Android (WebView) projects reference this bundle.

```
src/
  core/          # Shared TypeScript rendering engine
    parser/      # Markdown parsing (markdown-it + plugins)
    renderer/    # HTML output with KaTeX, Mermaid, Prism
    indexer/     # TOC extraction from AST
  windows/       # Electron app (loads core bundle in BrowserWindow)
  android/       # Kotlin app (loads core bundle in WebView)
```

### 3. Markdown Parsing Pipeline

**Decision**: Use markdown-it with plugins for extensibility. Pipeline:
1. markdown-it parses raw MD → token stream
2. Custom plugin detects `mermaid` fenced code blocks → renders via mermaid.js → replaces code block with rendered SVG
3. Custom plugin detects math delimiters (`$...$`, `$$...$$`) → renders via KaTeX → replaces with rendered HTML
4. Code blocks with other language tags → Prism.js syntax highlighting → replaces with highlighted HTML
5. Final HTML output injected into platform WebView

**Rationale**: markdown-it's plugin architecture allows clean separation of concerns. Each extended feature (mermaid, LaTeX, code highlighting) is a separate plugin, making the parser modular and testable.

### 4. File Manager Data Model

**Decision**: Store recently-read files as a JSON array persisted to platform-specific local storage (Electron: `electron-store`/local file; Android: SharedPreferences/DataStore). Each entry contains: file path, display name, last opened timestamp, file size.

No database needed — the file list is simple enough for JSON.

### 5. Content Index (TOC)

**Decision**: Extract headings during the markdown-it parsing phase by walking the token tree. Each heading token yields: level (h1-h6), text, and an anchor ID. The TOC is rendered as a sidebar with indentation based on heading level. Clicking a heading scrolls the WebView to the corresponding anchor.

### 6. CI/CD Pipeline

**Decision**: Use GitHub Actions with two separate workflows:
- **Windows build**: `windows-latest` runner, builds Electron app with electron-builder, produces `.exe` as release artifact
- **Android build**: `ubuntu-latest` runner with JDK 17 + Android SDK, builds APK via Gradle, produces `.apk` as release artifact

Both trigger on push to `main` branch. Release artifacts are attached to the workflow run and optionally published as GitHub Releases.

## Risks / Trade-offs

- **[Risk] Mermaid rendering performance on large diagrams** → Mitigation: Limit diagram node count; render Mermaid in a separate async task with loading indicator.
- **[Risk] KaTeX font loading on Android WebView** → Mitigation: Bundle KaTeX CSS and font files locally in the Android assets; no CDN dependency.
- **[Risk] File system access differs between platforms** → Mitigation: Electron's `dialog.showOpenDialog` for Windows; Android's Storage Access Framework (SAF) or `ACTION_OPEN_DOCUMENT` intent for Android.
- **[Risk] WebView inconsistency between Electron (Chromium) and Android WebView** → Mitigation: Pin Electron to a known Chromium version; test on minimum Android API level 26 (Android 8.0).
- **[Trade-off] WebView approach vs. native rendering** → WebView approach trades some native look-and-feel for development speed and rendering consistency. Acceptable for a read-only viewer.
