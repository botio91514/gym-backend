const fs = require('fs-extra');
const path = require('path');

async function build() {
  try {
    console.log('Starting build process...');

    // Clean up any existing files
    const filesToRemove = [
      'server.js',
      'config',
      'controllers',
      'middleware',
      'models',
      'routes',
      'services',
      'utils',
      'public'
    ];

    console.log('Cleaning up existing files...');
    for (const file of filesToRemove) {
      if (fs.existsSync(file)) {
        fs.removeSync(file);
        console.log(`Removed existing ${file}`);
      }
    }

    // Copy all files from gym-server to root
    console.log('Copying server files...');
    await fs.copy('gym-server', '.', {
      filter: (src) => {
        const isNodeModule = src.includes('node_modules');
        const isPackageFile = src.endsWith('package.json') || 
                            src.endsWith('package-lock.json');
        const isGitFile = src.includes('.git');
        
        return !isNodeModule && !isPackageFile && !isGitFile;
      }
    });

    console.log('Successfully copied server files');

    // Create necessary directories with proper permissions
    const dirs = [
      'public',
      'public/uploads',
      'public/receipts',
      'logs'
    ];

    console.log('Creating necessary directories...');
    for (const dir of dirs) {
      await fs.ensureDir(dir);
      // Set directory permissions to 755 (rwxr-xr-x)
      await fs.chmod(dir, 0o755);
      console.log(`Created directory: ${dir} with proper permissions`);
    }

    // Create .gitkeep files in empty directories
    for (const dir of dirs) {
      const gitkeepPath = path.join(dir, '.gitkeep');
      await fs.ensureFile(gitkeepPath);
      console.log(`Created .gitkeep in ${dir}`);
    }

    console.log('Build completed successfully!');
  } catch (err) {
    console.error('Build failed:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

build(); 