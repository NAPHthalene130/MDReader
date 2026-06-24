## 1. Fix: hide export UI elements in print CSS

- [x] 1.1 In `src/windows/renderer/viewer.js`, add `.v-export-status, .v-export-menu` to the `@media print` hide rule (currently only `.v-toc, .v-toolbar` are hidden at ~line 87)

## 2. Fix: Mermaid rendering failure

- [x] 2.1 In `src/windows/renderer/viewer.js`, add a `let mermaidInitialized = false;` module-level flag near the other state variables (~line 7)
- [x] 2.2 In `renderMermaid()`, wrap the `mermaid.initialize(...)` call in `if (!mermaidInitialized) { ... mermaidInitialized = true; }` so initialization runs only once
- [x] 2.3 Change the `securityLevel` in that `initialize()` call from `'strict'` to `'loose'`

## 3. Verification

- [x] 3.1 Run `node --check src/windows/renderer/viewer.js` and confirm no syntax errors
- [x] 3.2 Run `npm run build:windows` and confirm the app builds without errors
- [ ] 3.3 Launch the app, open a Markdown file containing a Mermaid diagram, and confirm the diagram renders as an SVG (not "Syntax error in text")
- [ ] 3.4 Export to PDF and confirm the PDF contains the rendered Mermaid SVG and does NOT contain the "正在生成 PDF" toast or any error text
