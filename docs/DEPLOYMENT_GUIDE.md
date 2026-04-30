# KrishimitraAI Deployment Guide

## Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Redis (optional, for production)

## Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Set up database**
```bash
# Create PostgreSQL database
createdb krishimitraai

# Run schema
psql -d krishimitraai -f database/schema.sql
```

6. **Train ML models**
```bash
cd ml
python yield_prediction.py
```

7. **Start backend server**
```bash
cd app
python main.py
# Or using uvicorn:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your API URL
```

4. **Start development server**
```bash
npm start
```

## Production Deployment

### Backend (Docker)

1. **Create Dockerfile**
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Build and run**
```bash
docker build -t krishimitraai-backend .
docker run -p 8000:8000 krishimitraai-backend
```

### Frontend (Docker)

1. **Create Dockerfile**
```dockerfile
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
```

2. **Build and run**
```bash
docker build -t krishimitraai-frontend .
docker run -p 80:80 krishimitraai-frontend
```

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `OPENWEATHER_API_KEY`: Weather API key
- `SECRET_KEY`: JWT secret key
- `GOOGLE_TRANSLATE_API_KEY`: Translation API (optional)

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL

## API Documentation

Once backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **Weather API Not Working**
   - Add valid OPENWEATHER_API_KEY
   - Check API key permissions

3. **ML Models Not Loading**
   - Run training script first
   - Check data/models directory exists

4. **Frontend API Connection Error**
   - Verify backend is running on correct port
   - Check REACT_APP_API_URL in .env

## Monitoring

- Backend logs: Check console output
- Frontend errors: Browser developer tools
- Database: PostgreSQL logs
- API performance: Use tools like Postman/Insomnia

## Scaling

For production deployment:
1. Use load balancer for frontend
2. Scale backend horizontally
3. Add Redis for session storage
4. Implement proper logging
5. Set up monitoring and alerting
