# KrishimitraAI Render Deployment Guide

## 🚀 Complete Setup for Render Hosting

This guide will help you deploy your KrishimitraAI application on Render.com with full functionality.

## 📋 Prerequisites

1. **Render Account**: Sign up at https://render.com
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Get OpenWeather API key

## 🛠️ Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Repository Structure**:
   ```
   KrishimitraAI/
   ├── backend/
   │   ├── app/
   │   ├── requirements-render.txt
   │   └── Dockerfile
   ├── frontend/
   │   ├── public/
   │   ├── src/
   │   └── package-render.json
   ├── render.yaml
   └── RENDER_DEPLOYMENT_GUIDE.md
   ```

### Step 2: Deploy Backend

1. **Go to Render Dashboard** → **New** → **Web Service**
2. **Connect Repository**: Select your GitHub repository
3. **Configure Service**:
   - **Name**: `krishimitraai-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements-render.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`

4. **Environment Variables**:
   ```
   DATABASE_URL=postgresql://postgres:password@host:5432/krishimitraai
   REDIS_URL=redis://host:6379
   OPENWEATHER_API_KEY=your_api_key_here
   SECRET_KEY=your_secret_key_here
   ENVIRONMENT=production
   DEBUG=false
   ```

5. **Add Database**:
   - **New** → **PostgreSQL**
   - **Name**: `krishimitraai-db`
   - **Database Name**: `krishimitraai`
   - **User**: `postgres`

6. **Add Redis**:
   - **New** → **Redis**
   - **Name**: `krishimitraai-redis`

### Step 3: Deploy Frontend

1. **New** → **Static Site**
2. **Configure Service**:
   - **Name**: `krishimitraai-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `frontend/build`
   - **Root Directory**: `frontend`

3. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://krishimitraai-backend.onrender.com
   ```

### Step 4: Configure CORS

Update your backend CORS settings for production:

```python
# In backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://krishimitraai-frontend.onrender.com",
        "https://your-custom-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"]
)
```

## 🔧 Configuration Files

### render.yaml (Auto-Deployment)
```yaml
services:
  - type: web
    name: krishimitraai-backend
    runtime: python
    plan: free
    buildCommand: pip install -r requirements-render.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: krishimitraai-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          type: redis
          name: krishimitraai-redis
          property: connectionString
```

### Backend requirements-render.txt
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
redis==5.0.1
aiohttp==3.9.1
python-dotenv==1.0.0
scikit-learn==1.3.2
pandas==2.1.4
numpy==1.24.4
```

### Frontend package-render.json
```json
{
  "scripts": {
    "build": "react-scripts build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-query": "^3.39.3",
    "axios": "^1.6.0",
    "lucide-react": "^0.263.1"
  }
}
```

## 🌍 Environment Variables Setup

### Backend Environment Variables
```bash
DATABASE_URL=postgresql://postgres:password@host:5432/krishimitraai
REDIS_URL=redis://host:6379
OPENWEATHER_API_KEY=your_openweather_api_key
SECRET_KEY=your_secret_key_here
ENVIRONMENT=production
DEBUG=false
```

### Frontend Environment Variables
```bash
REACT_APP_API_URL=https://krishimitraai-backend.onrender.com
```

## 📊 Service URLs After Deployment

### Backend API
```
https://krishimitraai-backend.onrender.com
```

### Frontend Application
```
https://krishimitraai-frontend.onrender.com
```

### Database
```
PostgreSQL: krishimitraai-db.postgres.database.com
Redis: krishimitraai-redis.redis.com
```

## 🔍 Health Checks

Your services will be automatically monitored:

### Backend Health Check
- **URL**: `/health`
- **Expected Response**: `{"status": "healthy", "timestamp": "..."}`

### Frontend Health Check
- **URL**: `/`
- **Expected Response**: HTML page with 200 status

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check `requirements-render.txt` syntax
   - Verify all dependencies are compatible
   - Check Python version compatibility

2. **Database Connection Errors**:
   - Verify DATABASE_URL format
   - Check database service status
   - Ensure proper credentials

3. **CORS Issues**:
   - Update CORS origins in backend
   - Verify frontend URL is allowed
   - Check API calls use correct URL

4. **Environment Variables**:
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify secret values are correct

### Debugging Commands

```bash
# Check backend logs
curl https://krishimitraai-backend.onrender.com/health

# Check frontend build
curl https://krishimitraai-frontend.onrender.com

# Test API endpoints
curl https://krishimitraai-backend.onrender.com/districts
```

## 🎯 Performance Optimization

### Backend Optimization
- Use Redis for caching frequent requests
- Implement database connection pooling
- Add response compression middleware
- Monitor memory usage and optimize queries

### Frontend Optimization
- Enable code splitting
- Implement lazy loading for components
- Optimize bundle size with compression
- Use CDN for static assets

## 🔒 Security Considerations

1. **API Keys**: Never commit API keys to repository
2. **Database**: Use strong passwords and SSL
3. **CORS**: Restrict to specific domains only
4. **Environment**: Keep production secrets secure
5. **Dependencies**: Regularly update for security patches

## 📈 Scaling Plans

### Free Tier Limitations
- **Backend**: 750 hours/month, 512MB RAM
- **Database**: 256MB storage
- **Redis**: 25MB memory
- **Frontend**: Unlimited static hosting

### Upgrade Path
1. **Starter Plan**: Better performance and reliability
2. **Standard Plan**: More resources and features
3. **Custom Plans**: Enterprise-level support

## 🎉 Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Backend service created and configured
- [ ] Database service created and connected
- [ ] Redis service created and connected
- [ ] Frontend service created and configured
- [ ] Environment variables set
- [ ] CORS configured for production
- [ ] Health checks passing
- [ ] All API endpoints tested
- [ ] Frontend loading correctly
- [ ] Custom domain configured (optional)

## 📞 Support

If you encounter issues:

1. **Render Docs**: https://render.com/docs
2. **Community Forum**: https://community.render.com
3. **Status Page**: https://status.render.com
4. **Support**: support@render.com

---

## 🚀 Quick Start Summary

1. **Push code to GitHub**
2. **Create backend web service** on Render
3. **Add PostgreSQL and Redis services**
4. **Create frontend static site**
5. **Set environment variables**
6. **Test all services**

Your KrishimitraAI application will be live on Render! 🎊
