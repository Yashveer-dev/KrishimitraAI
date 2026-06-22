import axios from 'axios';

const API_BASE_URL = "http://13.207.152.124:8000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// District APIs
export const fetchDistricts = async () => {
  const response = await api.get('/districts');
  return response.data;
};

export const fetchWeatherData = async (districtId) => {
  const response = await api.get(`/districts/${districtId}/weather`);
  return response.data;
};

export const fetchSoilHealth = async (districtId) => {
  const response = await api.get(`/districts/${districtId}/soil`);
  return response.data;
};

// Yield Prediction APIs
export const predictYield = async (predictionData) => {
  try {
    const response = await api.post('/predict-yield', predictionData);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Disease Detection APIs
export const startDiseaseDetection = async () => {
  const response = await api.post('/disease-detection/start');
  return response.data;
};

export const submitDiseaseAnswer = async (params) => {
  const payload = {
    session_id: params.session_id,
    question_id: parseInt(params.question_id),
    answer: params.answer,
  };
  const response = await api.post('/disease-detection/answer', payload);
  return response.data;
};

export const getDetectionStatus = async (sessionId) => {
  const response = await api.get(`/disease-detection/status/${sessionId}`);
  return response.data;
};

// Market Prices APIs
export const fetchMarketPrices = async (districtId = null, cropId = null) => {
  const params = {};
  if (districtId) params.district_id = districtId;
  if (cropId) params.crop_id = cropId;
  
  const response = await api.get('/market-prices', { params });
  return response.data;
};

// Pest Alerts APIs
export const fetchPestAlerts = async (districtId = null) => {
  const params = {};
  if (districtId) params.district_id = districtId;
  
  const response = await api.get('/pest-alerts', { params });
  return response.data;
};

// Government Schemes APIs
export const fetchGovernmentSchemes = async () => {
  const response = await api.get('/government-schemes');
  return response.data;
};

// Chatbot APIs
export const createChatSession = async (userId) => {
  try {
    const payload = { user_id: userId };
    const response = await api.post('/chatbot/session', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendChatMessage = async (params) => {
  try {
    const payload = {
      session_id: params.session_id,
      message: params.message,
    };
    const response = await api.post('/chatbot/message', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChatHistory = async (sessionId) => {
  const response = await api.get(`/chatbot/history/${sessionId}`);
  return response.data;
};

// Health Check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
