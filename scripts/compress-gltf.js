#!/usr/bin/env node
/**
 * Script to compress GLTF files with Draco compression
 * 
 * Usage:
 *   node scripts/compress-gltf.js input.gltf output.gltf
 *   or
 *   npm run compress-gltf
 * 
 * Requirements:
 *   npm install --save-dev @gltf-transform/cli
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = process.argv[2] || 'public/models/town/town.gltf';
const outputFile = process.argv[3] || 'public/models/town/town-draco.gltf';

console.log('🚀 GLTF Draco Compression Script');
console.log('================================\n');

// Check if gltf-transform is installed
try {
  execSync('npx @gltf-transform/cli --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ @gltf-transform/cli is not installed.');
  console.log('\n📦 Installing @gltf-transform/cli...');
  try {
    execSync('npm install --save-dev @gltf-transform/cli', { stdio: 'inherit' });
    console.log('✅ Installation complete!\n');
  } catch (installError) {
    console.error('❌ Failed to install @gltf-transform/cli');
    console.error('Please run: npm install --save-dev @gltf-transform/cli');
    process.exit(1);
  }
}

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`❌ Input file not found: ${inputFile}`);
  process.exit(1);
}

// Get file sizes
const inputStats = fs.statSync(inputFile);
const inputSizeMB = (inputStats.size / (1024 * 1024)).toFixed(2);

console.log(`📁 Input file: ${inputFile}`);
console.log(`   Size: ${inputSizeMB} MB\n`);

console.log('⚙️  Compressing with Draco...');
console.log('   This may take a few minutes...\n');

try {
  // Use gltf-transform to compress with Draco
  // Method options: 'edgebreaker' (better compression) or 'sequential' (faster)
  // Quantization bits: 1-16 (higher = better quality but larger file, 14 is good balance)
  execSync(
    `npx @gltf-transform/cli draco "${inputFile}" "${outputFile}" --method edgebreaker --quantize-color 14 --quantize-normal 10 --quantize-generic 12`,
    { stdio: 'inherit' }
  );

  // Get output file size
  if (fs.existsSync(outputFile)) {
    const outputStats = fs.statSync(outputFile);
    const outputSizeMB = (outputStats.size / (1024 * 1024)).toFixed(2);
    const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

    console.log('\n✅ Compression complete!');
    console.log(`📁 Output file: ${outputFile}`);
    console.log(`   Size: ${outputSizeMB} MB`);
    console.log(`   Reduction: ${reduction}%\n`);

    // Also compress the binary file if it exists
    const binFile = inputFile.replace('.gltf', '.bin');
    if (fs.existsSync(binFile)) {
      const binStats = fs.statSync(binFile);
      const binSizeMB = (binStats.size / (1024 * 1024)).toFixed(2);
      console.log(`📦 Binary file: ${binFile}`);
      console.log(`   Size: ${binSizeMB} MB`);
      console.log(`   Note: Binary is embedded in compressed GLTF\n`);
    }

    console.log('💡 Next steps:');
    console.log('   1. Test the compressed file in your application');
    console.log('   2. If it works, replace the original file');
    console.log('   3. Update the URL in Scene.tsx if you changed the filename\n');
  } else {
    console.error('❌ Output file was not created');
    process.exit(1);
  }
} catch (error) {
  console.error('\n❌ Compression failed:', error?.message || error);
  console.log('\n💡 Alternative: Use gltf-pipeline');
  console.log('   npm install -g gltf-pipeline');
  console.log(`   gltf-pipeline -i "${inputFile}" -o "${outputFile}" -d\n`);
  process.exit(1);
}

