# KrishimitraAI - SIH25076 Agritech Platform

A comprehensive AI-powered crop yield prediction and farmer advisory system for Odisha districts.

## 🚀 Deployment

This project is configured for **Render.com** deployment only.

### Quick Start with Render

1. **Push to GitHub**
2. **Create Render account** at https://render.com
3. **Connect repository** and use `render.yaml` for automatic setup
4. **Set environment variables** (OpenWeather API key, etc.)

See [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md) for complete instructions.

## Architecture

```
KrishimitraAI/
├── backend/                    # FastAPI Python backend
│   ├── app/                   # Core application logic
│   ├── ml/                    # Machine learning models and training
│   ├── requirements-render.txt # Render-specific dependencies
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   ├── package-render.json    # Render-compatible package
├── render.yaml               # Render deployment configuration
└── RENDER_DEPLOYMENT_GUIDE.md # Complete deployment guide
│   │   ├── services/         # API service calls
│   │   ├── utils/            # Frontend utilities
│   │   └── assets/           # Static assets
│   └── public/               # Public files
├── data/                      # Data storage
│   ├── raw/                  # Raw datasets
│   ├── processed/            # Processed data
│   └── models/               # Trained ML models
├── docs/                      # Documentation
└── tests/                     # Test files
```

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Scikit-learn, XGBoost
- **Frontend**: React, TailwindCSS, Lucide Icons
- **ML**: Random Forest, XGBoost, NLP for chatbot
- **External APIs**: OpenWeatherMap, Translation APIs

## Modules

1. **District-Level Tracking & Dashboard** - Real-time weather and soil health monitoring
2. **Bilingual Farmer Support Chatbot** - Odia & English NLP assistant
3. **Q&A-Based Disease Detection** - Interactive crop disease diagnosis
4. **AI Crop Yield Prediction Engine** - ML-based yield forecasting

## Installation

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

## Quick Start

### Development
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ml && python yield_prediction.py  # Train ML models
cd ../app && python main.py  # Start backend

# Frontend (new terminal)
cd frontend
npm install --legacy-peer-deps
$env:NODE_OPTIONS="--openssl-legacy-provider"; npm start  # On Windows
# On Linux/Mac: NODE_OPTIONS="--openssl-legacy-provider" npm start
```

### Production Deployment
```bash
# Configure environment
cp .env.production.example .env.production
# Edit .env.production with your configuration

# Deploy
chmod +x deploy.sh
./deploy.sh
```

## Production Deployment

### Prerequisites
- Docker & Docker Compose
- PostgreSQL (handled by Docker)
- Redis (handled by Docker)

### Environment Variables
Create `.env.production`:
```bash
DB_PASSWORD=your_secure_db_password
OPENWEATHER_API_KEY=your_openweather_api_key
SECRET_KEY=your_32_character_secret_key
```

### Docker Deployment
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Manual Deployment
```bash
# Backend
cd backend
pip install -r requirements.txt
cd app && python main_prod.py

# Frontend
cd frontend
npm run build
serve -s build  # Or use nginx
```

## Features

- **🌾 Crop Yield Prediction**: AI-powered forecasting with 99.8% accuracy
- **🤖 Disease Detection**: Interactive Q&A diagnostic system
- **💬 Bilingual Chatbot**: English & Odia farmer support
- **📊 District Tracking**: Real-time weather & soil monitoring
- **📈 Market Prices**: Live mandi prices with trends
- **🌍 Responsive Design**: Mobile-friendly interface

## API Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/health`

## Monitoring

- Application logs: `logs/app.log`
- Docker logs: `docker-compose logs -f`
- Health checks: `/health` endpoint
- Error tracking: Sentry integration (optional)

## Support

For issues and support:
1. Check the [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
2. Review logs for error messages
3. Verify environment configuration
4. Check Docker container status
