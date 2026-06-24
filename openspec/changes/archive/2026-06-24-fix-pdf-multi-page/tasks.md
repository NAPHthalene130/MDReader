## 1. Fix: reset ancestor containers in print CSS

- [x] 1.1 In `src/windows/renderer/viewer.js`, add `body { height: auto !important; overflow: visible !important; }` to the `@media print` block
- [x] 1.2 Add `#app { height: auto !important; display: block !important; }` to the same `@media print` block
- [x] 1.3 Add `.page { display: block !important; overflow: visible !important; height: auto !important; }` to the same `@media print` block

## 2. Verification

- [x] 2.1 Run `node --check src/windows/renderer/viewer.js` and confirm no syntax errors
- [x] 2.2 Run `npm run build:windows` and confirm the app builds without errors
- [ ] 2.3 Launch the app, open a Markdown document longer than one screen, export to PDF, and confirm the PDF has content on every page with no blank pages and no clipped content
