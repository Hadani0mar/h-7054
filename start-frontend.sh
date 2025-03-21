
#!/bin/bash
# Script to build and serve the frontend on Termux

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install it using:"
    echo "pkg install nodejs"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install it using:"
    echo "pkg install nodejs"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application using esbuild
echo "Building application..."
npm run build

# Serve the built application
echo "Starting server on port 8080..."
npx serve -s dist -l 8080
