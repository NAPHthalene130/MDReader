## Why

The CI/CD pipeline fails on two jobs: Android build fails with `./gradlew: cannot execute binary file: Exec format error`, and iOS build fails with `Unable to read project 'MDReader.xcodeproj' ... missing its project.pbxproj file`. Both failures prevent any automated release from being produced.

## What Changes

- **Android fix**: The `gradlew` shell script is committed to git in UTF-16 LE encoding with a BOM (`FF FE`). The Linux kernel cannot parse a UTF-16 shebang line, causing "Exec format error" even after `chmod +x`. Re-encode `gradlew` to ASCII with LF line endings. Additionally, the git file mode is `100644` (non-executable); set it to `100755`. Add a `.gitattributes` file to enforce LF line endings and prevent encoding regression.
- **iOS fix**: The `src/ios/MDReader.xcodeproj/project.pbxproj` file is completely missing from the repository. Create a valid `project.pbxproj` that references all existing Swift source files (`MDReaderApp.swift`, `FileStore.swift`, `ContentView.swift`, `MarkdownWebView.swift`), the `Info.plist`, and the `core-bundle.js` resource, with the `MDReader` scheme and iOS simulator build target.

## Capabilities

### New Capabilities
<!-- None. -->

### Modified Capabilities
<!-- None. This is a pure CI/CD infrastructure fix — no spec'd capability behavior changes. -->

## Impact

- **`src/android/gradlew`**: re-encode from UTF-16 LE to ASCII with LF line endings; set git file mode to `100755`.
- **`.gitattributes`** (new, repo root): enforce `text eol=lf` for shell scripts and `gradlew` specifically; enforce `binary` for `.bat` files.
- **`src/ios/MDReader.xcodeproj/project.pbxproj`** (new): complete Xcode project definition with all source file references, build phases, build configurations, and the `MDReader` scheme.
- **No source code, spec, or feature changes** — purely build/infrastructure.
