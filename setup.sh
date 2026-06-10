#!/bin/bash

echo "🧪 Testing zxwdb installation..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node -v)"

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    echo "   Please run this script from the zxwdb root directory"
    exit 1
fi

echo "✅ In zxwdb directory"

# Install dependencies if needed
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm run install:all
fi

echo "✅ Dependencies installed"

# Build frontend
echo ""
echo "🔨 Building frontend..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 To install globally (one-time setup):"
echo "   sudo npm link"
echo ""
echo "🚀 Then run zxwdb anytime with:"
echo "   zxwdb"
echo ""
echo "🔧 Or test directly without installing:"
echo "   node bin/zxwdb.js"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
