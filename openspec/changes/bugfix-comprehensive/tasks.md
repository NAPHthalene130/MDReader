## 1. Core Module Fixes
- [x] 1.1 Fix webpack config: remove `export: 'default'` so library exports work
- [x] 1.2 Fix renderer: add Mermaid.js CDN script tag to generated HTML
- [x] 1.3 Fix barrel exports in `src/core/src/index.ts` (renderBodyOnly, getTokenStream)
- [x] 1.4 Remove dead code: unused imports, renderDiagram, options var, mermaid import
- [x] 1.5 Fix TOC O(n^2) iteration and type safety
- [x] 1.6 Remove conflicting @types/markdown-it (v14 ships own types)

## 2. Windows App Fixes
- [x] 2.1 Fix file-store: reorder files on re-open (splice + unshift)
- [x] 2.2 Fix file-store: case-insensitive path comparison, input validation
- [x] 2.3 Fix iframe sandbox: remove allow-same-origin (security)
- [x] 2.4 Fix viewer: file size limit check, null path guard, scoped querySelector
- [x] 2.5 Fix file-manager: error handling on IPC calls, null guard on querySelector

## 3. Android App Fixes
- [x] 3.1 Fix settings.gradle.kts: dependencyResolution → dependencyResolutionManagement
- [x] 3.2 Fix ViewerFragment: tocContent type mismatch (ScrollView not TextView)
- [x] 3.3 Fix viewer-template: add script src for core-bundle.js, fix baseUrl
- [x] 3.4 Fix MainActivity: guard fragment creation in savedInstanceState==null
- [x] 3.5 Fix AndroidManifest: add INTERNET permission
- [x] 3.6 Fix WebView: allowFileAccess=false, onDestroy cleanup
- [x] 3.7 Fix FileListFragment: bindingAdapterPosition guard, SAF persistent URI
- [x] 3.8 Fix package.json: correct gradlew path
- [x] 3.9 Fix FileRepository: UTC timezone, sync write, input validation

## 4. CI/CD Fixes
- [x] 4.1 Fix artifact path: .build/windows/*.exe (not src/windows/dist/)
- [x] 4.2 Fix release rename: handle multiple .exe files
- [x] 4.3 Fix version extraction: use build-core output

## 5. Gitignore
- [x] 5.1 Add missing entries, un-ignore gradle/wrapper (needed for Android build)
