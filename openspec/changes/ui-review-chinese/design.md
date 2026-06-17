## Context

The app has working Electron (Windows) and Android Kotlin apps with basic file manager and markdown viewer functionality. The UI is functional but uses minimal English-only styling. The file import → view → TOC navigation flow needs auditing for edge cases.

## Goals / Non-Goals

**Goals:**
- Audit and fix file import/render/TOC flow on both platforms
- Modern card-based UI with consistent color palette
- Full Chinese localization (buttons, labels, errors, empty states)

**Non-Goals:**
- Adding new features (editing, export, themes)
- Changing app architecture
- iOS/macOS support

## Decisions

### 1. Design System

Primary color: `#0366d6` (blue), background: `#f0f2f5`, cards: white with `border-radius: 12px`, shadows: `0 2px 8px rgba(0,0,0,0.08)`. Font: system-ui with Chinese fallback (`PingFang SC, Microsoft YaHei`).

### 2. Chinese Font Stack

`"PingFang SC", "Microsoft YaHei", "Noto Sans SC", -apple-system, sans-serif` — covers macOS, Windows, Android.

### 3. Localization Approach

Hard-coded Chinese strings directly in source (no i18n framework) since this is a Chinese-only app. Android uses `strings.xml` for resource strings.

## Risks / Trade-offs

- [Risk] Chinese text may overflow in fixed-width labels → Use `text-overflow: ellipsis` and `max-width`
- [Risk] Hard-coded Chinese harder to maintain if multilingual support needed later → Acceptable for v1 Chinese-only scope
