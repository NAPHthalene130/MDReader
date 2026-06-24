## 1. Fix Android: re-encode gradlew to ASCII with LF

- [x] 1.1 Read the current `src/android/gradlew` file as UTF-16 LE, decode to text, and re-write it as ASCII with LF line endings (no BOM, no CRLF)
- [x] 1.2 Set the git file mode to executable: `git update-index --chmod=+x src/android/gradlew`
- [x] 1.3 Verify the re-encoded file: confirm first bytes are `23 21 2F 62 69 6E 2F 73 68` (`#!/bin/sh`) with no BOM, and no `0x0D` (CR) bytes in the file
- [x] 1.4 Verify git mode: `git ls-files --stage src/android/gradlew` shows `100755`

## 2. Fix Android: add .gitattributes to prevent regression

- [x] 2.1 Create `.gitattributes` at the repo root with: `*.sh text eol=lf`, `gradlew text eol=lf`, `*.bat text eol=crlf`

## 3. Fix iOS: create project.pbxproj

- [x] 3.1 Create `src/ios/MDReader.xcodeproj/project.pbxproj` with a complete Xcode project definition that includes:
  - PBXProject object with `MDReader` target (product type `com.apple.product-type.application`, iOS)
  - PBXFileReference entries for: `MDReaderApp.swift`, `FileStore.swift`, `ContentView.swift`, `MarkdownWebView.swift`, `Info.plist`, `core-bundle.js`
  - PBXBuildFile entries linking source files to the Sources build phase and resource files to the Resources build phase
  - PBXSourcesBuildPhase, PBXFrameworksBuildPhase, PBXResourcesBuildPhase
  - XCBuildConfiguration entries for Debug and Release (IPHONEOS_DEPLOYMENT_TARGET=16.0, SWIFT_VERSION=5.0, PRODUCT_BUNDLE_IDENTIFIER=com.mdreader.app, INFOPLIST_FILE=MDReader/Resources/Info.plist)
  - XCConfigurationList for project and target
  - PBXNativeTarget `MDReader`
  - Product reference `MDReader.app`

## 4. Verification

- [x] 4.1 Run `git diff --stat` to confirm only the expected files changed (gradlew, .gitattributes, project.pbxproj)
- [x] 4.2 Confirm `src/android/gradlew` has no UTF-16 BOM and no CR bytes (ASCII with LF)
- [x] 4.3 Confirm `git ls-files --stage src/android/gradlew` shows mode `100755`
- [x] 4.4 Confirm `.gitattributes` exists at repo root with the correct rules
- [x] 4.5 Confirm `src/ios/MDReader.xcodeproj/project.pbxproj` exists and is valid XML/plist format
- [x] 4.6 Confirm the project.pbxproj references all 4 Swift source files, Info.plist, and core-bundle.js
