#!/bin/bash

# Environment Setup Script for CodeCompanionPro
# This script helps set up the development environment

set -e

echo "🔧 Setting up CodeCompanionPro development environment..."

# Create .env file from template
setup_env() {
    echo "📝 Creating environment file..."
    
    if [ ! -f .env ]; then
        cp env.example .env
        echo "✅ Created .env file from template"
        echo "⚠️  Please update .env with your actual values:"
        echo "   - DATABASE_URL"
        echo "   - CLERK_SECRET_KEY"
        echo "   - HUGGINGFACE_API_KEY"
    else
        echo "✅ .env file already exists"
    fi
}

# Install dependencies
install_deps() {
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
}

# Set up database
setup_database() {
    echo "🗄️ Setting up database..."
    
    if [ -z "$DATABASE_URL" ]; then
        echo "⚠️  DATABASE_URL not set in .env file"
        echo "   Please set up a PostgreSQL database and update .env"
        echo "   Recommended: Use Neon (https://neon.tech) for free PostgreSQL"
    else
        echo "📊 Pushing database schema..."
        npm run db:push
        echo "✅ Database schema updated"
    fi
}

# Verify setup
verify_setup() {
    echo "🔍 Verifying setup..."
    
    # Check if all required files exist
    required_files=(
        "package.json"
        "server/index.ts"
        "client/src/main.tsx"
        "shared/schema.ts"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            echo "❌ Required file missing: $file"
            exit 1
        fi
    done
    
    echo "✅ All required files present"
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update .env file with your API keys:"
    echo "   - Get HuggingFace API key: https://huggingface.co/settings/tokens"
    echo "   - Get Clerk keys: https://dashboard.clerk.com"
    echo "   - Set up database: https://neon.tech (free tier)"
    echo ""
    echo "2. Start development server:"
    echo "   npm run dev"
    echo ""
    echo "3. Open browser:"
    echo "   http://localhost:5000"
    echo ""
    echo "4. Test the application:"
    echo "   - Health check: http://localhost:5000/api/health"
    echo "   - Detailed health: http://localhost:5000/api/health/detailed"
    echo ""
    echo "🔗 Useful links:"
    echo "   - HuggingFace Models: https://huggingface.co/models"
    echo "   - Clerk Documentation: https://clerk.com/docs"
    echo "   - Vercel Deployment: https://vercel.com/docs"
    echo "   - Neon Database: https://neon.tech/docs"
}

# Main setup flow
main() {
    echo "🎯 CodeCompanionPro - Free AI Code Tutor"
    echo "========================================"
    
    setup_env
    install_deps
    verify_setup
    setup_database
    show_next_steps
}

# Run main function
main "$@"
