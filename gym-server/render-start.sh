#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
npm install

# Create uploads directory if it doesn't exist
mkdir -p public/uploads

# Start the server
node server.js 