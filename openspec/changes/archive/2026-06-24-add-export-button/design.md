## Context

MDReader's Windows client is an Electron app (`src/windows`) with `contextIsolation: true` and `nodeIntegration: false`. The renderer (`src/windows/renderer/viewer.js`) renders parsed Markdown into the live DOM, including asynchronously rendered Mermaid SVGs and KaTeX formulas. The viewer toolbar (`viewer.js:180-184`) currently contains a back button, a filename span (`flex: 1`), and a "☰ 目录" TOC toggle button (`#v-toc-toggle`).

All privileged operations (file reads, dialogs) go through IPC: `main.js` registers `ipcMain.handle` channels and `preload.js` exposes them on `window.electronAPI` via `contextBridge`. There is no export capability today, and the shared core package is not involved in rendering-to-file.

PDF export must capture the rich, already-rendered DOM (code highlighting backgrounds, blockquote tints, Mermaid SVGs, KaTeX) faithfully and produce clean pages without the app chrome.

## Goals / Non-Goals

**Goals:**
- Add an "导出" button to the viewer toolbar immediately left of the "目录" toggle button.
- Provide a format-selection menu (PDF, JPG, PNG).
- Ship a working PDF export that saves to a user-chosen path and contains only the document body with backgrounds and rendered diagrams/formulas preserved.
- Add no new third-party dependencies and touch no platform other than Windows.

**Non-Goals:**
- Implementing JPG or PNG export (reserved in the UI for a future change).
- Export on Android or iOS.
- User-configurable page size, margins, or orientation in this iteration (sensible defaults only).
- Batch/multi-file export.

## Decisions

### Decision 1: Generate PDF with Electron's `webContents.printToPDF`
Use the built-in `mainWindow.webContents.printToPDF(...)` in the main process rather than `window.print()`, a headless offscreen `BrowserWindow`, or a third-party library (pdfkit/jsPDF/puppeteer).

**Rationale:** `printToPDF` is built into Electron, requires no dependency, and captures the live, fully-rendered DOM — including client-side Mermaid SVGs and KaTeX that would otherwise need to be re-rendered. It returns a `Buffer` the main process can write to disk directly.

**Alternatives considered:**
- `window.print()` → opens the OS print dialog and forces the user to manually choose "Save as PDF"; less control over output and defaults. Rejected.
- Offscreen `BrowserWindow` with standalone HTML → cleanest separation from app chrome, but requires rebuilding the document HTML and re-loading KaTeX/highlight CSS plus re-running async Mermaid/KaTeX rendering. Too much duplication for this iteration. Rejected (revisit if fidelity issues arise).
- jsPDF/pdfkit → cannot reproduce the rich HTML/CSS layout without manual element-by-element layout. Rejected.

### Decision 2: Use `@media print` CSS to isolate the document body
Inject print-only rules in `viewer.js` that hide `.v-toc` and `.v-toolbar`, flatten `.v-layout`/`.v-main`/`.v-content`/`.v-doc` to block flow with `overflow: visible` and `height: auto`, and leave `.v-doc-body` visible. Chromium applies these during `printToPDF`, so the live window produces clean pages without a second window.

**Rationale:** Reuses the already-rendered content and loaded assets with the least code.

**Trade-off:** The print rules also apply if `window.print()` is ever used later — acceptable and consistent.

### Decision 3: Pass `printBackground: true`
Set `printToPDF({ printBackground: true, pageSize: 'A4', marginsType: 0 })` (default margins) so background colors — dark code blocks, blockquote tints, table headers — are preserved. Without `printBackground`, Chromium strips backgrounds and the export loses its visual fidelity.

### Decision 4: IPC contract owned by the main process
- `preload.js`: `exportPdf: (baseName) => ipcRenderer.invoke('export:pdf', baseName)`.
- `main.js`: new `ipcMain.handle('export:pdf', ...)` that (a) shows a save dialog filtered to PDF with a default filename of `<baseName>.pdf`, (b) returns early if canceled, (c) calls `mainWindow.webContents.printToPDF(...)`, (d) writes the buffer to the chosen path, (e) returns `{ success: true, path }` or `{ success: false, error }`.

**Rationale:** The renderer cannot touch the filesystem or `webContents.printToPDF` (no `nodeIntegration`, no `remote`), so the main process must own dialog + file I/O + PDF generation. The renderer passes the current document's base name so the save dialog defaults to a sensible filename.

### Decision 5: Custom dropdown menu anchored to the Export button
Render a small absolutely-positioned menu with three items: PDF (enabled), JPG and PNG (disabled, labeled "敬请期待"). Append it to the viewer container, close it on outside click or on selection, and remove it on viewer re-render/navigation.

**Rationale:** A native `<select>` cannot easily show disabled "coming soon" options with custom styling. A custom dropdown matches the existing `.v-btn` styling and the app's `#0366d6` accent palette.

### Decision 6: Export only acts on fully-rendered content
The viewer tracks `currentRenderToken` and awaits `renderMermaid` during `renderViewer`. The export handler SHALL verify the render is settled (matching token, Mermaid/KaTeX complete) before triggering export; if a render is in flight, disable the Export button until it finishes.

**Rationale:** Prevents exporting a document whose Mermaid diagrams are still placeholders.

## Risks / Trade-offs

- **[printToPDF captures the whole window]** → Mitigated by `@media print` rules that hide chrome. Risk: future fixed-position overlays would leak into the PDF; mitigate by keeping an explicit print-hide list.
- **[Async rendering not finished at export time]** → Mitigated by gating the Export button on render completion (Decision 6).
- **[Very large documents block during PDF generation]** → The existing 50 MB file-read cap bounds document size; acceptable for now. Future: add a progress indicator.
- **[printBackground increases PDF file size]** → Accepted for visual fidelity.
- **[CJK font availability]** → Relies on system-installed PingFang/YaHei fonts (present on Windows). On systems lacking CJK fonts, characters may not render. Note for future: bundle a CJK font if cross-OS fidelity is required.
- **[Save-dialog overwrite]** → Electron's save dialog confirms overwrites by default; acceptable.
