-- KrishimitraAI Database Schema
-- SIH25076 Agritech Platform

-- Districts table for Odisha state
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    area_hectares DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather data for each district
CREATE TABLE weather_data (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES districts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    temperature_max DECIMAL(5, 2),
    temperature_min DECIMAL(5, 2),
    humidity DECIMAL(5, 2),
    rainfall DECIMAL(7, 2),
    wind_speed DECIMAL(5, 2),
    weather_condition VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(district_id, date)
);

-- Soil health metrics for each district
CREATE TABLE soil_health (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES districts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    nitrogen_level DECIMAL(5, 2), -- N value in kg/ha
    phosphorus_level DECIMAL(5, 2), -- P value in kg/ha
    potassium_level DECIMAL(5, 2), -- K value in kg/ha
    ph_level DECIMAL(4, 2),
    moisture_percentage DECIMAL(5, 2),
    organic_matter DECIMAL(5, 2), -- percentage
    soil_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(district_id, date)
);

-- Crop types and varieties
CREATE TABLE crop_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    category VARCHAR(50), -- Cereal, Vegetable, Fruit, Pulse, etc.
    growing_season VARCHAR(20), -- Kharif, Rabi, Zaid
    typical_yield_range_min DECIMAL(8, 2),
    typical_yield_range_max DECIMAL(8, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crop diseases
CREATE TABLE crop_diseases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    affected_crop_id INTEGER REFERENCES crop_types(id),
    symptoms TEXT,
    cause VARCHAR(200),
    severity_level VARCHAR(20), -- Low, Medium, High, Critical
    treatment_recommendations TEXT,
    prevention_measures TEXT,
    government_subsidy_eligible BOOLEAN DEFAULT FALSE,
    subsidy_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disease detection Q&A questions
CREATE TABLE disease_questions (
    id SERIAL PRIMARY KEY,
    question_text VARCHAR(500) NOT NULL,
    question_type VARCHAR(50), -- symptom, environmental, pest, timeline
    options TEXT, -- JSON array of possible answers
    weight DECIMAL(3, 2), -- importance weight for scoring
    order_index INTEGER NOT NULL
);

-- Question to disease mapping
CREATE TABLE question_disease_mapping (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES disease_questions(id),
    disease_id INTEGER REFERENCES crop_diseases(id),
    expected_answer VARCHAR(200), -- what answer indicates this disease
    confidence_score DECIMAL(3, 2)
);

-- Crop yield prediction training data
CREATE TABLE crop_yield_data (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES districts(id),
    crop_id INTEGER REFERENCES crop_types(id),
    season VARCHAR(20),
    year INTEGER NOT NULL,
    soil_nitrogen DECIMAL(5, 2),
    soil_phosphorus DECIMAL(5, 2),
    soil_potassium DECIMAL(5, 2),
    soil_ph DECIMAL(4, 2),
    soil_moisture DECIMAL(5, 2),
    avg_temperature DECIMAL(5, 2),
    total_rainfall DECIMAL(7, 2),
    humidity DECIMAL(5, 2),
    disease_affected BOOLEAN DEFAULT FALSE,
    disease_id INTEGER REFERENCES crop_diseases(id),
    actual_yield DECIMAL(8, 2), -- kg per hectare
    area_planted DECIMAL(8, 2), -- hectares
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market prices for crops
CREATE TABLE market_prices (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crop_types(id),
    district_id INTEGER REFERENCES districts(id),
    date DATE NOT NULL,
    mandi_name VARCHAR(100),
    price_per_quintal DECIMAL(8, 2), -- INR per quintal
    price_trend VARCHAR(20), -- Increasing, Decreasing, Stable
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(crop_id, district_id, date, mandi_name)
);

-- Farmer queries for chatbot training
CREATE TABLE farmer_queries (
    id SERIAL PRIMARY KEY,
    query_text TEXT NOT NULL,
    language VARCHAR(10), -- en, or
    query_category VARCHAR(50), -- weather, disease, market, general
    response_text TEXT,
    confidence_score DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pest alerts
CREATE TABLE pest_alerts (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES districts(id),
    pest_name VARCHAR(100) NOT NULL,
    severity_level VARCHAR(20),
    affected_crops TEXT, -- JSON array of crop names
    alert_date DATE NOT NULL,
    recommended_action TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Government schemes and subsidies
CREATE TABLE government_schemes (
    id SERIAL PRIMARY KEY,
    scheme_name VARCHAR(200) NOT NULL,
    description TEXT,
    eligibility_criteria TEXT,
    benefits TEXT,
    application_process TEXT,
    contact_info TEXT,
    valid_from DATE,
    valid_until DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample Odisha districts
INSERT INTO districts (name, code, latitude, longitude, area_hectares) VALUES
('Khordha', 'KH', 20.1806, 85.6789, 289500),
('Cuttack', 'CT', 20.4625, 85.8830, 393200),
('Puri', 'PR', 19.8145, 85.8312, 305500),
('Balasore', 'BL', 21.4941, 86.9346, 363400),
('Sundargarh', 'SG', 22.1204, 84.3953, 537100),
('Ganjam', 'GM', 19.3821, 85.0699, 813900),
('Angul', 'AN', 20.8509, 85.0985, 623200),
('Bolangir', 'BLR', 20.7016, 83.5178, 657500),
('Kalahandi', 'KL', 19.8486, 83.0189, 792000),
('Koraput', 'KP', 18.7801, 82.8589, 837900);

-- Insert sample crop types
INSERT INTO crop_types (name, variety, category, growing_season, typical_yield_range_min, typical_yield_range_max) VALUES
('Rice', 'Swarna', 'Cereal', 'Kharif', 2000, 3500),
('Rice', 'Pooja', 'Cereal', 'Rabi', 2500, 4000),
('Pigeon Pea', 'Asha', 'Pulse', 'Kharif', 800, 1200),
('Black Gram', 'PU-31', 'Pulse', 'Rabi', 600, 900),
('Mustard', 'Varuna', 'Oilseed', 'Rabi', 1000, 1500),
('Sugarcane', 'Co-0238', 'Cash Crop', 'Perennial', 60000, 80000),
('Tomato', 'Pusa Ruby', 'Vegetable', 'Rabi', 15000, 25000),
('Brinjal', 'Pusa Kranti', 'Vegetable', 'Kharif', 20000, 35000);
