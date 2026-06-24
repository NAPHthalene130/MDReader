## Why

The Windows viewer already supports exporting rendered Markdown to PDF, JPG, and PNG. The Android viewer offers no export capability at all — users who want to save or share rendered documents as PDF or images have no in-app path. Adding export to Android achieves feature parity across platforms and fulfills the cross-platform consistency goal of the renderer spec.

## What Changes

- Add an "导出" (Export) button to the Android viewer's native toolbar, positioned immediately to the left of the existing "目录" (TOC) toggle button.
- Tapping the button shows a format-selection menu (PopupMenu) listing PDF, JPG, and PNG.
- Implement PDF export using Android's `PrintManager` + `WebView.createPrintDocumentAdapter()`, which opens the system print dialog where the user can save to PDF or print. The framework handles multi-page pagination automatically.
- Implement JPG and PNG export by capturing the full WebView content via `WebView.capturePicture()` (full-page capture, not just the visible viewport), drawing to a `Bitmap`, compressing, and saving via the Storage Access Framework (`ACTION_CREATE_DOCUMENT`).
- All three formats capture rendered content including backgrounds, syntax highlighting, Mermaid SVGs, and LaTeX formulas. The WebView contains only document content (toolbar and TOC are native Android views), so no chrome needs to be excluded.
- No new third-party dependencies — uses Android framework APIs only.
- Modify the existing "PDF export is available only on the Windows viewer" requirement to remove the platform restriction.

## Capabilities

### New Capabilities
<!-- None. -->

### Modified Capabilities
- `document-export`: The "PDF export is available only on the Windows viewer" requirement is replaced — export is now available on both Windows and Android. New requirements are added for Android-specific PDF, JPG, and PNG export, including the native toolbar button, format menu, PrintManager-based PDF, capturePicture-based image capture, and SAF-based file saving.

## Impact

- **`src/android/app/src/main/java/com/mdreader/app/ViewerFragment.kt`**: add export button wiring, PopupMenu for format selection, PDF export via PrintManager, image capture + compression + SAF save logic, render-completion check before capture.
- **`src/android/app/src/main/res/layout/fragment_viewer.xml`**: add "导出" button to the toolbar, left of the TOC toggle button.
- **`src/android/app/src/main/res/values/strings.xml`**: add string resources for export button label and format menu items.
- **`src/android/app/src/main/AndroidManifest.xml`**: no `WRITE_EXTERNAL_STORAGE` needed (SAF and PrintManager don't require it); existing `READ_EXTERNAL_STORAGE` and `INTERNET` suffice.
- **`src/android/app/build.gradle.kts`**: no new dependencies — uses Android framework APIs (`android.print`, `android.graphics`, `androidx.activity.result`).
- **No core package or iOS changes** — export operates on the WebView's already-rendered DOM.
