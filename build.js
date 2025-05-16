const fs = require('fs-extra');
const path = require('path');

async function build() {
  try {
    // Clean up any existing files
    const filesToRemove = [
      'server.js',
      'config',
      'controllers',
      'middleware',
      'models',
      'routes',
      'services',
      'utils'
    ];

    for (const file of filesToRemove) {
      if (fs.existsSync(file)) {
        fs.removeSync(file);
        console.log(`Removed existing ${file}`);
      }
    }

    // Copy all files from gym-server to root
    await fs.copy('gym-server', '.', {
      filter: (src) => {
        // Don't copy node_modules, package.json, or package-lock.json
        return !src.includes('node_modules') && 
               !src.endsWith('package.json') && 
               !src.endsWith('package-lock.json');
      }
    });

    console.log('Successfully copied server files');

    // Create necessary directories
    const dirs = ['public/uploads', 'public/receipts'];
    for (const dir of dirs) {
      fs.ensureDirSync(dir);
      console.log(`Created directory: ${dir}`);
    }

    console.log('Build completed successfully!');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

build(); 