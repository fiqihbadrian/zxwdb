const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// Paths
const srcDir = path.join(__dirname, '../backend/src');
const distDir = path.join(__dirname, '../backend/dist');

// Obfuscation options (high protection like 9router)
const obfuscationOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false,
  debugProtectionInterval: 0,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

// Create dist directory if not exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Function to obfuscate file
function obfuscateFile(filePath, outputPath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const obfuscated = JavaScriptObfuscator.obfuscate(code, obfuscationOptions);
  fs.writeFileSync(outputPath, obfuscated.getObfuscatedCode(), 'utf8');
  console.log(`✓ Obfuscated: ${path.basename(filePath)}`);
}

// Function to copy directory structure and obfuscate
function obfuscateDirectory(srcPath, distPath) {
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  const items = fs.readdirSync(srcPath);

  items.forEach(item => {
    const srcItem = path.join(srcPath, item);
    const distItem = path.join(distPath, item);
    const stat = fs.statSync(srcItem);

    if (stat.isDirectory()) {
      obfuscateDirectory(srcItem, distItem);
    } else if (item.endsWith('.js')) {
      obfuscateFile(srcItem, distItem);
    } else {
      // Copy non-JS files as-is
      fs.copyFileSync(srcItem, distItem);
      console.log(`✓ Copied: ${item}`);
    }
  });
}

// Start obfuscation
console.log('\n🔒 Obfuscating backend code...\n');
obfuscateDirectory(srcDir, distDir);
console.log('\n✅ Backend obfuscation complete!\n');
