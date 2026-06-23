// Android build script - runs Gradle and copies APK to .build/android/
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const androidDir = path.join(__dirname, '..');
const rootDir = path.join(androidDir, '..', '..');
const buildOutputDir = path.join(rootDir, '.build', 'android');

// Check for Java/Gradle
function hasCommand(cmd) {
  try {
    execSync(`where ${cmd} 2>nul || which ${cmd} 2>/dev/null`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function findGradle() {
  // Try gradlew scripts first
  const gradlewBat = path.join(androidDir, 'gradlew.bat');
  const gradlew = path.join(androidDir, 'gradlew');

  if (process.platform === 'win32') {
    if (fs.existsSync(gradlewBat)) return 'gradlew.bat';
  } else {
    if (fs.existsSync(gradlew)) return './gradlew';
  }

  // Fall back to system gradle
  if (hasCommand('gradle')) return 'gradle';

  return null;
}

console.log('Building Android APK...');

const gradleCmd = findGradle();
if (!gradleCmd) {
  console.log('SKIP: Android SDK / Gradle not found. Install JDK 17+ and Android SDK to build APK.');
  console.log('The .apk can still be built via CI/CD (GitHub Actions).');
  process.exit(0);
}

try {
  // Create output directory
  fs.mkdirSync(buildOutputDir, { recursive: true });

  // Check if we want to build release
  const isRelease = process.argv.includes('--release');
  const task = isRelease ? 'assembleRelease' : 'assembleDebug';
  const buildType = isRelease ? 'release' : 'debug';

  // Run Gradle task
  console.log(`Running: ${gradleCmd} ${task}`);
  execSync(`${gradleCmd} ${task}`, {
    cwd: androidDir,
    stdio: 'inherit',
  });

  // Find the built APK
  const apkSourceDir = path.join(androidDir, 'app', 'build', 'outputs', 'apk', buildType);
  if (fs.existsSync(apkSourceDir)) {
    const apkFiles = fs.readdirSync(apkSourceDir).filter(f => f.endsWith('.apk'));
    for (const apk of apkFiles) {
      const src = path.join(apkSourceDir, apk);
      const dest = path.join(buildOutputDir, apk);
      fs.copyFileSync(src, dest);
      console.log(`APK built: ${dest}`);
    }
  } else {
    console.error('APK build completed but output directory not found.');
    process.exit(1);
  }

  console.log('Android build complete.');
} catch (err) {
  console.error('Android build failed:', err.message);
  process.exit(1);
}
