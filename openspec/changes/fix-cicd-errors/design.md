## Context

The MDReader CI/CD pipeline (`.github/workflows/build.yml`) runs on every push/PR to `main`. Two of the four platform build jobs fail:

1. **Android (`build-android` job, `ubuntu-latest`)**: The workflow runs `chmod +x gradlew` then `./gradlew assembleRelease`. The shell returns `Exec format error` (ENOEXEC). Investigation of the git blob reveals the `gradlew` file is encoded in **UTF-16 LE with a BOM** (`FF FE` at byte 0). The Linux kernel's `execve` cannot parse a UTF-16 shebang — it expects ASCII/UTF-8. Additionally, the git file mode is `100644` (non-executable); even with `chmod +x` on the checked-out file, the kernel rejects the content format.

2. **iOS (`build-ios` job, `macos-latest`)**: The workflow runs `xcodebuild -project MDReader.xcodeproj -scheme MDReader ...`. The project directory `src/ios/MDReader.xcodeproj/` exists but contains only `project.xcworkspace/` and `xcuserdata/` — the `project.pbxproj` file is completely missing (never committed). Xcode cannot open a project without this file.

The iOS source files are all present and tracked: `MDReaderApp.swift`, `FileStore.swift`, `ContentView.swift`, `MarkdownWebView.swift`, `Info.plist`. The `core-bundle.js` is downloaded as an artifact in CI to `src/ios/MDReader/Resources/`.

## Goals / Non-Goals

**Goals:**
- Make the Android CI build succeed by fixing the `gradlew` encoding and git file mode.
- Make the iOS CI build succeed by creating a valid `project.pbxproj`.
- Prevent the `gradlew` encoding issue from recurring via `.gitattributes`.

**Non-Goals:**
- Changing any application source code or features.
- Modifying the CI workflow logic (the existing `chmod +x` and `xcodebuild` commands are correct once the files are fixed).
- Adding new build steps or dependencies.

## Decisions

### Decision 1: Re-encode `gradlew` to ASCII with LF line endings
Read the current `gradlew` file content (UTF-16 LE), decode it, and re-write it as plain ASCII with LF line endings. Then `git add` the file so the blob is stored correctly.

**Rationale:** The Gradle wrapper script is a standard ASCII shell script. The UTF-16 LE encoding is an artifact of a Windows editor that saved the file in the wrong encoding. Re-encoding to ASCII fixes the shebang parsing on Linux.

**Alternatives considered:**
- Add a CI step `sed -i 's/\r$//' gradlew` or `dos2unix gradlew` → would fix CRLF but NOT UTF-16 encoding. The BOM and null bytes would remain. Rejected as insufficient.
- Add a CI step `iconv -f UTF-16LE -t UTF-8 gradlew -o gradlew && chmod +x gradlew` → would work but adds CI complexity and doesn't fix the repo itself. Rejected in favor of fixing the source.
- Replace `gradlew` with a fresh copy from `gradle wrapper` → would work but changes the Gradle version potentially. Rejected to keep the current version.

### Decision 2: Set git file mode to `100755` for `gradlew`
Use `git update-index --chmod=+x src/android/gradlew` to set the executable bit in the git index, so the file is checked out with execute permission on all platforms.

**Rationale:** Even with correct encoding, if the git mode is `100644`, the file won't have execute permission on checkout. The CI's `chmod +x` is a workaround, but setting the correct git mode is the proper fix and removes the need for the workaround (though we keep it as a safety net).

### Decision 3: Add `.gitattributes` to enforce LF for shell scripts
Create a `.gitattributes` file at the repo root with rules that enforce LF line endings for `*.sh` and `gradlew` files, and mark `*.bat` as binary (CRLF preserved):

```
*.sh text eol=lf
gradlew text eol=lf
*.bat text eol=crlf
```

**Rationale:** Prevents future CRLF/encoding regressions when contributors on Windows commit shell scripts. The `eol=lf` directive forces git to store and checkout the file with LF regardless of `core.autocrlf` settings. The `*.bat` rule preserves CRLF for Windows batch files.

**Alternatives considered:**
- Set `core.autocrlf = input` globally → affects all files, not just shell scripts. Too broad. Rejected.
- Rely on CI `dos2unix` step → doesn't prevent the issue at the repo level. Rejected.

### Decision 4: Create `project.pbxproj` with all source file references
Generate a complete Xcode `project.pbxproj` file that includes:
- Project object with `MDReader` target (com.apple.application-type, iOS)
- File references for: `MDReaderApp.swift`, `FileStore.swift`, `ContentView.swift`, `MarkdownWebView.swift`, `Info.plist`, `core-bundle.js`
- Build phases: Sources, Frameworks, Resources
- Build configurations: Debug and Release, targeting iOS Simulator
- Product reference: `MDReader.app`
- Scheme: `MDReader`

**Rationale:** The `project.pbxproj` is the core Xcode project definition file. Without it, `xcodebuild` cannot open the project. Creating it from scratch based on the known source files is the only way to fix the iOS build without access to a Mac/Xcode GUI. The file uses standard Xcode project format with unique 24-char hex IDs for each object.

**Alternatives considered:**
- Use `xcodegen` to generate the project from a YAML spec → adds a dependency on `xcodegen` and requires it in CI. Rejected to avoid new dependencies.
- Use Swift Package Manager instead of xcodeproj → would require restructuring the entire iOS project. Rejected as too invasive.
- Generate the project in CI with `xcodebuild -create-project` → no such command exists. Rejected.

## Risks / Trade-offs

- **[Hand-written `project.pbxproj` may have errors]** → The pbxproj format is complex and error-prone when written by hand. Mitigation: use well-known UUID patterns, follow the standard structure, and verify with the CI build. If the first attempt has issues, iterate based on build errors.
- **[Gradle wrapper version mismatch]** → Re-encoding `gradlew` preserves the exact content (just changing encoding), so the Gradle version is unchanged. No risk.
- **[`.gitattributes` affects existing files]** → After adding `.gitattributes`, `git add --renormalize .` should be run to apply the new rules to all existing files. This may show many files as "modified" if they had CRLF. Mitigation: only renormalize the specific files we're fixing (`gradlew`).
- **[iOS build may need additional settings]** → The hand-written pbxproj may miss signing, deployment target, or other settings that Xcode normally adds. Mitigation: include essential settings (IPHONEOS_DEPLOYMENT_TARGET, SWIFT_VERSION, PRODUCT_BUNDLE_IDENTIFIER) and rely on the CI's Debug/simulator configuration which doesn't require code signing.
