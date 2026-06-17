## 1. Project Initialization

- [x] 1.1 Create `.gitignore` with entries for `node_modules/`, `dist/`, `build/`, `out/`, `.idea/`, `.vs/`, `*.suo`, `.DS_Store`, `Thumbs.db`, `.env*`, `*.apk`, `*.exe`
- [x] 1.2 Create `.editorconfig` with UTF-8, LF line endings, 2-space indent for JSON/YAML/MD, 4-space for Kotlin/Java/TS
- [x] 1.3 Create root `README.md` with project overview and setup instructions
- [x] 1.4 Create `package.json` in project root for workspace-level scripts (if using npm workspaces)

## 2. Shared Core Module (src/core)

- [x] 2.1 Initialize `src/core/` as a TypeScript project with `tsconfig.json` targeting ES2020 and bundling to a single JS file
- [x] 2.2 Add dependencies: `markdown-it`, `katex`, `mermaid`, `prismjs` (or `highlight.js`), and `@types/markdown-it`
- [x] 2.3 Implement `src/core/src/parser/index.ts` — main parse function that takes raw Markdown string and returns token stream using markdown-it with GFM enabled
- [x] 2.4 Implement `src/core/src/parser/mermaid-plugin.ts` — markdown-it plugin that detects ` ```mermaid` fenced code blocks and replaces them with rendered Mermaid SVG
- [x] 2.5 Implement `src/core/src/parser/latex-plugin.ts` — markdown-it plugin that detects `$...$` (inline) and `$$...$$` (block) LaTeX delimiters and replaces with KaTeX-rendered HTML
- [x] 2.6 Implement `src/core/src/parser/highlight-plugin.ts` — markdown-it plugin that applies highlight.js syntax highlighting to fenced code blocks with language identifiers (excluding `mermaid`)
- [x] 2.7 Implement `src/core/src/renderer/index.ts` — function that takes markdown string and produces final HTML with embedded CSS for KaTeX, highlight.js themes, and base typography
- [x] 2.8 Implement `src/core/src/indexer/toc.ts` — function that walks token tree to extract headings with level, text, and anchor ID, returning a TOC data structure
- [x] 2.9 Add `npm run build` script to compile TypeScript to `dist/core-bundle.js`
- [x] 2.10 Add unit tests for parser (standard MD, LaTeX, Mermaid, code highlighting, edge cases) using vitest
- [x] 2.11 Add unit tests for TOC extraction (flat headings, nested, empty document)

## 3. Windows Application (src/windows)

- [x] 3.1 Initialize `src/windows/` as an Electron project with `package.json`, `main.js` (Electron main process), and `preload.js`
- [x] 3.2 Configure electron-builder in `package.json` for producing `.exe` installer on Windows
- [x] 3.3 Create `src/windows/src/main.js` — Electron main process: create BrowserWindow, load renderer HTML, register IPC handlers for file dialog and storage
- [x] 3.4 Create `src/windows/src/preload.js` — expose safe IPC bridge (`openFileDialog`, `readFile`, `getFileList`, `saveFileList`) to renderer via contextBridge
- [x] 3.5 Create `src/windows/src/file-store.js` — JSON file-based persistence for recently-read file list (read/write to local app data directory)
- [x] 3.6 Create `src/windows/renderer/index.html` — main HTML shell that loads core bundle and app UI scripts
- [x] 3.7 Create `src/windows/renderer/file-manager.js` — file manager page: recently-read file list with add/remove buttons, empty state, click-to-open
- [x] 3.8 Create `src/windows/renderer/app.js` — app shell navigation between file-manager and viewer pages
- [x] 3.9 Create `src/windows/renderer/viewer.js` — Markdown viewer page: renders core bundle output, TOC sidebar, toggle button, scroll-to-heading, back navigation
- [x] 3.10 Create `src/windows/renderer/viewer.js` — viewer logic: load Markdown file via IPC, call core parse+render, inject HTML into view, generate and render TOC, scroll-to-heading on TOC click, highlight current heading on scroll
- [x] 3.11 Add navigation between file-manager and viewer pages (SPA-style via page switching)
- [x] 3.12 Add `npm run build` and `npm run dev` scripts for the Electron app

## 4. Android Application (src/android)

- [x] 4.1 Initialize `src/android/` as a Kotlin Android project with Gradle (minSdk 26, targetSdk 34, Kotlin 1.9+)
- [x] 4.2 Configure `build.gradle` with AndroidX, WebView, and Material Design dependencies
- [x] 4.3 Create viewer template with core bundle support in `src/android/app/src/main/assets/viewer-template.html`
- [x] 4.4 Create `MainActivity.kt` — single activity with bottom navigation or two fragments: FileList and Viewer
- [x] 4.5 Create `FileListFragment.kt` — RecyclerView displaying recently-read files, FAB for add (launches SAF `ACTION_OPEN_DOCUMENT`), swipe-to-delete for remove
- [x] 4.6 Create `FileRepository.kt` — SharedPreferences/DataStore-based persistence for recently-read file list (read/write JSON)
- [x] 4.7 Create `ViewerFragment.kt` — WebView that loads core rendering HTML, receives Markdown content, handles TOC interaction via JavaScript bridge
- [x] 4.8 Create `assets/viewer-template.html` — HTML template for Android WebView that includes core bundle script and calls parse+render with injected Markdown content
- [x] 4.9 Implement JavaScript bridge (`@JavascriptInterface`) for TOC navigation: Android receives heading-click events from WebView and scrolls accordingly
- [x] 4.10 Implement TOC drawer — side drawer (DrawerLayout) populated from heading data sent via JS bridge
- [x] 4.11 Add file reading utility that resolves content URI from SAF, reads file content, and passes to WebView
- [ ] 4.12 Test full flow on Android emulator/device: launch → add file via SAF → open → view rendered content → TOC drawer → back to file list

## 5. CI/CD Pipeline (.github/workflows)

- [x] 5.1 Create `.github/workflows/build.yml` — main workflow triggered on push to `main`
- [x] 5.2 Add `build-core` job: checkout, setup Node, `npm ci` in `src/core/`, `npm run build`, upload core bundle as artifact
- [x] 5.3 Add `build-windows` job (needs `build-core`): runs on `windows-latest`, downloads core artifact, `npm ci` in `src/windows/`, runs electron-builder, uploads `.exe` as artifact
- [x] 5.4 Add `build-android` job (needs `build-core`): runs on `ubuntu-latest`, downloads core artifact, sets up JDK 17 and Android SDK, runs `./gradlew assembleRelease` in `src/android/`, uploads `.apk` as artifact
- [x] 5.5 Add version extraction from `package.json`, include version in artifact filenames (`MDReader-v1.0.0.exe`, `MDReader-v1.0.0.apk`)
- [ ] 5.6 Test CI/CD by pushing to a test branch and verifying both `.exe` and `.apk` artifacts are produced

## 6. Polish and Finalization

- [x] 6.1 Apply consistent visual theme/styling across both platforms (colors, typography, spacing)
- [x] 6.2 Add loading indicators for file parsing and rendering
- [x] 6.3 Add error handling: file not found, unsupported file type, parse errors with user-friendly messages
- [ ] 6.4 Verify cross-platform rendering consistency — same test Markdown file produces visually identical output on Windows and Android
- [x] 6.5 Write user-facing documentation: how to install, add files, navigate, and use TOC
