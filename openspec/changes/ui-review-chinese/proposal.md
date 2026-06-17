## Why

The current UI is functional but lacks polish — English-only text, minimal styling, and the file import/view workflow has not been validated end-to-end. This change audits the app logic, modernizes the visual design, and localizes all interface text to Chinese for native users.

## What Changes

- Audit Windows and Android app logic for file import → markdown rendering → TOC navigation flow
- Fix any logical gaps preventing basic markdown reading (file picker, rendering, TOC)
- Redesign UI with modern aesthetics: rounded cards, shadows, consistent color palette, better spacing
- Translate all UI strings to Chinese: buttons, labels, empty states, error messages
- Update Android string resources and layout for Chinese locale

## Capabilities

### New Capabilities

- `ui-modernization`: Redesigned visual theme across both platforms with card-based file list, modern typography, consistent color scheme (#0366d6 primary), rounded corners, shadows, and improved spacing.

### Modified Capabilities

- `file-manager`: Update UI text to Chinese, improve empty state messaging, enhance file entry card design.
- `markdown-renderer`: Update embedded CSS for modern typography and Chinese-friendly font stack.
- `content-index`: Update TOC sidebar styling and toggle button to match new design language.

## Impact

- **Codebase**: `src/windows/renderer/*.js`, `src/windows/renderer/index.html`, `src/android/app/src/main/res/**`, `src/android/app/src/main/java/**`, `src/android/app/src/main/assets/`, `src/core/src/renderer/index.ts`
- **No breaking changes** — cosmetic and localization only
