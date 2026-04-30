# Quick Deployment Guide

## 🚀 One-Click Deployment Options

### Option 1: Local Development (Fastest)
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ml && python yield_prediction.py
cd ../app && python main.py

# Frontend (new terminal)
cd frontend
npm install --legacy-peer-deps
# Windows:
$env:NODE_OPTIONS="--openssl-legacy-provider"; npm start
# Linux/Mac:
NODE_OPTIONS="--openssl-legacy-provider" npm start
```
**Access**: http://localhost:3000

---

### Option 2: Manual Production (No Docker)
```bash
# Run the deployment script
chmod +x deploy-manual.sh
./deploy-manual.sh
```
**Prerequisites**: Python 3.8+, Node.js 16+, PostgreSQL 12+

---

### Option 3: Docker Production (Recommended)
```bash
# Install Docker & Docker Compose first
# Then:
cp .env.production.example .env.production
# Edit .env.production with your settings
docker-compose -f docker-compose.prod.yml up -d
```
**Access**: http://localhost (port 80)

---

### Option 4: Cloud Deployment (Heroku/Vercel)
```bash
# Backend to Heroku
heroku create your-app-name
git subtree push --prefix backend heroku main

# Frontend to Vercel
vercel --prod
```

---

## 📋 Environment Setup

### Required Environment Variables
Create `.env.production`:
```bash
DB_PASSWORD=your_secure_db_password
OPENWEATHER_API_KEY=your_openweather_api_key
SECRET_KEY=your_32_character_secret_key
```

### API Keys Needed
- **OpenWeatherMap**: Get free API key from openweathermap.org
- **Optional**: Google Translate API for enhanced chatbot

---

## 🔧 Troubleshooting

### Frontend Issues
```bash
# Node.js compatibility error
NODE_OPTIONS="--openssl-legacy-provider" npm start

# Build fails
npm install --legacy-peer-deps
npm run build
```

### Backend Issues
```bash
# Python environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# ML model training
cd ml && python yield_prediction.py
```

### Database Issues
```bash
# PostgreSQL setup
createdb krishimitraai
psql -d krishimitraai -f backend/database/schema.sql
```

---

## 🌐 Access URLs

| Service | Development | Production |
|---------|-------------|-------------|
| Frontend | http://localhost:3000 | http://localhost |
| Backend API | http://localhost:8000 | http://localhost/api |
| API Docs | http://localhost:8000/docs | http://localhost/docs |
| Health Check | http://localhost:8000/health | http://localhost/health |

---

## 📊 Monitoring

### Check Services
```bash
# Docker
docker-compose ps
docker-compose logs -f

# Manual
systemctl status krishimitraai-backend
systemctl status krishimitraai-frontend
```

### Health Checks
```bash
curl http://localhost:8000/health
curl http://localhost:3000
```

---

## 🎯 Quick Test

After deployment, test these features:
1. Dashboard loads with weather data
2. District tracking shows maps
3. Yield prediction works with sample data
4. Disease detection Q&A flows
5. Chatbot responds in English/Odia
6. Market prices display correctly

---

## 📞 Support

For deployment issues:
1. Check logs for error messages
2. Verify environment variables
3. Ensure all prerequisites are installed
4. Review the full [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
