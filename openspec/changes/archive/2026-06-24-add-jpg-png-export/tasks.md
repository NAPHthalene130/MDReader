## 1. Preload: add image export IPC bridge

- [x] 1.1 Add `exportImage: (baseName, format, html) => ipcRenderer.invoke('export:image', baseName, format, html)` to the `contextBridge` exposure in `src/windows/src/preload.js`

## 2. Main process: offscreen image capture handler

- [x] 2.1 Add `ipcMain.handle('export:image', async (_event, baseName, format, html) => {...})` in `src/windows/src/main.js` that validates `format` is 'jpg' or 'png' and `html` is a non-empty string
- [x] 2.2 Show a save dialog with the appropriate filter and default filename (`<baseName>.jpg` or `<baseName>.png`); return `{ success: false, canceled: true }` if canceled
- [x] 2.3 Create an offscreen `BrowserWindow({ width: 1000, height: 800, show: false })`, load the HTML via `loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))`
- [x] 2.4 On `did-finish-load`, await stylesheet/font readiness via `executeJavaScript`, then measure `document.documentElement.scrollHeight` and resize the window content to `(1000, scrollHeight)`
- [x] 2.5 Wait briefly for re-layout, call `webContents.capturePage()` to get a `NativeImage`, convert via `toJPEG(90)` (JPG) or `toPNG()` (PNG)
- [x] 2.6 Write the buffer to the chosen path; on error clean up partial file; always destroy the offscreen window via try/finally; return `{ success: true, path }` or `{ success: false, error }`

## 3. Renderer: enable menu items and add export logic

- [x] 3.1 In `showExportMenu()` in `src/windows/renderer/viewer.js`, remove the `disabled` class and "敬请期待" tags from the JPG and PNG menu items
- [x] 3.2 Wire the JPG and PNG menu item clicks to call `exportToImage('jpg')` and `exportToImage('png')` respectively
- [x] 3.3 Add `buildStandaloneHtml()` that serializes `#v-doc-body` innerHTML + all `<style>` and `<link rel="stylesheet">` from `<head>` into a standalone HTML document with `body { background: #fff; padding: 24px; }`
- [x] 3.4 Add `exportToImage(format)` that calls `buildStandaloneHtml()`, shows the busy status toast ("正在生成 JPG/PNG…"), calls `window.electronAPI.exportImage(baseName, format, html)`, and handles success/cancel/error with the status toast (reusing the existing `showExportStatus`/`closeExportStatus` pattern)

## 4. Verification

- [x] 4.1 Run `node --check` on `src/windows/src/main.js`, `src/windows/src/preload.js`, and `src/windows/renderer/viewer.js` and confirm no syntax errors
- [x] 4.2 Run `npm run build:windows` and confirm the app builds without errors
- [ ] 4.3 Launch the app, open a Markdown file, click Export, and confirm JPG and PNG are now enabled (no "敬请期待" tag)
- [ ] 4.4 Export to JPG and confirm the saved image contains the full document with backgrounds, code highlighting, blockquote, Mermaid SVG, and LaTeX, with no clipping
- [ ] 4.5 Export to PNG and confirm the saved image contains the full document with the same fidelity as JPG
- [ ] 4.6 Confirm canceling the save dialog writes no file and shows no error, and that a capture failure shows an error message with no partial file
