// Copy core bundle to Android assets before Gradle build
const fs = require('fs');
const path = require('path');

const coreBundle = path.join(__dirname, '..', 'src', 'core', 'dist', 'core-bundle.js');
const androidAssets = path.join(__dirname, '..', 'src', 'android', 'app', 'src', 'main', 'assets');

if (!fs.existsSync(coreBundle)) {
  console.error('Core bundle not found. Run "npm run build:core" first.');
  process.exit(1);
}

fs.mkdirSync(androidAssets, { recursive: true });
fs.copyFileSync(coreBundle, path.join(androidAssets, 'core-bundle.js'));
console.log('Core bundle copied to Android assets.');
