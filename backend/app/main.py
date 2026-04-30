from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import aiohttp
import json
from datetime import datetime, date
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import ML models
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from ml.yield_prediction import CropYieldPredictor
from ml.disease_detection import DiseaseDetectionAPI
from ml.chatbot import ChatbotAPI

app = FastAPI(
    title="KrishimitraAI API",
    description="SIH25076 Agritech Platform - AI-powered crop yield prediction and farmer advisory system",
    version="1.0.0"
)

# CORS middleware - Add before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Initialize ML models
yield_predictor = CropYieldPredictor()
detection_api = DiseaseDetectionAPI()
chatbot_api = ChatbotAPI()

# Pydantic models
class WeatherData(BaseModel):
    district_id: int
    date: date
    temperature_max: Optional[float] = None
    temperature_min: Optional[float] = None
    humidity: Optional[float] = None
    rainfall: Optional[float] = None
    wind_speed: Optional[float] = None
    weather_condition: Optional[str] = None

class SoilHealth(BaseModel):
    district_id: int
    date: date
    nitrogen_level: Optional[float] = None
    phosphorus_level: Optional[float] = None
    potassium_level: Optional[float] = None
    ph_level: Optional[float] = None
    moisture_percentage: Optional[float] = None
    organic_matter: Optional[float] = None
    soil_type: Optional[str] = None

class YieldPredictionRequest(BaseModel):
    crop_name: str
    season: str
    crop_type: str
    district: str
    soil_nitrogen: float
    soil_phosphorus: float
    soil_potassium: float
    soil_ph: float
    soil_moisture: float
    historical_temperature: float
    historical_rainfall: float
    historical_humidity: float
    potential_diseases: str

class DiseaseDetectionRequest(BaseModel):
    session_id: str
    question_id: Optional[int] = None
    answer: Optional[str] = None

class MarketPrice(BaseModel):
    crop_id: int
    district_id: int
    date: date
    mandi_name: str
    price_per_quintal: float
    price_trend: str

class ChatSession(BaseModel):
    user_id: str

class ChatMessage(BaseModel):
    session_id: str
    message: str

# OpenWeatherMap API integration
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "demo_key")

async def fetch_weather_data(district_name: str) -> Dict[str, Any]:
    """Fetch real-time weather data from OpenWeatherMap API"""
    # Always return mock data for demo purposes
    return {
        "temperature_max": 32.5,
        "temperature_min": 25.2,
        "humidity": 78.5,
        "rainfall": 2.5,
        "wind_speed": 12.3,
        "weather_condition": "Partly Cloudy"
    }

# API Endpoints

@app.get("/")
async def root():
    return {"message": "KrishimitraAI API - SIH25076 Agritech Platform"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

# District endpoints
@app.get("/districts")
async def get_districts():
    """Get all districts"""
    districts = [
        {"id": 1, "name": "Khordha", "code": "KH", "latitude": 20.1806, "longitude": 85.6789},
        {"id": 2, "name": "Cuttack", "code": "CT", "latitude": 20.4625, "longitude": 85.8830},
        {"id": 3, "name": "Puri", "code": "PR", "latitude": 19.8145, "longitude": 85.8312},
        {"id": 4, "name": "Balasore", "code": "BL", "latitude": 21.4941, "longitude": 86.9346},
        {"id": 5, "name": "Sundargarh", "code": "SG", "latitude": 22.1204, "longitude": 84.3953},
        {"id": 6, "name": "Ganjam", "code": "GM", "latitude": 19.3821, "longitude": 85.0699},
        {"id": 7, "name": "Angul", "code": "AN", "latitude": 20.8509, "longitude": 85.0985},
        {"id": 8, "name": "Bolangir", "code": "BLR", "latitude": 20.7016, "longitude": 83.5178},
        {"id": 9, "name": "Kalahandi", "code": "KL", "latitude": 19.8486, "longitude": 83.0189},
        {"id": 10, "name": "Koraput", "code": "KP", "latitude": 18.7801, "longitude": 82.8589}
    ]
    return {"districts": districts}

@app.get("/districts/{district_id}/weather")
async def get_district_weather(district_id: int):
    """Get current weather for a district"""
    district_names = {
        1: "Khordha", 2: "Cuttack", 3: "Puri", 4: "Balasore", 5: "Sundargarh",
        6: "Ganjam", 7: "Angul", 8: "Bolangir", 9: "Kalahandi", 10: "Koraput"
    }
    
    district_name = district_names.get(district_id)
    if not district_name:
        raise HTTPException(status_code=404, detail="District not found")
    
    weather_data = await fetch_weather_data(district_name)
    return {
        "district_id": district_id,
        "district_name": district_name,
        "date": date.today(),
        "weather": weather_data
    }

@app.get("/districts/{district_id}/soil")
async def get_district_soil_health(district_id: int):
    """Get soil health data for a district"""
    # Mock soil data - in production, fetch from database
    soil_data = {
        1: {"nitrogen": 45.2, "phosphorus": 18.5, "potassium": 32.1, "ph": 6.8, "moisture": 65.5, "organic_matter": 2.1, "soil_type": "Alluvial"},
        2: {"nitrogen": 42.8, "phosphorus": 20.1, "potassium": 35.6, "ph": 7.1, "moisture": 68.2, "organic_matter": 2.3, "soil_type": "Alluvial"},
        3: {"nitrogen": 38.5, "phosphorus": 15.2, "potassium": 28.9, "ph": 6.5, "moisture": 62.1, "organic_matter": 1.9, "soil_type": "Sandy Loam"},
        4: {"nitrogen": 48.1, "phosphorus": 22.3, "potassium": 38.2, "ph": 7.2, "moisture": 70.5, "organic_matter": 2.4, "soil_type": "Coastal Alluvial"},
        5: {"nitrogen": 35.7, "phosphorus": 14.8, "potassium": 25.6, "ph": 6.2, "moisture": 58.3, "organic_matter": 1.8, "soil_type": "Lateritic"},
        6: {"nitrogen": 40.2, "phosphorus": 17.6, "potassium": 31.2, "ph": 6.6, "moisture": 61.8, "organic_matter": 2.0, "soil_type": "Red Soil"},
        7: {"nitrogen": 41.5, "phosphorus": 19.8, "potassium": 35.2, "ph": 6.9, "moisture": 65.8, "organic_matter": 2.2, "soil_type": "Mixed Red"},
        8: {"nitrogen": 36.2, "phosphorus": 13.8, "potassium": 26.4, "ph": 6.4, "moisture": 55.7, "organic_matter": 1.7, "soil_type": "Lateritic"},
        9: {"nitrogen": 33.8, "phosphorus": 12.1, "potassium": 24.1, "ph": 6.1, "moisture": 52.3, "organic_matter": 1.6, "soil_type": "Lateritic"},
        10: {"nitrogen": 44.3, "phosphorus": 20.8, "potassium": 36.9, "ph": 7.0, "moisture": 67.5, "organic_matter": 2.3, "soil_type": "Red Loam"}
    }
    
    if district_id not in soil_data:
        raise HTTPException(status_code=404, detail="District not found")
    
    return {
        "district_id": district_id,
        "date": date.today(),
        "soil_health": soil_data[district_id]
    }

# Crop yield prediction endpoints
@app.post("/predict-yield")
async def predict_yield(request: YieldPredictionRequest):
    """Predict crop yield using ML models"""
    try:
        # Load models if not already loaded
        if not yield_predictor.rf_model and not yield_predictor.xgb_model:
            model_dir = "../../data/models"
            if os.path.exists(model_dir):
                yield_predictor.load_models(model_dir)
            else:
                # Train models if not available
                from ml.yield_prediction import main as train_models
                train_models()
        
        # Prepare input data
        input_data = {
            "Crop_Name": request.crop_name,
            "Season": request.season,
            "Crop_Type": request.crop_type,
            "District": request.district,
            "Soil_Nitrogen": request.soil_nitrogen,
            "Soil_Phosphorus": request.soil_phosphorus,
            "Soil_Potassium": request.soil_potassium,
            "Soil_pH": request.soil_ph,
            "Soil_Moisture": request.soil_moisture,
            "Historical_Temperature": request.historical_temperature,
            "Historical_Rainfall": request.historical_rainfall,
            "Historical_Humidity": request.historical_humidity,
            "Potential_Diseases": request.potential_diseases
        }
        
        predictions = yield_predictor.predict_yield(input_data)
        
        return {
            "success": True,
            "predictions": predictions,
            "input_data": input_data,
            "recommendations": {
                "best_practices": "Use balanced fertilization, proper irrigation, and disease-resistant varieties",
                "expected_yield_range": f"{min(predictions.values()) * 0.9:.1f} - {max(predictions.values()) * 1.1:.1f} kg/ha"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# Disease detection endpoints
@app.post("/disease-detection/start")
async def start_disease_detection():
    """Start a new disease detection session"""
    import uuid
    session_id = str(uuid.uuid4())
    
    session = detection_api.start_diagnosis_session(session_id)
    
    return {
        "session_id": session_id,
        "question": {
            "id": session["question"].id,
            "text": session["question"].question_text,
            "options": session["question"].options,
            "type": session["question"].question_type.value
        },
        "progress": session["progress"],
        "total_questions": session["total_questions"]
    }

@app.post("/disease-detection/answer")
async def submit_disease_answer(request: DiseaseDetectionRequest):
    """Submit answer to disease detection question"""
    try:
        response = detection_api.submit_answer(
            request.session_id, 
            request.question_id, 
            request.answer
        )
        
        if "error" in response:
            raise HTTPException(status_code=400, detail=response["error"])
        
        result = {
            "success": response["success"],
            "progress": response["progress"],
            "completed": response["completed"]
        }
        
        if response["next_question"]:
            result["next_question"] = {
                "id": response["next_question"].id,
                "text": response["next_question"].question_text,
                "options": response["next_question"].options,
                "type": response["next_question"].question_type.value
            }
        
        if response.get("diagnosis"):
            result["diagnosis"] = response["diagnosis"]
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disease detection error: {str(e)}")

@app.get("/disease-detection/status/{session_id}")
async def get_detection_status(session_id: str):
    """Get disease detection session status"""
    status = detection_api.get_session_status(session_id)
    
    if "error" in status:
        raise HTTPException(status_code=404, detail=status["error"])
    
    return status

# Market prices endpoints
@app.get("/market-prices")
async def get_market_prices(district_id: Optional[int] = None, crop_id: Optional[int] = None):
    """Get market prices for crops"""
    # Mock market data
    prices = [
        {"crop_id": 1, "crop_name": "Rice", "district_id": 1, "district_name": "Khordha", "mandi_name": "Bhubaneswar Mandi", "price_per_quintal": 2100, "trend": "Increasing"},
        {"crop_id": 1, "crop_name": "Rice", "district_id": 2, "district_name": "Cuttack", "mandi_name": "Cuttack Mandi", "price_per_quintal": 2050, "trend": "Stable"},
        {"crop_id": 3, "crop_name": "Pigeon Pea", "district_id": 1, "district_name": "Khordha", "mandi_name": "Bhubaneswar Mandi", "price_per_quintal": 6500, "trend": "Increasing"},
        {"crop_id": 4, "crop_name": "Black Gram", "district_id": 2, "district_name": "Cuttack", "mandi_name": "Cuttack Mandi", "price_per_quintal": 7200, "trend": "Decreasing"},
        {"crop_id": 5, "crop_name": "Mustard", "district_id": 3, "district_name": "Puri", "mandi_name": "Puri Mandi", "price_per_quintal": 4800, "trend": "Stable"}
    ]
    
    if district_id:
        prices = [p for p in prices if p["district_id"] == district_id]
    
    if crop_id:
        prices = [p for p in prices if p["crop_id"] == crop_id]
    
    return {"prices": prices, "date": date.today()}

# Pest alerts endpoints
@app.get("/pest-alerts")
async def get_pest_alerts(district_id: Optional[int] = None):
    """Get pest alerts for districts"""
    alerts = [
        {"id": 1, "district_id": 1, "district_name": "Khordha", "pest_name": "Brown Plant Hopper", "severity": "Medium", "affected_crops": ["Rice"], "alert_date": date.today(), "recommended_action": "Apply neem-based pesticides and monitor field regularly"},
        {"id": 2, "district_id": 2, "district_name": "Cuttack", "pest_name": "Stem Borer", "severity": "High", "affected_crops": ["Rice"], "alert_date": date.today(), "recommended_action": "Use pheromone traps and apply recommended insecticides"},
        {"id": 3, "district_id": 3, "district_name": "Puri", "pest_name": "Leaf Folder", "severity": "Low", "affected_crops": ["Rice"], "alert_date": date.today(), "recommended_action": "Monitor and use biological control methods"}
    ]
    
    if district_id:
        alerts = [a for a in alerts if a["district_id"] == district_id]
    
    return {"alerts": alerts}

# Government schemes endpoints
@app.get("/government-schemes")
async def get_government_schemes():
    """Get available government schemes"""
    schemes = [
        {
            "id": 1,
            "name": "Pradhan Mantri Krishi Sinchai Yojana (PMKSY)",
            "description": "Scheme for irrigation and water conservation",
            "eligibility": "All farmers with land holdings",
            "benefits": "Subsidy up to 55% for irrigation equipment",
            "contact": "Local Agriculture Office"
        },
        {
            "id": 2,
            "name": "Soil Health Card Scheme",
            "description": "Free soil testing and health card for farmers",
            "eligibility": "All farmers",
            "benefits": "Free soil testing every 3 years",
            "contact": "Soil Testing Laboratory"
        },
        {
            "id": 3,
            "name": "Crop Insurance Scheme (PMFBY)",
            "description": "Pradhan Mantri Fasal Bima Yojana for crop insurance",
            "eligibility": "All loanee and non-loanee farmers",
            "benefits": "Insurance coverage for crop failures",
            "contact": "Bank Branch"
        }
    ]
    
    return {"schemes": schemes}

# Chatbot endpoints
@app.post("/chatbot/session")
async def create_chat_session(session: ChatSession):
    """Create a new chat session"""
    try:
        session_id = chatbot_api.create_session(session.user_id)
        return {
            "session_id": session_id,
            "message": "Chat session created successfully",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@app.post("/chatbot/message")
async def send_chat_message(message: ChatMessage):
    """Send message to chatbot and get response"""
    try:
        response = chatbot_api.send_message(message.session_id, message.message)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@app.get("/chatbot/history/{session_id}")
async def get_chat_history(session_id: str):
    """Get chat session history"""
    try:
        history = chatbot_api.get_session_history(session_id)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
