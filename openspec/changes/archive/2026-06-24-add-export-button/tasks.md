## 1. Main process & preload: PDF export IPC backend

- [x] 1.1 Add `exportPdf: (baseName) => ipcRenderer.invoke('export:pdf', baseName)` to the `contextBridge` exposure in `src/windows/src/preload.js`
- [x] 1.2 Add `ipcMain.handle('export:pdf', async (_event, baseName) => {...})` in `src/windows/src/main.js` that shows a save dialog (title "导出为 PDF", PDF filter, default filename `<baseName>.pdf`)
- [x] 1.3 In the handler, return early with `{ success: false, canceled: true }` when the save dialog is canceled (write no file)
- [x] 1.4 Generate the PDF via `mainWindow.webContents.printToPDF({ printBackground: true, pageSize: 'A4', marginsType: 0 })` and write the buffer to the chosen path with `fs.promises.writeFile`
- [x] 1.5 Return `{ success: true, path }` on success or `{ success: false, error }` on failure; ensure no partial file remains on error

## 2. Renderer: print-only stylesheet

- [x] 2.1 Add `@media print` rules to the style block in `src/windows/renderer/viewer.js` that hide `.v-toc` and `.v-toolbar` (`display: none !important`)
- [x] 2.2 In the same print block, flatten `.v-layout`, `.v-main`, `.v-content`, and `.v-doc` to block flow with `overflow: visible` and `height: auto`, keeping `.v-doc-body` visible

## 3. Renderer: Export button and format menu

- [x] 3.1 Add an "导出" button (`id="v-export"`, class `v-btn`) to the toolbar markup in `renderViewer`, placed immediately to the left of the `#v-toc-toggle` button
- [x] 3.2 Add CSS for the format-selection dropdown (`.v-export-menu` and items) reusing the `.v-btn` styling conventions and the `#0366d6` accent
- [x] 3.3 Implement `showExportMenu(anchorEl)` that renders a dropdown with three items: PDF (enabled), JPG and PNG (disabled, labeled "敬请期待")
- [x] 3.4 Wire the `#v-export` click to open the menu; close the menu on outside click or on any item selection; remove the menu element on viewer re-render/navigation
- [x] 3.5 Implement the PDF item handler: derive `baseName` from the current `fileName` (strip `.md/.markdown/.mdown/.mkd`), call `window.electronAPI.exportPdf(baseName)`, and show user feedback for success or error
- [x] 3.6 Gate the Export button on render completion: disable it until `renderMermaid` has settled (matching `currentRenderToken`), re-enable once done

## 4. Verification

- [x] 4.1 Run `npm run build:windows` and confirm the Windows app builds without errors
- [ ] 4.2 Run `npm run dev:windows`, open a Markdown file with code blocks, a blockquote, a Mermaid diagram, and a LaTeX formula, and confirm the Export button appears immediately left of the 目录 button
- [ ] 4.3 Click Export and confirm the menu lists PDF (enabled) and JPG/PNG (disabled, "敬请期待"); confirm outside click closes it
- [ ] 4.4 Export to PDF and confirm the saved file contains only the document body with backgrounds, code highlighting, blockquote, Mermaid SVG, and LaTeX preserved, and no toolbar/TOC
- [ ] 4.5 Confirm canceling the save dialog writes no file and shows no error, and that a forced failure shows an error message with no partial file
