# KrishimitraAI Testing Guide

## 🧪 Complete Testing Steps

### Step 1: Start Backend Server

```bash
# Open Terminal 1
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies (if not already done)
pip install -r requirements.txt

# Train ML models (if not already done)
cd ml
python yield_prediction.py
cd ..

# Start backend server
cd app
python main.py
```

**Expected Output:**
```
INFO:     Started server process [xxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Start Frontend Server

```bash
# Open Terminal 2
cd frontend

# Install dependencies (if not already done)
npm install --legacy-peer-deps

# Start frontend server
# On Windows:
$env:NODE_OPTIONS="--openssl-legacy-provider"; npm start
# On Linux/Mac:
NODE_OPTIONS="--openssl-legacy-provider" npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view krishimitraai-frontend in the browser.
  Local:            http://localhost:3000
  On Your Network:  http://10.165.99.102:3000
```

### Step 3: Verify Backend API Endpoints

Open your browser or use curl to test these endpoints:

#### 3.1 Health Check
```bash
curl http://localhost:8000/health
```
**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-30T..."
}
```

#### 3.2 Districts API
```bash
curl http://localhost:8000/districts
```
**Expected Response:** List of 10 Odisha districts with IDs, names, and coordinates

#### 3.3 Weather API
```bash
curl http://localhost:8000/districts/1/weather
```
**Expected Response:** Weather data for Khordha district

#### 3.4 Market Prices API
```bash
curl http://localhost:8000/market-prices
```
**Expected Response:** List of crop prices from various mandis

#### 3.5 Chatbot Session API
```bash
curl -X POST http://localhost:8000/chatbot/session -H "Content-Type: application/json" -d '{"user_id": "test_user"}'
```
**Expected Response:** Session creation with session_id

### Step 4: Test Frontend Application

Open your browser and go to: **http://localhost:3000**

#### 4.1 Dashboard Page Testing
- [ ] Page loads without errors
- [ ] Weather widget displays current weather
- [ ] Market prices show sample data
- [ ] Pest alerts display (if any)
- [ ] Navigation links work
- [ ] "Ask Assistant" button redirects to chatbot

#### 4.2 District Tracking Page Testing
- [ ] Click "District Tracking" in navigation
- [ ] Grid of district cards displays
- [ ] Each card shows district name and basic info
- [ ] Click on any district card → Modal opens with:
  - Weather data
  - Soil health metrics
  - District information
- [ ] Filter functionality works

#### 4.3 Yield Prediction Page Testing
- [ ] Click "Yield Prediction" in navigation
- [ ] Form displays with fields:
  - Crop selection (dropdown)
  - Season selection (dropdown)
  - Soil parameters (pre-filled)
  - Weather parameters (pre-filled)
- [ ] Fill in sample data:
  - Crop: Rice
  - Season: Kharif
  - Soil N: 45, P: 18, K: 32, pH: 6.8
  - Temperature: 30, Rainfall: 120, Humidity: 75
- [ ] Click "Predict Yield" button
- [ ] Results show:
  - Random Forest prediction
  - XGBoost prediction
  - Ensemble prediction
  - Recommendations

#### 4.4 Disease Detection Page Testing
- [ ] Click "Disease Detection" in navigation
- [ ] Page shows "Start Diagnosis" button
- [ ] Click "Start Diagnosis"
- [ ] Q&A flow begins:
  - Question 1 about crop symptoms
  - Select an answer
  - Progress bar updates
  - Continue through all 6 questions
- [ ] Final diagnosis shows:
  - Disease name with confidence score
  - Treatment recommendations
  - Prevention measures
  - Subsidy information
- [ ] "Start New Diagnosis" button works

#### 4.5 Chatbot Page Testing
- [ ] Click "Chatbot" in navigation
- [ ] Chat interface loads with:
  - Bot welcome message
  - Input field
  - Quick question suggestions
- [ ] Test English messages:
  - Type "What is the weather today?"
  - Bot responds with weather info
- [ ] Test Odia messages:
  - Type "ଆଜି କେମିତି ଅଛି?" (How is the weather today?)
  - Bot detects language and responds
- [ ] Test other queries:
  - "What are the current market prices?"
  - "How to treat leaf blight?"
  - "Best practices for rice cultivation"
- [ ] Language toggle works
- [ ] Voice input placeholder shows (future feature)

#### 4.6 Market Prices Page Testing
- [ ] Click "Market Prices" in navigation
- [ ] Page shows:
  - Summary statistics
  - Filter options (district, crop, mandi)
  - Search bar
  - Price table with trends
- [ ] Test filters:
  - Select different districts
  - Select different crops
  - Select different mandis
- [ ] Search functionality works
- [ ] Trend indicators (up/down) show correctly

### Step 5: ML Model Integration Testing

#### 5.1 Yield Prediction Model
- [ ] Submit yield prediction form
- [ ] Verify XGBoost model returns predictions
- [ ] Verify Random Forest model returns predictions
- [ ] Ensemble calculation works
- [ ] Error handling for invalid inputs

#### 5.2 Disease Detection Engine
- [ ] Complete full Q&A flow
- [ ] Verify confidence scoring works
- [ ] Multiple disease scenarios tested
- [ ] Treatment recommendations display

#### 5.3 Chatbot NLP
- [ ] Language detection works (English/Odia)
- [ ] Query categorization works
- [ ] Contextual responses generated
- [ ] Session management works

### Step 6: Integration Testing

#### 6.1 API Integration
- [ ] Frontend successfully calls backend APIs
- [ ] Error handling for API failures
- [ ] Loading states display properly
- [ ] Data refreshes correctly

#### 6.2 Cross-Page Navigation
- [ ] All navigation links work
- [ ] Browser back/forward buttons work
- [ ] URL updates correctly
- [ ] Page refresh maintains state

#### 6.3 Responsive Design
- [ ] Test on different screen sizes
- [ ] Mobile navigation works
- [ ] Tables scroll properly on mobile
- [ ] Forms work on mobile

### Step 7: Performance Testing

#### 7.1 Load Times
- [ ] Dashboard loads within 3 seconds
- [ ] District tracking loads within 2 seconds
- [ ] ML predictions complete within 5 seconds
- [ ] Chatbot responses within 2 seconds

#### 7.2 Error Handling
- [ ] Network errors handled gracefully
- [ ] Invalid form inputs show validation
- [ ] API timeouts handled
- [ ] 404 pages show helpful messages

### Step 8: Data Validation

#### 8.1 Weather Data
- [ ] Temperature ranges are realistic
- [ ] Humidity values between 0-100%
- [ ] Rainfall values reasonable

#### 8.2 Market Prices
- [ ] Prices are positive numbers
- [ ] Currency formatting correct
- [ ] Trends make sense

#### 8.3 Soil Data
- [ ] pH values between 0-14
- [ ] NPK values in reasonable ranges
- [ ] Moisture percentages valid

## 🐛 Common Issues & Solutions

### Backend Issues
**Problem:** `ModuleNotFoundError`
**Solution:** Activate virtual environment and install dependencies

**Problem:** `Address already in use`
**Solution:** Kill process using port 8000 or change port

**Problem:** ML models not loading
**Solution:** Run `python yield_prediction.py` first

### Frontend Issues
**Problem:** `NODE_OPTIONS` error
**Solution:** Use `NODE_OPTIONS="--openssl-legacy-provider"`

**Problem:** `MessageCircle is not defined`
**Solution:** Already fixed in code

**Problem:** 404 errors on routes
**Solution:** Restart frontend server after route changes

### API Issues
**Problem:** CORS errors
**Solution:** Backend CORS middleware configured

**Problem:** Proxy errors
**Solution:** Backend server must be running on port 8000

## ✅ Testing Checklist

Before deploying to production, verify:

- [ ] All backend API endpoints return correct responses
- [ ] Frontend loads without JavaScript errors
- [ ] All pages navigate correctly
- [ ] ML models integrate properly
- [ ] Chatbot responds in both languages
- [ ] Forms validate input correctly
- [ ] Error handling works gracefully
- [ ] Responsive design works on mobile
- [ ] Performance is acceptable
- [ ] Data validation works correctly

## 📊 Test Results Template

```
=== KrishimitraAI Test Results ===
Date: [Date]
Tester: [Your Name]

Backend Tests:
✅ Health Check - PASS
✅ Districts API - PASS
✅ Weather API - PASS
✅ Market Prices API - PASS
✅ Chatbot API - PASS

Frontend Tests:
✅ Dashboard - PASS
✅ District Tracking - PASS
✅ Yield Prediction - PASS
✅ Disease Detection - PASS
✅ Chatbot - PASS
✅ Market Prices - PASS

ML Integration:
✅ Yield Prediction Models - PASS
✅ Disease Detection Engine - PASS
✅ Chatbot NLP - PASS

Overall Status: READY FOR PRODUCTION
```

## 🚀 Next Steps After Testing

1. **Fix any failed tests**
2. **Deploy to production** (see deployment guide)
3. **Set up monitoring**
4. **Configure backup systems**
5. **Plan for scaling**
