from sqlalchemy import create_engine, Column, Integer, String, Float, Date, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

Base = declarative_base()

class District(Base):
    __tablename__ = 'districts'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(10), nullable=False, unique=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    area_hectares = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    weather_data = relationship("WeatherData", back_populates="district")
    soil_health = relationship("SoilHealth", back_populates="district")
    crop_yield_data = relationship("CropYieldData", back_populates="district")
    market_prices = relationship("MarketPrice", back_populates="district")
    pest_alerts = relationship("PestAlert", back_populates="district")

class WeatherData(Base):
    __tablename__ = 'weather_data'
    
    id = Column(Integer, primary_key=True)
    district_id = Column(Integer, ForeignKey('districts.id', ondelete='CASCADE'))
    date = Column(Date, nullable=False)
    temperature_max = Column(Float)
    temperature_min = Column(Float)
    humidity = Column(Float)
    rainfall = Column(Float)
    wind_speed = Column(Float)
    weather_condition = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    district = relationship("District", back_populates="weather_data")

class SoilHealth(Base):
    __tablename__ = 'soil_health'
    
    id = Column(Integer, primary_key=True)
    district_id = Column(Integer, ForeignKey('districts.id', ondelete='CASCADE'))
    date = Column(Date, nullable=False)
    nitrogen_level = Column(Float)  # N value in kg/ha
    phosphorus_level = Column(Float)  # P value in kg/ha
    potassium_level = Column(Float)  # K value in kg/ha
    ph_level = Column(Float)
    moisture_percentage = Column(Float)
    organic_matter = Column(Float)  # percentage
    soil_type = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    district = relationship("District", back_populates="soil_health")

class CropType(Base):
    __tablename__ = 'crop_types'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    variety = Column(String(100))
    category = Column(String(50))  # Cereal, Vegetable, Fruit, Pulse, etc.
    growing_season = Column(String(20))  # Kharif, Rabi, Zaid
    typical_yield_range_min = Column(Float)
    typical_yield_range_max = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    diseases = relationship("CropDisease", back_populates="affected_crop")
    yield_data = relationship("CropYieldData", back_populates="crop")
    market_prices = relationship("MarketPrice", back_populates="crop")

class CropDisease(Base):
    __tablename__ = 'crop_diseases'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    affected_crop_id = Column(Integer, ForeignKey('crop_types.id'))
    symptoms = Column(Text)
    cause = Column(String(200))
    severity_level = Column(String(20))  # Low, Medium, High, Critical
    treatment_recommendations = Column(Text)
    prevention_measures = Column(Text)
    government_subsidy_eligible = Column(Boolean, default=False)
    subsidy_details = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    affected_crop = relationship("CropType", back_populates="diseases")
    question_mappings = relationship("QuestionDiseaseMapping", back_populates="disease")

class DiseaseQuestion(Base):
    __tablename__ = 'disease_questions'
    
    id = Column(Integer, primary_key=True)
    question_text = Column(String(500), nullable=False)
    question_type = Column(String(50))  # symptom, environmental, pest, timeline
    options = Column(Text)  # JSON array of possible answers
    weight = Column(Float)  # importance weight for scoring
    order_index = Column(Integer, nullable=False)
    
    # Relationships
    disease_mappings = relationship("QuestionDiseaseMapping", back_populates="question")

class QuestionDiseaseMapping(Base):
    __tablename__ = 'question_disease_mapping'
    
    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey('disease_questions.id'))
    disease_id = Column(Integer, ForeignKey('crop_diseases.id'))
    expected_answer = Column(String(200))  # what answer indicates this disease
    confidence_score = Column(Float)
    
    # Relationships
    question = relationship("DiseaseQuestion", back_populates="disease_mappings")
    disease = relationship("CropDisease", back_populates="question_mappings")

class CropYieldData(Base):
    __tablename__ = 'crop_yield_data'
    
    id = Column(Integer, primary_key=True)
    district_id = Column(Integer, ForeignKey('districts.id'))
    crop_id = Column(Integer, ForeignKey('crop_types.id'))
    season = Column(String(20))
    year = Column(Integer, nullable=False)
    soil_nitrogen = Column(Float)
    soil_phosphorus = Column(Float)
    soil_potassium = Column(Float)
    soil_ph = Column(Float)
    soil_moisture = Column(Float)
    avg_temperature = Column(Float)
    total_rainfall = Column(Float)
    humidity = Column(Float)
    disease_affected = Column(Boolean, default=False)
    disease_id = Column(Integer, ForeignKey('crop_diseases.id'))
    actual_yield = Column(Float)  # kg per hectare
    area_planted = Column(Float)  # hectares
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    district = relationship("District", back_populates="crop_yield_data")
    crop = relationship("CropType", back_populates="yield_data")

class MarketPrice(Base):
    __tablename__ = 'market_prices'
    
    id = Column(Integer, primary_key=True)
    crop_id = Column(Integer, ForeignKey('crop_types.id'))
    district_id = Column(Integer, ForeignKey('districts.id'))
    date = Column(Date, nullable=False)
    mandi_name = Column(String(100))
    price_per_quintal = Column(Float)  # INR per quintal
    price_trend = Column(String(20))  # Increasing, Decreasing, Stable
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    crop = relationship("CropType", back_populates="market_prices")
    district = relationship("District", back_populates="market_prices")

class FarmerQuery(Base):
    __tablename__ = 'farmer_queries'
    
    id = Column(Integer, primary_key=True)
    query_text = Column(Text, nullable=False)
    language = Column(String(10))  # en, or
    query_category = Column(String(50))  # weather, disease, market, general
    response_text = Column(Text)
    confidence_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class PestAlert(Base):
    __tablename__ = 'pest_alerts'
    
    id = Column(Integer, primary_key=True)
    district_id = Column(Integer, ForeignKey('districts.id'))
    pest_name = Column(String(100), nullable=False)
    severity_level = Column(String(20))
    affected_crops = Column(Text)  # JSON array of crop names
    alert_date = Column(Date, nullable=False)
    recommended_action = Column(Text)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    district = relationship("District", back_populates="pest_alerts")

class GovernmentScheme(Base):
    __tablename__ = 'government_schemes'
    
    id = Column(Integer, primary_key=True)
    scheme_name = Column(String(200), nullable=False)
    description = Column(Text)
    eligibility_criteria = Column(Text)
    benefits = Column(Text)
    application_process = Column(Text)
    contact_info = Column(Text)
    valid_from = Column(Date)
    valid_until = Column(Date)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
