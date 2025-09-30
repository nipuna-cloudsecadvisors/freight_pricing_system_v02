#!/bin/bash

echo "🚀 Freight Pricing System - Quick Start"
echo "========================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

echo "📋 Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo "⚠️  Please update .env with your configuration"
else
    echo "✅ .env file already exists"
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🐳 Starting Docker services..."
docker compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "🗄️  Setting up database..."
docker compose exec api pnpm prisma migrate deploy
docker compose exec api pnpm prisma db seed

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo "Frontend: http://localhost:3000"
echo "API: http://localhost:3001"
echo "API Docs: http://localhost:3001/api/docs"
echo ""
echo "Default Login:"
echo "Email: admin@freight.com"
echo "Password: admin123"
echo ""
echo "To stop services: docker compose down"
echo "To view logs: docker compose logs -f"
echo ""
echo "📚 See README.md for detailed documentation"