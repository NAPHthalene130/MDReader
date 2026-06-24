## Why

The export menu already lists JPG and PNG options but marks them as "敬请期待" (coming soon) and performs no export when selected. Users who want to share rendered Markdown as an image — for embedding in documents, chat apps, or presentations — have no in-app path. Implementing these two formats completes the export feature promised by the menu.

## What Changes

- Implement JPG export: capture the rendered document body as a JPEG image and save to a user-chosen path.
- Implement PNG export: capture the rendered document body as a PNG image and save to a user-chosen path.
- Remove the "敬请期待" labels and disabled state from the JPG and PNG menu items so they are selectable and trigger export.
- Both image formats capture the full document (not just the visible viewport) including backgrounds, syntax highlighting, Mermaid SVGs, and LaTeX formulas, using an offscreen Electron window to render the already-rendered DOM at the document's natural size.
- No new third-party dependencies — uses Electron's built-in `webContents.capturePage()` and `NativeImage.toJPEG()`/`toPNG()`.

## Capabilities

### New Capabilities
<!-- None. -->

### Modified Capabilities
- `document-export`: The "JPG and PNG export options are reserved for future implementation" requirement is replaced — the options are now implemented and functional. New requirements are added for JPG export and PNG export, including full-document capture, save dialog, cancel handling, and error handling.

## Impact

- **`src/windows/renderer/viewer.js`**: enable JPG/PNG menu items, add `buildStandaloneHtml()` to serialize the rendered `.v-doc-body` + page CSS, add `exportToImage(format)` to drive the export, wire menu items to the new handler.
- **`src/windows/src/preload.js`**: add `exportImage(baseName, format, html)` IPC bridge.
- **`src/windows/src/main.js`**: add `export:image` IPC handler that creates an offscreen `BrowserWindow`, loads the serialized HTML, sizes it to the content, captures via `capturePage()`, converts to JPEG/PNG, and writes the file.
- **No core package or Android/iOS changes** — image export is Windows-only like PDF.
