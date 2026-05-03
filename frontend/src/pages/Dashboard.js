import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Cloud, 
  Droplets, 
  Thermometer, 
  Wind, 
  TrendingUp, 
  AlertTriangle,
  MapPin,
  Users,
  Leaf,
  DollarSign,
  MessageCircle
} from 'lucide-react';
import { fetchDistricts, fetchWeatherData, fetchPestAlerts, fetchMarketPrices } from '../services/api';

const StatCard = ({ icon: Icon, title, value, subtitle, colorClass = "primary" }) => (
  <div className={`stat-card bg-gradient-to-r from-${colorClass}-500 to-${colorClass}-600 animate-fade-in`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium">{title}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
        <p className="text-white/70 text-xs">{subtitle}</p>
      </div>
      <Icon className="h-8 w-8 text-white/50 animate-float" />
    </div>
  </div>
);

const WeatherWidget = ({ weather }) => (
  <div className="weather-card animate-slide-in">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">Today's Weather</h3>
      <Cloud className="h-6 w-6 text-white/70 animate-float" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center space-x-2">
        <Thermometer className="h-4 w-4 text-white/70" />
        <div>
          <p className="text-sm text-white/70">Temperature</p>
          <p className="font-semibold">{weather.temperature_max}°C / {weather.temperature_min}°C</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Droplets className="h-4 w-4 text-white/70" />
        <div>
          <p className="text-sm text-white/70">Humidity</p>
          <p className="font-semibold">{weather.humidity}%</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Wind className="h-4 w-4 text-white/70" />
        <div>
          <p className="text-sm text-white/70">Wind Speed</p>
          <p className="font-semibold">{weather.wind_speed} km/h</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Droplets className="h-4 w-4 text-white/70" />
        <div>
          <p className="text-sm text-white/70">Rainfall</p>
          <p className="font-semibold">{weather.rainfall} mm</p>
        </div>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-white/20">
      <p className="text-sm text-white/80">
        <span className="font-medium">Conditions:</span> {weather.weather_condition}
      </p>
    </div>
  </div>
);

const AlertCard = ({ alert }) => {
  const getSeverityClass = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'alert-high';
      case 'medium': return 'alert-medium';
      case 'low': return 'alert-low';
      default: return 'alert-low';
    }
  };

  return (
    <div className={getSeverityClass(alert.severity)}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold">{alert.pest_name}</h4>
          <p className="text-sm mt-1">{alert.recommended_action}</p>
          <div className="flex items-center space-x-4 mt-2 text-xs">
            <span className="font-medium">District: {alert.district_name}</span>
            <span>Severity: {alert.severity}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MarketPriceCard = ({ price }) => (
  <div className="card animate-slide-in">
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-semibold text-gray-900">{price.crop_name}</h4>
        <p className="text-sm text-gray-500">{price.mandi_name}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-gray-900">₹{price.price_per_quintal}</p>
        <p className={`text-sm font-medium ${
          price.trend === 'Increasing' ? 'text-green-600' : 
          price.trend === 'Decreasing' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {price.trend}
        </p>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();

  // Fetch data
  const { data: districts } = useQuery('districts', fetchDistricts);
  const { data: weatherData } = useQuery(['weather', 1], () => fetchWeatherData(1));
  const { data: pestAlerts } = useQuery('pestAlerts', fetchPestAlerts);
  const { data: marketPrices } = useQuery('marketPrices', fetchMarketPrices);

  // Quick action handlers
  const handlePredictYield = () => {
    navigate('/yield-prediction');
  };

  const handleCheckDisease = () => {
    navigate('/disease-detection');
  };

  const handleViewDistricts = () => {
    // Show districts information in an alert or modal
    if (districts && districts.districts) {
      const districtList = districts.districts.map(d => 
        `${d.name} (${d.code}) - ID: ${d.id}`
      ).join('\n');
      alert(`Available Districts:\n\n${districtList}`);
    } else {
      alert('Loading districts information...');
    }
  };

  const handleAskAssistant = () => {
    // Navigate to chatbot page
    window.location.href = '/chatbot';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to KrishimitraAI - Your Smart Farming Assistant</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={MapPin}
          title="Districts Covered"
          value={districts?.districts?.length || 10}
          subtitle="Across Odisha"
          colorClass="primary"
        />
        <StatCard
          icon={Users}
          title="Active Farmers"
          value="2,847"
          subtitle="This month"
          colorClass="secondary"
        />
        <StatCard
          icon={Leaf}
          title="Crop Varieties"
          value="8"
          subtitle="Tracked"
          colorClass="primary"
        />
        <StatCard
          icon={DollarSign}
          title="Market Updates"
          value="Live"
          subtitle="Real-time prices"
          colorClass="secondary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <div className="lg:col-span-1">
          {weatherData && <WeatherWidget weather={weatherData.weather} />}
        </div>

        {/* Alerts Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Pest Alerts</h2>
            <span className="text-sm text-gray-500">Last 24 hours</span>
          </div>
          <div className="space-y-3">
            {pestAlerts?.alerts?.slice(0, 3).map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      </div>

      {/* Market Prices Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Latest Market Prices</h2>
          <span className="text-sm text-gray-500">Updated today</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketPrices?.prices?.slice(0, 6).map((price, index) => (
            <MarketPriceCard key={index} price={price} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={handlePredictYield}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Predict Yield</span>
          </button>
          <button 
            onClick={handleCheckDisease}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Check Disease</span>
          </button>
          <button 
            onClick={handleViewDistricts}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <MapPin className="h-4 w-4" />
            <span>View Districts</span>
          </button>
          <button 
            onClick={handleAskAssistant}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Ask Assistant</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
