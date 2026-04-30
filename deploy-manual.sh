#!/bin/bash

# KrishimitraAI Manual Production Deployment (Without Docker)
# This script sets up the application for production deployment

set -e

echo "🚀 Starting KrishimitraAI Manual Production Deployment..."

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL 12+ first."
    echo "   You can install it locally or use a cloud service."
fi

# Check Redis (optional)
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis is not installed. Redis is optional but recommended for caching."
fi

echo "✅ Prerequisites checked"

# Create production environment
echo "📁 Creating production directories..."
mkdir -p /opt/krishimitraai/{backend,frontend,data,logs,uploads}
mkdir -p /opt/krishimitraai/data/{models,raw,processed}
mkdir -p /opt/krishimitraai/logs

# Copy application files
echo "📋 Copying application files..."
cp -r backend/* /opt/krishimitraai/backend/
cp -r frontend/* /opt/krishimitraai/frontend/
cp .env.production /opt/krishimitraai/

# Setup backend
echo "🐍 Setting up backend..."
cd /opt/krishimitraai/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup database
echo "🗄️  Setting up database..."
read -p "Enter PostgreSQL host (localhost): " db_host
db_host=${db_host:-localhost}

read -p "Enter PostgreSQL port (5432): " db_port
db_port=${db_port:-5432}

read -p "Enter database name (krishimitraai): " db_name
db_name=${db_name:-krishimitraai}

read -p "Enter database username (postgres): " db_user
db_user=${db_user:-postgres}

read -s -p "Enter database password: " db_password

# Create database if it doesn't exist
createdb -h $db_host -p $db_port -U $db_user $db_name 2>/dev/null || echo "Database already exists"

# Run schema
psql -h $db_host -p $db_port -U $db_user -d $db_name -f database/schema.sql

# Update environment file
sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$db_user:$db_password@$db_host:$db_port/$db_name|" /opt/krishimitraai/.env.production

# Train ML models
echo "🤖 Training ML models..."
cd ml
python yield_prediction.py
cd ..

# Setup frontend
echo "⚛️  Setting up frontend..."
cd /opt/krishimitraai/frontend

# Install dependencies
npm ci --production

# Build production bundle
export NODE_OPTIONS="--openssl-legacy-provider"
npm run build

# Setup systemd services
echo "🔧 Setting up systemd services..."

# Backend service
sudo tee /etc/systemd/system/krishimitraai-backend.service > /dev/null <<EOF
[Unit]
Description=KrishimitraAI Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/krishimitraai/backend
Environment=PATH=/opt/krishimitraai/backend/venv/bin
ExecStart=/opt/krishimitraai/backend/venv/bin/python app/main_prod.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Frontend service (using serve)
sudo tee /etc/systemd/system/krishimitraai-frontend.service > /dev/null <<EOF
[Unit]
Description=KrishimitraAI Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/krishimitraai/frontend
ExecStart=/usr/bin/npx serve -s build -l 3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Nginx configuration
echo "🌐 Setting up Nginx..."
sudo tee /etc/nginx/sites-available/krishimitraai > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files
    location /static/ {
        alias /opt/krishimitraai/frontend/build/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/krishimitraai /etc/nginx/sites-enabled/
sudo nginx -t

# Set permissions
sudo chown -R www-data:www-data /opt/krishimitraai
sudo chmod -R 755 /opt/krishimitraai

# Start services
echo "🚀 Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable krishimitraai-backend
sudo systemctl enable krishimitraai-frontend
sudo systemctl start krishimitraai-backend
sudo systemctl start krishimitraai-frontend
sudo systemctl reload nginx

# Health checks
echo "🔍 Performing health checks..."
sleep 10

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend failed to start"
fi

if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start"
fi

echo "🎉 Manual deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update your domain DNS to point to this server"
echo "2. Configure SSL certificate (Let's Encrypt recommended)"
echo "3. Update server_name in nginx configuration"
echo "4. Set up monitoring and backups"
echo ""
echo "🌐 Application URLs:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- API Docs: http://localhost:8000/docs"
echo "- Health Check: http://localhost:8000/health"
echo ""
echo "📊 Service status:"
sudo systemctl status krishimitraai-backend --no-pager
sudo systemctl status krishimitraai-frontend --no-pager
