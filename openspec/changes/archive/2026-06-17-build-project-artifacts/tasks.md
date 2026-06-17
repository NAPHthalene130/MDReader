## 1. Gitignore Update

- [x] 1.1 Add `.build/` entry to root `.gitignore`

## 2. Root Build Scripts

- [x] 2.1 Add `build` script to root `package.json` that runs core build, then Windows and Android builds
- [x] 2.2 Add `build:windows` script to root `package.json` that builds core then packages Electron app
- [x] 2.3 Add `build:android` script to root `package.json` that builds core then assembles Android APK

## 3. Windows Build Configuration

- [x] 3.1 Update `src/windows/package.json` electron-builder config to output to `.build/windows/`
- [x] 3.2 Verify Windows Electron app installs core dependencies and runs electron-builder successfully
- [x] 3.3 Test produced `.exe` installer works correctly

## 4. Android Build Configuration

- [x] 4.1 Add Gradle wrapper scripts (`gradlew`, `gradlew.bat`) to `src/android/` for command-line builds
- [x] 4.2 Create build script that copies core bundle into Android assets before Gradle build
- [ ] 4.3 Verify `gradlew assembleDebug` produces `.build/android/app-debug.apk`
- [ ] 4.4 Test produced `.apk` installs and runs on Android device/emulator

## 5. Build Verification

- [x] 5.1 Run full build and confirm `.build/windows/*.exe` exists
- [ ] 5.2 Run full build and confirm `.build/android/*.apk` exists (or skip message if no Android SDK)
- [x] 5.3 Verify `.build/` is ignored by git after build completes
