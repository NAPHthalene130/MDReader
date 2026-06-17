## 1. Core CSS Modernization

- [x] 1.1 Update `src/core/src/renderer/index.ts` CSS with modern typography, Chinese font stack, better spacing

## 2. Windows UI Redesign

- [x] 2.1 Redesign `file-manager.js` with card-based layout, Chinese text, modern styling
- [x] 2.2 Redesign `viewer.js` toolbar and TOC sidebar with Chinese labels, modern styling
- [x] 2.3 Update `index.html` base styles

## 3. Android UI Redesign

- [x] 3.1 Update `strings.xml` with Chinese text
- [x] 3.2 Redesign layouts with Material Design 3 styling
- [x] 3.3 Update `viewer-template.html` with Chinese-friendly fonts
- [x] 3.4 Review FileListFragment and ViewerFragment logic for file import → view flow

## 4. Logic Audit

- [x] 4.1 Verify file import flow on Windows (dialog → add → list → click → view → TOC → back)
- [x] 4.2 Verify file import flow on Android (SAF → add → list → click → view → TOC → back)
- [x] 4.3 Fix any renderer issues (missing Mermaid rendering, KaTeX not applied, code highlighting)
