import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { MapPin, Cloud, Droplets, Thermometer, Wind, Eye, Filter } from 'lucide-react';
import { fetchDistricts, fetchWeatherData, fetchSoilHealth } from '../services/api';

const DistrictCard = ({ district, weather, soil, onViewDetails }) => (
  <div className="card hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{district.name}</h3>
        <p className="text-sm text-gray-500">Code: {district.code}</p>
      </div>
      <button
        onClick={() => onViewDetails(district)}
        className="text-primary-600 hover:text-primary-700 flex items-center space-x-1 text-sm"
      >
        <Eye className="h-4 w-4" />
        <span>View Details</span>
      </button>
    </div>

    {/* Weather Summary */}
    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
      <div className="flex items-center space-x-2 mb-2">
        <Cloud className="h-4 w-4 text-blue-600" />
        <h4 className="text-sm font-medium text-blue-900">Weather</h4>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center space-x-1">
          <Thermometer className="h-3 w-3 text-blue-600" />
          <span>{weather?.temperature_max || '--'}°C</span>
        </div>
        <div className="flex items-center space-x-1">
          <Droplets className="h-3 w-3 text-blue-600" />
          <span>{weather?.humidity || '--'}%</span>
        </div>
        <div className="flex items-center space-x-1">
          <Wind className="h-3 w-3 text-blue-600" />
          <span>{weather?.wind_speed || '--'} km/h</span>
        </div>
        <div className="flex items-center space-x-1">
          <Droplets className="h-3 w-3 text-blue-600" />
          <span>{weather?.rainfall || '--'} mm</span>
        </div>
      </div>
    </div>

    {/* Soil Health Summary */}
    <div className="p-3 bg-green-50 rounded-lg">
      <div className="flex items-center space-x-2 mb-2">
        <div className="h-4 w-4 bg-green-600 rounded-full"></div>
        <h4 className="text-sm font-medium text-green-900">Soil Health</h4>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-600">N: </span>
          <span className="font-medium">{soil?.nitrogen || '--'}</span>
        </div>
        <div>
          <span className="text-gray-600">P: </span>
          <span className="font-medium">{soil?.phosphorus || '--'}</span>
        </div>
        <div>
          <span className="text-gray-600">K: </span>
          <span className="font-medium">{soil?.potassium || '--'}</span>
        </div>
        <div>
          <span className="text-gray-600">pH: </span>
          <span className="font-medium">{soil?.ph || '--'}</span>
        </div>
      </div>
    </div>
  </div>
);

const DistrictDetailModal = ({ district, weather, soil, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{district.name} District</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Weather Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Cloud className="h-5 w-5 text-blue-600" />
              <span>Weather Information</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Max Temperature</p>
                <p className="text-lg font-semibold text-blue-900">{weather?.temperature_max}°C</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Min Temperature</p>
                <p className="text-lg font-semibold text-blue-900">{weather?.temperature_min}°C</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Humidity</p>
                <p className="text-lg font-semibold text-blue-900">{weather?.humidity}%</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Rainfall</p>
                <p className="text-lg font-semibold text-blue-900">{weather?.rainfall} mm</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Wind Speed</p>
                <p className="text-lg font-semibold text-blue-900">{weather?.wind_speed} km/h</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Conditions</p>
                <p className="text-lg font-semibold text-blue-900">{weather?.weather_condition}</p>
              </div>
            </div>
          </div>

          {/* Soil Health Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <div className="h-5 w-5 bg-green-600 rounded-full"></div>
              <span>Soil Health Analysis</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Nitrogen (N)</p>
                <p className="text-lg font-semibold text-green-900">{soil?.nitrogen} kg/ha</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Phosphorus (P)</p>
                <p className="text-lg font-semibold text-green-900">{soil?.phosphorus} kg/ha</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Potassium (K)</p>
                <p className="text-lg font-semibold text-green-900">{soil?.potassium} kg/ha</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">pH Level</p>
                <p className="text-lg font-semibold text-green-900">{soil?.ph}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Moisture</p>
                <p className="text-lg font-semibold text-green-900">{soil?.moisture_percentage}%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Organic Matter</p>
                <p className="text-lg font-semibold text-green-900">{soil?.organic_matter}%</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Soil Type</p>
              <p className="text-lg font-semibold text-yellow-900">{soil?.soil_type}</p>
            </div>
          </div>

          {/* District Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">District Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">District Code</p>
                <p className="text-lg font-semibold text-gray-900">{district.code}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Area</p>
                <p className="text-lg font-semibold text-gray-900">{district.area_hectares?.toLocaleString()} hectares</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Latitude</p>
                <p className="text-lg font-semibold text-gray-900">{district.latitude}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Longitude</p>
                <p className="text-lg font-semibold text-gray-900">{district.longitude}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DistrictTracking = () => {
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  // Fetch districts
  const { data: districtsData } = useQuery('districts', fetchDistricts);
  
  // Fetch weather and soil data for all districts
  const { data: weatherData } = useQuery(
    ['weather', 'all'],
    async () => {
      if (!districtsData?.districts) return {};
      const weatherPromises = districtsData.districts.map(district =>
        fetchWeatherData(district.id).catch(() => ({ weather: null }))
      );
      const results = await Promise.all(weatherPromises);
      return results.reduce((acc, result, index) => {
        acc[districtsData.districts[index].id] = result?.weather;
        return acc;
      }, {});
    },
    { enabled: !!districtsData?.districts }
  );

  const { data: soilData } = useQuery(
    ['soil', 'all'],
    async () => {
      if (!districtsData?.districts) return {};
      const soilPromises = districtsData.districts.map(district =>
        fetchSoilHealth(district.id).catch(() => ({ soil_health: null }))
      );
      const results = await Promise.all(soilPromises);
      return results.reduce((acc, result, index) => {
        acc[districtsData.districts[index].id] = result?.soil_health;
        return acc;
      }, {});
    },
    { enabled: !!districtsData?.districts }
  );

  const handleViewDetails = (district) => {
    setSelectedDistrict(district);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDistrict(null);
  };

  // Filter districts
  const filteredDistricts = districtsData?.districts?.filter(district => {
    if (filter === 'all') return true;
    if (filter === 'high_rainfall') {
      const weather = weatherData?.[district.id];
      return weather && weather.rainfall > 5;
    }
    if (filter === 'good_soil') {
      const soil = soilData?.[district.id];
      return soil && soil.ph >= 6.5 && soil.ph <= 7.5;
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">District Tracking</h1>
        <p className="text-gray-600 mt-2">Monitor weather and soil health across Odisha districts</p>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Filter:</span>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Districts</option>
          <option value="high_rainfall">High Rainfall Areas</option>
          <option value="good_soil">Optimal Soil pH</option>
        </select>
      </div>

      {/* Districts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDistricts.map((district) => (
          <DistrictCard
            key={district.id}
            district={district}
            weather={weatherData?.[district.id]}
            soil={soilData?.[district.id]}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {/* Detail Modal */}
      <DistrictDetailModal
        district={selectedDistrict}
        weather={selectedDistrict ? weatherData?.[selectedDistrict.id] : null}
        soil={selectedDistrict ? soilData?.[selectedDistrict.id] : null}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default DistrictTracking;
