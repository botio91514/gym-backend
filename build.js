const fs = require('fs-extra');
const path = require('path');

// Copy all files from gym-server to root
fs.copySync('gym-server', '.', {
  overwrite: true,
  filter: (src) => {
    // Don't copy node_modules
    return !src.includes('node_modules');
  }
});

console.log('Build completed successfully!'); 