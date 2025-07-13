#!/bin/bash

# Aspirin Synthesis Virtual Lab - Build and Package Script
# This script builds the standalone component and creates distribution packages

echo "🧪 Building Aspirin Synthesis Virtual Lab..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ to continue."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm to continue."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Create distribution packages
echo "📁 Creating distribution packages..."

# Create a timestamp for unique package names
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PACKAGE_NAME="aspirin-synthesis-lab_${TIMESTAMP}"

# Create the packages directory
mkdir -p packages

# Package 1: Complete standalone application
echo "📦 Creating standalone application package..."
cp -r dist "packages/${PACKAGE_NAME}_standalone"
cp README.md "packages/${PACKAGE_NAME}_standalone/"
cp BUILD_INSTRUCTIONS.md "packages/${PACKAGE_NAME}_standalone/"

# Create a simple deployment script for the standalone version
cat > "packages/${PACKAGE_NAME}_standalone/deploy.md" << EOF
# Deployment Instructions

## Quick Deploy to Web Server
1. Upload all files in this folder to your web server
2. Access via \`index.html\` in a web browser
3. Ensure your server can serve static files

## Local Testing
1. Use a local web server (not file:// protocol)
2. Python: \`python -m http.server 8000\`
3. Node.js: \`npx serve .\`
4. Open \`http://localhost:8000\`

The lab is now ready to use!
EOF

# Package 2: React component only
echo "📦 Creating React component package..."
mkdir -p "packages/${PACKAGE_NAME}_react_component"
cp src/AspirinSynthesis.jsx "packages/${PACKAGE_NAME}_react_component/"
cp src/index.css "packages/${PACKAGE_NAME}_react_component/"
cp package.json "packages/${PACKAGE_NAME}_react_component/"
cp tailwind.config.js "packages/${PACKAGE_NAME}_react_component/"
cp README.md "packages/${PACKAGE_NAME}_react_component/"

# Create integration instructions for the React component
cat > "packages/${PACKAGE_NAME}_react_component/INTEGRATION.md" << EOF
# React Component Integration Guide

## Installation
1. Copy \`AspirinSynthesis.jsx\` to your React project
2. Copy \`index.css\` for styles (or merge with your styles)
3. Install dependencies: \`npm install react react-dom lucide-react framer-motion\`
4. Install Tailwind CSS if not already installed

## Usage
\`\`\`jsx
import AspirinSynthesis from './AspirinSynthesis'
import './index.css' // Include the styles

function MyApp() {
  return (
    <div>
      <AspirinSynthesis />
    </div>
  )
}
\`\`\`

## Customization
- Edit the component directly to modify steps or appearance
- Adjust Tailwind configuration for custom colors
- Modify chemical data arrays within the component

## Dependencies Required
- React 18+
- Tailwind CSS
- Lucide React (icons)
- Framer Motion (optional, for animations)
EOF

# Package 3: Complete source code
echo "📦 Creating source code package..."
mkdir -p "packages/${PACKAGE_NAME}_source"
cp -r src "packages/${PACKAGE_NAME}_source/"
cp -r public "packages/${PACKAGE_NAME}_source/" 2>/dev/null || true
cp package.json "packages/${PACKAGE_NAME}_source/"
cp vite.config.js "packages/${PACKAGE_NAME}_source/"
cp tailwind.config.js "packages/${PACKAGE_NAME}_source/"
cp postcss.config.js "packages/${PACKAGE_NAME}_source/"
cp index.html "packages/${PACKAGE_NAME}_source/"
cp README.md "packages/${PACKAGE_NAME}_source/"
cp BUILD_INSTRUCTIONS.md "packages/${PACKAGE_NAME}_source/"

# Create development setup instructions
cat > "packages/${PACKAGE_NAME}_source/DEVELOPMENT.md" << EOF
# Development Setup

## Quick Start
1. Install dependencies: \`npm install\`
2. Start development server: \`npm run dev\`
3. Open \`http://localhost:5173\` in your browser

## Build for Production
1. Build: \`npm run build\`
2. Preview: \`npm run preview\`
3. Deploy \`dist/\` folder to your web server

## Project Structure
- \`src/AspirinSynthesis.jsx\` - Main component
- \`src/main.jsx\` - React entry point
- \`src/index.css\` - Styles and animations
- \`index.html\` - HTML template
- \`vite.config.js\` - Build configuration

## Customization
Modify the component arrays to change:
- Experimental steps
- Chemical properties
- Equipment list
- Visual styling
EOF

# Create ZIP archives for easy distribution
if command -v zip &> /dev/null; then
    echo "🗜️ Creating ZIP archives..."
    
    cd packages
    zip -r "${PACKAGE_NAME}_standalone.zip" "${PACKAGE_NAME}_standalone/"
    zip -r "${PACKAGE_NAME}_react_component.zip" "${PACKAGE_NAME}_react_component/"
    zip -r "${PACKAGE_NAME}_source.zip" "${PACKAGE_NAME}_source/"
    cd ..
    
    echo "✅ ZIP archives created"
else
    echo "ℹ️ ZIP not available - skipping archive creation"
fi

# Create a summary file
cat > "packages/PACKAGE_SUMMARY.md" << EOF
# Aspirin Synthesis Virtual Lab - Distribution Packages

Generated on: $(date)
Build timestamp: ${TIMESTAMP}

## Available Packages

### 1. Standalone Application (\`${PACKAGE_NAME}_standalone\`)
- **Description**: Ready-to-deploy web application
- **Use case**: Upload to any web hosting service
- **Contents**: Built HTML, CSS, JS files + documentation
- **Requirements**: Web server capable of serving static files

### 2. React Component (\`${PACKAGE_NAME}_react_component\`)
- **Description**: React component for integration
- **Use case**: Add to existing React applications
- **Contents**: Component file, styles, integration docs
- **Requirements**: React 18+, Tailwind CSS

### 3. Source Code (\`${PACKAGE_NAME}_source\`)
- **Description**: Complete source code for modification
- **Use case**: Full customization and development
- **Contents**: All source files, build configuration, docs
- **Requirements**: Node.js 16+, npm

## Quick Start

### Deploy Standalone Version
1. Extract \`${PACKAGE_NAME}_standalone.zip\`
2. Upload contents to your web server
3. Access via browser

### Integrate React Component
1. Extract \`${PACKAGE_NAME}_react_component.zip\`
2. Copy \`AspirinSynthesis.jsx\` to your React project
3. Import and use the component

### Modify Source Code
1. Extract \`${PACKAGE_NAME}_source.zip\`
2. Run \`npm install && npm run dev\`
3. Modify as needed and rebuild

## Support
- Check BUILD_INSTRUCTIONS.md for detailed setup
- Review component documentation in README.md
- Test in latest versions of Chrome, Firefox, Safari, Edge
EOF

echo ""
echo "🎉 Build and packaging completed successfully!"
echo ""
echo "📋 Summary:"
echo "  ✅ Project built successfully"
echo "  ✅ 3 distribution packages created"
echo "  ✅ Documentation generated"
if command -v zip &> /dev/null; then
    echo "  ✅ ZIP archives created"
fi
echo ""
echo "📁 Find your packages in the 'packages/' directory:"
echo "  - ${PACKAGE_NAME}_standalone/ (or .zip)"
echo "  - ${PACKAGE_NAME}_react_component/ (or .zip)"  
echo "  - ${PACKAGE_NAME}_source/ (or .zip)"
echo ""
echo "📖 See PACKAGE_SUMMARY.md for detailed information"
echo ""
echo "🚀 Your Aspirin Synthesis Virtual Lab is ready for deployment!"
