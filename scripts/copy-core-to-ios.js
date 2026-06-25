// Copy the built core bundle to the iOS app bundle before Xcode build
const fs = require('fs');
const path = require('path');

const coreBundle = path.join(__dirname, '..', 'src', 'core', 'dist', 'core-bundle.js');
const iosBundle = path.join(__dirname, '..', 'src', 'ios', 'MDReader', 'Resources', 'core-bundle.js');

if (!fs.existsSync(coreBundle)) {
  console.error('Core bundle not found. Run "npm run build:core" first.');
  process.exit(1);
}

fs.mkdirSync(path.dirname(iosBundle), { recursive: true });
fs.copyFileSync(coreBundle, iosBundle);
console.log('Core bundle copied to iOS app bundle.');
