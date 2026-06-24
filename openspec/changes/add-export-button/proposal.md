## Why

The Windows viewer displays rendered Markdown on screen but offers no way to save or share that rendered output. Users who want to archive, print, or hand off a nicely-rendered version of a document must resort to screenshots or external tools. Adding an in-app export capability lets users produce a portable PDF directly from the browsing interface, with a clear path to add JPG/PNG later.

## What Changes

- Add an "导出" (Export) button to the Windows viewer toolbar, positioned immediately to the **left** of the existing "目录" (Table of Contents) toggle button.
- Clicking the button opens a format-selection menu listing PDF, JPG, and PNG.
- **Implement PDF export now**: render the currently-open document to a `.pdf` file using Electron's `webContents.printToPDF`, preserving backgrounds (code blocks, blockquotes, syntax highlighting) and offering a save dialog for the destination path.
- Add print-specific CSS so the exported PDF contains only the document body — no toolbar, TOC sidebar, or back button.
- JPG and PNG options appear in the menu but are marked as not-yet-available and are deferred to a future change.

## Capabilities

### New Capabilities
- `document-export`: Export the rendered Markdown document to portable file formats (PDF now; JPG/PNG later) from the Windows viewer toolbar.

### Modified Capabilities
<!-- None. Export reuses already-rendered output and does not change any existing capability's requirements. -->

## Impact

- **`src/windows/renderer/viewer.js`**: new toolbar button, format-selection menu UI, export trigger logic, and `@media print` stylesheet rules.
- **`src/windows/src/main.js`**: new IPC handler that generates the PDF via `webContents.printToPDF` and writes it to a user-chosen path through a save dialog.
- **`src/windows/src/preload.js`**: new `electronAPI` method exposed to the renderer to invoke export.
- **No core package changes** — export is Windows-only and operates on the already-rendered DOM.
- **No new third-party dependencies** — uses Electron's built-in PDF generation.
