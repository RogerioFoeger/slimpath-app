#!/bin/bash

# SlimPath AI Setup Script

echo "🚀 Setting up SlimPath AI..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from example..."
    cp .env.local.example .env.local
    echo "📝 Please edit .env.local with your configuration"
else
    echo "✅ .env.local found"
fi

# Generate VAPID keys for push notifications
echo "🔑 Generating VAPID keys for push notifications..."
npx web-push generate-vapid-keys

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Supabase credentials"
echo "2. Add the VAPID keys generated above to .env.local"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Run the SQL schema in your Supabase SQL Editor (supabase/schema.sql)"
echo "5. Optionally run the seed data (supabase/seed.sql)"
echo ""
echo "📚 Check README.md for detailed documentation"

