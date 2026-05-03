# KrishimitraAI - Product Requirements Document

## 1. Project Overview

### 1.1 Project Name
KrishimitraAI - Smart Farming Assistant

### 1.2 Project Code
SIH25076 - Smart India Hackathon 2025

### 1.3 Executive Summary
KrishimitraAI is an AI-powered agricultural advisory platform designed specifically for Odisha farmers. The platform leverages machine learning, real-time data, and bilingual support to provide comprehensive farming assistance, including crop yield prediction, disease detection, market intelligence, and weather forecasting.

### 1.4 Vision
To empower Odisha farmers with intelligent, accessible, and actionable agricultural insights through cutting-edge AI technology, ultimately improving crop yields, reducing losses, and increasing farmer income.

### 1.5 Mission
- Provide real-time, data-driven agricultural advice
- Enable early disease detection and prevention
- Offer accurate yield predictions using ML models
- Deliver market intelligence for better selling decisions
- Support bilingual communication (English & Odia)
- Make advanced farming technology accessible to all farmers

## 2. User Personas

### 2.1 Primary Users

#### Small/Marginal Farmers
- **Age:** 25-65 years
- **Education:** Primary to secondary school
- **Digital Literacy:** Basic to moderate
- **Language:** Primarily Odia, some English
- **Needs:** Simple, actionable advice, weather updates, disease alerts
- **Pain Points:** Limited access to expert advice, weather uncertainties, market price volatility

#### Medium/Large Scale Farmers
- **Age:** 30-60 years
- **Education:** Secondary to college
- **Digital Literacy:** Moderate to advanced
- **Language:** Both English and Odia
- **Needs:** Detailed analytics, yield optimization, market trends
- **Pain Points:** Complex decision-making, resource optimization, market timing

#### Agricultural Officers/Extension Workers
- **Age:** 25-50 years
- **Education:** Graduate and above
- **Digital Literacy:** Advanced
- **Language:** Both English and Odia
- **Needs:** Data for farmer counseling, regional insights, monitoring tools
- **Pain Points:** Limited reach, data collection challenges, personalized advice delivery

### 2.2 Secondary Users

#### Agri-Business Professionals
- Input suppliers, traders, mandi operators
- Need market intelligence, trend analysis
- Use data for business planning

#### Government Officials
- Policy makers, agriculture department staff
- Need regional data for planning and monitoring
- Use insights for scheme implementation

## 3. Core Features

### 3.1 Dashboard
**Priority:** High
**Description:** Central hub providing overview of all farming metrics and quick access to key features.

**Key Features:**
- Real-time weather display with temperature, humidity, rainfall
- Crop health alerts and disease warnings
- Market price trends for major crops
- Quick action buttons for main features
- District-wise agricultural statistics
- Personalized recommendations based on location

**User Stories:**
- As a farmer, I want to see today's weather at a glance so I can plan my farming activities
- As a farmer, I want to receive disease alerts for my area so I can take preventive measures
- As an agricultural officer, I want to see regional statistics to monitor crop health

### 3.2 Crop Yield Prediction
**Priority:** High
**Description:** ML-powered yield prediction using Random Forest, XGBoost, and Ensemble models.

**Key Features:**
- Input parameters: crop type, soil health, weather conditions, farming practices
- Multiple model predictions with confidence scores
- Financial analysis with cost-benefit calculations
- Historical yield trends and comparisons
- Recommendations for yield optimization

**User Stories:**
- As a farmer, I want to predict my crop yield so I can plan storage and selling
- As a farmer, I want financial analysis to understand potential profits
- As an agricultural officer, I want yield predictions to advise farmers on best practices

### 3.3 Disease Detection
**Priority:** High
**Description:** Interactive Q&A-based disease identification system with expert knowledge base.

**Key Features:**
- Step-by-step symptom identification questionnaire
- Image-based disease recognition (future enhancement)
- Treatment recommendations and preventive measures
- Disease database with common crop ailments
- Integration with local agricultural experts

**User Stories:**
- As a farmer, I want to identify crop diseases early so I can take timely action
- As a farmer, I want treatment recommendations so I can save my crops
- As an agricultural officer, I want to help farmers diagnose diseases accurately

### 3.4 District Tracking
**Priority:** Medium
**Description:** Regional monitoring system for weather and soil health across Odisha districts.

**Key Features:**
- Interactive district-wise weather monitoring
- Soil health analysis and recommendations
- Comparative analysis between districts
- Historical weather and soil data
- Filter options for specific conditions (high rainfall, optimal pH)

**User Stories:**
- As a farmer, I want to compare conditions across districts so I can make informed decisions
- As an agricultural officer, I want to monitor regional conditions for better planning
- As a researcher, I want access to regional agricultural data for analysis

### 3.5 Market Prices
**Priority:** High
**Description:** Real-time market price information from mandis across Odisha with trend analysis.

**Key Features:**
- Live market prices for major crops
- Price trend analysis and predictions
- Mandi-wise price comparisons
- Market insights and selling tips
- Price alerts and notifications
- Historical price data visualization

**User Stories:**
- As a farmer, I want to know current market prices so I can decide when to sell
- As a farmer, I want price trends so I can plan my selling strategy
- As a trader, I want market intelligence for business planning

### 3.6 Bilingual Chatbot
**Priority:** High
**Description:** AI-powered conversational assistant supporting English and Odia languages.

**Key Features:**
- Natural language processing for agricultural queries
- Automatic language detection
- Context-aware responses
- Follow-up question suggestions
- Conversation history and session management
- Integration with all platform features

**User Stories:**
- As a farmer, I want to ask questions in my native language so I can get help easily
- As a farmer, I want instant answers to farming questions so I can make quick decisions
- As an agricultural officer, I want to use the chatbot to provide consistent advice

### 3.7 Government Schemes
**Priority:** Medium
**Description:** Information hub for government agricultural schemes and subsidies.

**Key Features:**
- Comprehensive scheme database
- Eligibility criteria and benefits
- Application process guidance
- Contact information for scheme offices
- Personalized scheme recommendations

**User Stories:**
- As a farmer, I want to know about available schemes so I can get government benefits
- As a farmer, I want help with scheme applications so I don't miss opportunities
- As an agricultural officer, I want to promote relevant schemes to farmers

## 4. Technical Architecture

### 4.1 System Architecture

#### Frontend
- **Framework:** React.js with modern UI components
- **Styling:** Tailwind CSS for responsive design
- **State Management:** React Query for data fetching and caching
- **Routing:** React Router DOM for navigation
- **HTTP Client:** Axios for API communication

#### Backend
- **Framework:** FastAPI (Python) for high-performance API
- **Database:** PostgreSQL for structured data storage
- **Machine Learning:** Scikit-learn, XGBoost for ML models
- **Data Processing:** Pandas, NumPy for data manipulation

#### Deployment
- **Frontend:** Vercel/Netlify for static hosting
- **Backend:** AWS/Azure for scalable deployment
- **Database:** Managed database service
- **API Gateway:** AWS API Gateway for API management

### 4.2 API Architecture

#### Core Endpoints
- **Health Check:** `GET /health`
- **Districts:** `GET /districts`, `GET /districts/{id}/weather`, `GET /districts/{id}/soil`
- **Yield Prediction:** `POST /predict-yield`
- **Disease Detection:** `POST /disease-detection/start`, `POST /disease-detection/answer`
- **Market Prices:** `GET /market-prices`
- **Chatbot:** `POST /chatbot/session`, `POST /chatbot/message`, `GET /chatbot/history/{session_id}`
- **Government Schemes:** `GET /government-schemes`

#### Data Models
- **District:** ID, name, code, coordinates, area
- **Weather:** Temperature, humidity, rainfall, wind speed, conditions
- **Soil Health:** NPK values, pH, moisture, organic matter
- **Yield Prediction:** Crop type, parameters, predictions, confidence
- **Market Price:** Crop, mandi, price, trend, timestamp
- **Chat Session:** Session ID, user ID, conversation history

### 4.3 Machine Learning Models

#### Yield Prediction Models
- **Random Forest:** Ensemble decision trees for robust predictions
- **XGBoost:** Gradient boosting for high accuracy
- **Ensemble Model:** Combines multiple models for optimal results
- **Features:** Weather data, soil health, historical yields, farming practices

#### Disease Detection Algorithm
- **Rule-based Expert System:** Symptom-based diagnosis
- **Knowledge Base:** Disease symptoms, treatments, preventive measures
- **Confidence Scoring:** Reliability assessment for recommendations
- **Integration:** Links to treatment resources and experts

#### Chatbot Intelligence
- **Language Detection:** Automatic English/Odia identification
- **Intent Classification:** Query categorization (weather, disease, market, general)
- **Response Generation:** Context-aware, bilingual responses
- **Session Management:** Conversation history and context retention

## 5. Data Requirements

### 5.1 Data Sources

#### Primary Data
- **Weather Data:** OpenWeatherMap API for real-time weather information
- **Soil Data:** Local agricultural department soil health reports
- **Market Data:** Mandi price feeds and agricultural market data
- **Crop Data:** Agricultural department crop statistics

#### Secondary Data
- **Historical Data:** Past weather patterns, yield records, market trends
- **Expert Knowledge:** Agricultural expert inputs for disease detection
- **Government Data:** Scheme information, agricultural policies

### 5.2 Data Privacy & Security
- **User Data:** Anonymized user IDs, no personal information collection
- **Session Data:** Temporary chat sessions, auto-expiration after 24 hours
- **Location Data:** District-level data only, no precise GPS coordinates
- **Compliance:** GDPR and data protection regulations adherence

## 6. Success Metrics

### 6.1 User Engagement Metrics
- **Daily Active Users:** Target 1,000+ farmers within 6 months
- **Session Duration:** Average 5+ minutes per session
- **Feature Usage:** 70%+ users utilizing yield prediction and chatbot
- **Return Rate:** 50%+ weekly active users

### 6.2 Business Impact Metrics
- **Yield Improvement:** 10-15% increase in predicted vs actual yields
- **Disease Detection:** 80%+ accuracy in disease identification
- **Market Timing:** 20% improvement in selling price timing
- **User Satisfaction:** 4.5+ star rating from user feedback

### 6.3 Technical Performance Metrics
- **API Response Time:** <500ms for all endpoints
- **Uptime:** 99.9% availability
- **Mobile Responsiveness:** 100% mobile-friendly interface
- **Load Handling:** Support 10,000+ concurrent users

## 7. Development Roadmap

### 7.1 Phase 1: MVP (Current - Completed)
- ✅ Basic dashboard with weather and alerts
- ✅ Yield prediction with ML models
- ✅ Disease detection Q&A system
- ✅ Market price monitoring
- ✅ Bilingual chatbot
- ✅ District tracking system

### 7.2 Phase 2: Enhanced Features (Next 3 months)
- **Image-based Disease Detection:** Computer vision for plant disease identification
- **Advanced Analytics:** Predictive analytics for market trends
- **Mobile App:** Native Android app for better accessibility
- **Offline Support:** Critical features available without internet
- **Voice Input:** Voice-based interaction in both languages

### 7.3 Phase 3: Advanced AI (6-12 months)
- **Precision Agriculture:** GPS-based field analysis
- **IoT Integration:** Sensor data from smart farming devices
- **AI Recommendations:** Advanced crop management suggestions
- **Supply Chain Integration:** Direct farmer-to-buyer connections
- **Multi-state Expansion:** Expand to other Indian states

## 8. Risk Assessment

### 8.1 Technical Risks
- **Data Quality:** Inconsistent or incomplete agricultural data
- **Model Accuracy:** ML models may not perform well in all conditions
- **Scalability:** Performance issues with high user load
- **Integration:** Third-party API dependencies

### 8.2 Business Risks
- **User Adoption:** Farmers may be resistant to technology adoption
- **Competition:** Similar platforms from established agri-tech companies
- **Regulatory:** Changes in government policies affecting data access
- **Funding:** Sustainable revenue model development

### 8.3 Mitigation Strategies
- **Data Validation:** Multiple data sources and quality checks
- **Model Testing:** Continuous validation with real-world data
- **Infrastructure:** Scalable cloud architecture with monitoring
- **User Education:** Comprehensive onboarding and support

## 9. Compliance & Standards

### 9.1 Technical Standards
- **Web Standards:** HTML5, CSS3, JavaScript ES6+
- **API Standards:** RESTful API design with OpenAPI documentation
- **Security Standards:** HTTPS, OWASP security guidelines
- **Accessibility:** WCAG 2.1 AA compliance for inclusive design

### 9.2 Regulatory Compliance
- **Data Protection:** User privacy and data security regulations
- **Agricultural Standards:** Compliance with local agricultural data policies
- **Financial Regulations:** Any financial advice compliance requirements
- **Content Standards:** Agricultural information accuracy verification

## 10. Appendices

### 10.1 Glossary
- **Mandi:** Local agricultural marketplace in India
- **Kisan:** Farmer in Hindi/Odia
- **Rabi:** Winter cropping season in India
- **Kharif:** Monsoon cropping season in India
- **NPK:** Nitrogen, Phosphorus, Potassium - key soil nutrients

### 10.2 References
- **SIH25076:** Smart India Hackathon 2025 project code
- **Odisha Agriculture Department:** Official agricultural statistics and policies
- **ICAR:** Indian Council of Agricultural Research guidelines
- **Digital India:** National digital transformation initiative

### 10.3 Contact Information
- **Project Team:** KrishimitraAI Development Team
- **Technical Lead:** [Contact details]
- **Product Manager:** [Contact details]
- **Support:** [Support email/phone]

---

**Document Version:** 1.0
**Last Updated:** May 3, 2026
**Next Review:** June 3, 2026
**Status:** Production Ready
