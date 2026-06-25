## Context

The Windows viewer's export menu already lists PDF, JPG, and PNG. PDF is implemented via `mainWindow.webContents.printToPDF()` in the main process. JPG and PNG are marked "敬请期待" (disabled, no action). The viewer's `.v-doc-body` element contains the fully-rendered document: inline Mermaid SVGs, KaTeX-rendered math, syntax-highlighted code. The app uses `contextIsolation: true` with all privileged operations (file I/O, dialogs) in the main process via IPC through `preload.js`.

Electron has no built-in "printToImage" equivalent. The challenge for image export is capturing the **full document** (not just the visible viewport) at the document's natural size, including all rendered content.

## Goals / Non-Goals

**Goals:**
- Implement working JPG and PNG export from the export menu.
- Capture the full document content (all sections, not just the visible viewport) including backgrounds, Mermaid SVGs, KaTeX, and code highlighting.
- Use only Electron built-in APIs — no new dependencies.
- Follow the existing IPC + save-dialog + error-cleanup pattern established by PDF export.

**Non-Goals:**
- User-configurable image dimensions, DPI, or quality settings (sensible defaults only).
- Multi-page tiled images for very long documents (single tall image).
- Exporting on Android or iOS.
- Changing the PDF export implementation.

## Decisions

### Decision 1: Use an offscreen BrowserWindow for image capture
Create a hidden `BrowserWindow({ show: false })`, load a standalone HTML document built from the already-rendered DOM, size the window to the content's natural dimensions, call `webContents.capturePage()` to get a `NativeImage`, then convert to JPEG or PNG and write to disk.

**Rationale:** `capturePage()` on the main window captures only the visible viewport, which would clip the document. An offscreen window sized to the full content height captures everything. Because the renderer serializes the **already-rendered** `.v-doc-body` innerHTML (Mermaid SVGs and KaTeX HTML are inline), no async rendering is needed in the offscreen window — only CSS loading.

**Alternatives considered:**
- `capturePage()` on the main window → captures only the visible viewport. Rejected.
- Temporarily resize the main window to full content height → visually disruptive and fragile. Rejected.
- `html2canvas` or similar library → adds a third-party dependency, and the proposal explicitly avoids new deps. Rejected.
- Use the core package's `renderToHtml()` to produce standalone HTML in the main process → the core is a browser bundle, not usable from Node. Rejected.

### Decision 2: Renderer serializes rendered DOM + CSS into standalone HTML
The renderer builds a standalone HTML string by:
1. Taking `document.getElementById('v-doc-body').innerHTML` — the fully rendered content (Mermaid SVGs, KaTeX HTML, highlighted code all inline).
2. Collecting all `<style>` and `<link rel="stylesheet">` elements from `document.head` — the viewer's injected styles plus KaTeX CSS and highlight.js CSS.
3. Wrapping in `<!DOCTYPE html><html><head>...styles...</head><body style="background:#fff;padding:24px;"><div class="v-doc-body">...content...</div></body></html>`.

The renderer sends this HTML string to the main process via IPC.

**Rationale:** The main process cannot render Markdown (core is a browser bundle). The renderer already has everything rendered. Serializing the live DOM + styles preserves exact visual fidelity. Wrapping in `.v-doc-body` reuses the existing scoped CSS. Adding `background:#fff; padding:24px;` on the body ensures a clean white background (important for JPG, which has no alpha) and breathing room around the content.

### Decision 3: Offscreen window sizing and capture sequence
1. Create `BrowserWindow({ width: 1000, height: 800, show: false, webPreferences: { offscreen: false } })`. Width 1000 accommodates the `.v-doc-body` max-width of 860px plus padding.
2. Load the HTML via `loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))`.
3. On `did-finish-load`, wait for stylesheets and fonts via `executeJavaScript` (await `document.fonts.ready` + short delay for CDN CSS).
4. Measure content height: `executeJavaScript('document.documentElement.scrollHeight')`.
5. Resize the window: `offscreenWin.setContentSize(1000, measuredHeight)`.
6. Wait briefly for re-layout (200ms).
7. `capturePage()` → `NativeImage`.
8. Convert: `image.toJPEG(90)` for JPG, `image.toPNG()` for PNG.
9. Write buffer to the chosen path.
10. `offscreenWin.destroy()`.

**Rationale:** Sizing the window to the content height ensures `capturePage()` captures the entire document in one shot. Waiting for fonts/CSS ensures the styling is applied before capture. `show: false` keeps the offscreen window invisible to the user. The 90% JPEG quality is a good balance of size and fidelity.

### Decision 4: Unified `export:image` IPC handler for both formats
A single `ipcMain.handle('export:image', async (_event, baseName, format, html) => ...)` handles both JPG and PNG. The `format` parameter ('jpg' or 'png') determines the save dialog filter, file extension, and buffer conversion.

**Rationale:** The capture logic is identical for both formats; only the output encoding differs. A single handler avoids code duplication. The renderer passes `format` from the menu selection.

### Decision 5: Reuse the existing export status toast
The renderer's `showExportStatus()`/`closeExportStatus()` functions (already used by PDF export) provide the busy/success/error toast. The new `exportToImage(format)` function uses the same pattern: show "正在生成 JPG/PNG…" busy toast, call IPC, show success or error.

**Rationale:** Consistent UX with PDF export. The toast is already hidden in `@media print` (though print media doesn't apply to image capture, the offscreen window is separate and doesn't include the toast).

## Risks / Trade-offs

- **[CDN stylesheet loading in offscreen window]** → The KaTeX CSS and highlight.js CSS are loaded from CDN. If offline, styling may be incomplete. Mitigation: the wait delay covers the common case; offline export would still produce content but without external CSS styling. Acceptable for a desktop reader that already requires CDN for rendering.
- **[Relative image paths break in data URL]** → Images referenced with relative paths in the Markdown won't load in the offscreen window loaded via data URL (no base URL). Mitigation: most documents use absolute paths or URLs. Note as a known limitation. Future improvement: write HTML to a temp file with the original document's directory as base URL.
- **[Very long documents produce very tall images]** → A 50-page document could produce a 50,000px+ tall image. Most image viewers handle this, but file size could be large. Mitigation: the existing 50 MB file-read cap bounds document size. Acceptable trade-off; noted in spec.
- **[Offscreen window cleanup]** → If capture fails mid-process, the offscreen window must still be destroyed. Mitigation: use try/finally to always destroy the window.
- **[IPC payload size]** → The HTML string could be large for big documents. Electron IPC handles large strings, but extremely large documents may be slow. Mitigation: acceptable for typical use; the 50 MB file cap limits worst case.
