## Context

The Android viewer (`ViewerFragment.kt`) is a native Kotlin fragment containing a `WebView` that loads `viewer-template.html` + `core-bundle.js` from assets. The template renders Markdown client-side (Mermaid SVGs, KaTeX, highlight.js). The toolbar is **native Android views** (Button/TextView in `fragment_viewer.xml`) — the WebView contains only document content, so there is no app chrome to exclude from exports. The app targets SDK 36 with minSdk 26. The manifest has `READ_EXTERNAL_STORAGE` and `INTERNET` but no `WRITE_EXTERNAL_STORAGE` (deprecated on Android 10+). File saving must use the Storage Access Framework (SAF) or MediaStore, not direct file writes.

The Windows viewer already has working PDF/JPG/PNG export. This change brings the Android viewer to feature parity using Android-native platform APIs.

## Goals / Non-Goals

**Goals:**
- Add an "导出" button to the Android viewer toolbar (left of the TOC toggle).
- Implement PDF, JPG, and PNG export on Android using Android framework APIs only.
- Capture full rendered content (not just the viewport) including Mermaid SVGs and KaTeX.
- No new third-party dependencies.

**Non-Goals:**
- User-configurable image dimensions, DPI, quality, or PDF page size (platform defaults only).
- iOS export (unchanged).
- Modifying the core package or the Windows export implementation.
- Batch/multi-file export.

## Decisions

### Decision 1: PDF export via PrintManager + createPrintDocumentAdapter
Use Android's `PrintManager` with `webView.createPrintDocumentAdapter(jobName)` to open the system print dialog. The user can choose "Save as PDF" or a physical printer. The framework handles multi-page pagination, page sizing, and margins automatically.

**Rationale:** This is the standard Android way to export a WebView to PDF. `createPrintDocumentAdapter()` captures the WebView's fully-rendered content (including Mermaid SVGs and KaTeX, which are in the DOM). The system print dialog provides the destination selection (equivalent to a save dialog). Building a custom `PdfDocument` from WebView content would require manual pagination logic that is fragile and error-prone.

**Alternatives considered:**
- Custom `PdfDocument` + `capturePicture()` → requires manual page splitting, margin calculation, and content flow logic. Fragile. Rejected.
- Third-party PDF library (e.g., iText) → adds a dependency and requires re-rendering content. Rejected (no new deps goal).
- SAF + generate PDF manually → same pagination complexity as above. Rejected.

### Decision 2: Image export (JPG/PNG) via capturePicture + SAF
Use `webView.capturePicture()` to get a full-page `Picture` (captures the entire WebView content, not just the visible viewport). Draw the `Picture` to a `Bitmap` via `Canvas`, compress to JPEG or PNG, and save to a user-chosen URI via the Storage Access Framework (`ActivityResultContracts.CreateDocument`).

**Rationale:** `capturePicture()` is the only Android WebView API that captures the full page content in one operation. Despite being deprecated since API 21, it remains functional on API 26+ (our minSdk) and is still used by production apps for full-page WebView capture. The `Picture` object captures the WebView's display list, which includes rendered Mermaid SVGs and KaTeX HTML. SAF is the modern Android way to let users choose a save location without `WRITE_EXTERNAL_STORAGE`.

**Alternatives considered:**
- `PixelCopy` API → only captures the visible viewport, not the full scrolled content. Rejected for full-document capture.
- `View.draw(Canvas)` after resizing WebView to content height → WebView may not re-render when its layout size changes programmatically; causes visual glitches and unreliable capture. Rejected.
- Inject JS to serialize content, re-render in a hidden WebView, then capture → complex, duplicates rendering, and the hidden WebView has the same capture limitations. Rejected.

### Decision 3: Bitmap dimension caps and white background
When creating the `Bitmap` from `capturePicture()`, cap the maximum dimension at 8000px. If the `Picture`'s width or height exceeds the cap, scale the bitmap proportionally. Always fill the canvas with white (`Color.WHITE`) before drawing the `Picture` — this ensures a clean background for JPEG (which has no alpha channel) and a consistent look for PNG.

**Rationale:** A very long document could produce a `Picture` with height > 20000px. An ARGB_8888 bitmap at 1000×20000 = 80MB, risking OutOfMemoryError on memory-constrained devices. The 8000px cap limits the worst case to ~32MB. Scaling preserves proportional fidelity. The white background is necessary for JPEG (no alpha) and desirable for PNG (document look).

### Decision 4: Render-completion check before capture
Before capturing (for both PDF and images), evaluate JavaScript to check that all Mermaid diagrams have finished rendering: `document.querySelectorAll('.mermaid-placeholder').length`. If placeholders remain, poll with a short delay (up to ~5 seconds) until they are gone or the timeout expires, then proceed with capture.

**Rationale:** Mermaid diagrams render asynchronously. Capturing before they finish would produce placeholder text instead of SVGs. The `viewer-template.html` renders Mermaid on page load, so by the time the user taps export, rendering is usually complete — but the check guarantees correctness.

### Decision 5: Format selection via PopupMenu
When the user taps the "导出" button, show an Android `PopupMenu` anchored to the button, listing PDF, JPG, and PNG. On selection, dismiss the menu and trigger the corresponding export.

**Rationale:** `PopupMenu` is a lightweight, standard Android UI component that matches the existing toolbar's Material Design styling. It's simpler than a `BottomSheetDialog` and appropriate for a 3-item menu.

### Decision 6: File saving via SAF CreateDocument for images
Use `registerForActivityResult(ActivityResultContracts.CreateDocument(mimeType))` to launch the system save dialog. Pass the derived default filename (`<baseName>.jpg` or `<baseName>.png`) as the initial name. On result, open the returned `Uri`'s `OutputStream` and write the compressed bitmap bytes.

**Rationale:** SAF is the modern Android file-saving mechanism that works on Android 10+ (scoped storage) without `WRITE_EXTERNAL_STORAGE`. It gives the user a save-dialog UX consistent with the Windows Electron save dialog. `ActivityResultContracts.CreateDocument` is the Jetpack wrapper that simplifies the SAF intent flow.

## Risks / Trade-offs

- **[capturePicture() deprecation]** → `capturePicture()` has been deprecated since API 21 but remains functional. If a future Android version removes it, image export would break. Mitigation: the render-completion check and dimension caps make the current implementation robust; a future migration to `PixelCopy` + scroll-and-stitch or a headless WebView approach can replace it if needed.
- **[Very large bitmaps / OOM]** → Long documents produce tall bitmaps. Mitigation: 8000px dimension cap with proportional scaling limits memory usage to ~32MB worst case.
- **[PDF save location not programmatic]** → The PrintManager approach gives the user the system print dialog, not a direct file path. The user must select "Save as PDF" and choose a location. This differs from the image SAF flow but is the Android-standard way. Acceptable — it's how all Android apps handle WebView-to-PDF.
- **[CDN stylesheet dependency]** → The WebView loads KaTeX/highlight.js CSS from CDN. If offline, export may lack styling. This is a pre-existing limitation of the viewer itself, not specific to export.
- **[capturePicture() may not capture re-rendered content]** → If the WebView hasn't fully painted after Mermaid rendering, the capture may be incomplete. Mitigation: render-completion check (Decision 4) + the picture is drawn from the display list which reflects the latest DOM state.
