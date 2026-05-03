import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { TrendingUp, Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { predictYield, fetchDistricts } from '../services/api';

const YieldPrediction = () => {
  const [formData, setFormData] = useState({
    crop_name: 'Rice',
    season: 'Kharif',
    crop_type: 'Cereal',
    district: 'Khordha',
    soil_nitrogen: 45.2,
    soil_phosphorus: 18.5,
    soil_potassium: 32.1,
    soil_ph: 6.8,
    soil_moisture: 65.5,
    historical_temperature: 32.5,
    historical_rainfall: 1250.0,
    historical_humidity: 78.2,
    potential_diseases: 'None'
  });

  const [predictions, setPredictions] = useState(null);

  // Fetch districts for dropdown
  const { data: districtsData } = useQuery('districts', fetchDistricts);

  // Mutation for yield prediction
  const predictionMutation = useMutation(predictYield, {
    onSuccess: (data) => {
      setPredictions(data);
    },
    onError: (error) => {
      console.error('Prediction error:', error);
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Map frontend field names to backend expected field names
    const backendFormData = {
      crop_name: formData.crop_name,
      season: formData.season,
      crop_type: formData.crop_type,
      district: formData.district,
      soil_nitrogen: formData.soil_nitrogen,
      soil_phosphorus: formData.soil_phosphorus,
      soil_potassium: formData.soil_potassium,
      soil_ph: formData.soil_ph,
      soil_moisture: formData.soil_moisture,
      historical_temperature: formData.historical_temperature,
      historical_rainfall: formData.historical_rainfall,
      historical_humidity: formData.historical_humidity,
      potential_diseases: formData.potential_diseases
    };
    
    predictionMutation.mutate(backendFormData);
  };

  const resetForm = () => {
    setFormData({
      crop_name: 'Rice',
      season: 'Kharif',
      crop_type: 'Cereal',
      district: 'Khordha',
      soil_nitrogen: 45.2,
      soil_phosphorus: 18.5,
      soil_potassium: 32.1,
      soil_ph: 6.8,
      soil_moisture: 65.5,
      historical_temperature: 32.5,
      historical_rainfall: 1250.0,
      historical_humidity: 78.2,
      potential_diseases: 'None'
    });
    setPredictions(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Yield Prediction</h1>
        <p className="text-gray-600 mt-2">AI-powered crop yield prediction based on soil, weather, and historical data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-primary-600" />
            <span>Input Parameters</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Crop Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Crop Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
                <select
                  name="crop_name"
                  value={formData.crop_name}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="Rice">Rice</option>
                  <option value="Pigeon Pea">Pigeon Pea</option>
                  <option value="Black Gram">Black Gram</option>
                  <option value="Mustard">Mustard</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Brinjal">Brinjal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                <select
                  name="season"
                  value={formData.season}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="Kharif">Kharif</option>
                  <option value="Rabi">Rabi</option>
                  <option value="Zaid">Zaid</option>
                  <option value="Perennial">Perennial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                <select
                  name="crop_type"
                  value={formData.crop_type}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="Cereal">Cereal</option>
                  <option value="Pulse">Pulse</option>
                  <option value="Oilseed">Oilseed</option>
                  <option value="Cash Crop">Cash Crop</option>
                  <option value="Vegetable">Vegetable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {districtsData?.districts?.map(district => (
                    <option key={district.id} value={district.name}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Soil Health */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Soil Health</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nitrogen (kg/ha)</label>
                  <input
                    type="number"
                    name="soil_nitrogen"
                    value={formData.soil_nitrogen}
                    onChange={handleInputChange}
                    step="0.1"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phosphorus (kg/ha)</label>
                  <input
                    type="number"
                    name="soil_phosphorus"
                    value={formData.soil_phosphorus}
                    onChange={handleInputChange}
                    step="0.1"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Potassium (kg/ha)</label>
                  <input
                    type="number"
                    name="soil_potassium"
                    value={formData.soil_potassium}
                    onChange={handleInputChange}
                    step="0.1"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">pH Level</label>
                  <input
                    type="number"
                    name="soil_ph"
                    value={formData.soil_ph}
                    onChange={handleInputChange}
                    step="0.1"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moisture (%)</label>
                  <input
                    type="number"
                    name="soil_moisture"
                    value={formData.soil_moisture}
                    onChange={handleInputChange}
                    step="0.1"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Weather Data */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Historical Weather</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avg Temperature (°C)</label>
                  <input
                    type="number"
                    name="historical_temperature"
                    value={formData.historical_temperature}
                    onChange={handleInputChange}
                    step="0.1"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Rainfall (mm)</label>
                  <input
                    type="number"
                    name="historical_rainfall"
                    value={formData.historical_rainfall}
                    onChange={handleInputChange}
                    step="0.1"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Humidity (%)</label>
                  <input
                    type="number"
                    name="historical_humidity"
                    value={formData.historical_humidity}
                    onChange={handleInputChange}
                    step="0.1"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Potential Diseases</label>
                  <select
                    name="potential_diseases"
                    value={formData.potential_diseases}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="None">None</option>
                    <option value="Bacterial Leaf Blight">Bacterial Leaf Blight</option>
                    <option value="Blast">Blast</option>
                    <option value="Sheath Blight">Sheath Blight</option>
                    <option value="Wilt">Wilt</option>
                    <option value="Yellow Mosaic">Yellow Mosaic</option>
                    <option value="Alternaria Blight">Alternaria Blight</option>
                    <option value="Red Rot">Red Rot</option>
                    <option value="Early Blight">Early Blight</option>
                    <option value="Late Blight">Late Blight</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={predictionMutation.isLoading}
                className="btn-primary flex-1"
              >
                {predictionMutation.isLoading ? 'Predicting...' : 'Predict Yield'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary flex-1"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {predictionMutation.isLoading && (
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="text-gray-600">Processing prediction...</span>
              </div>
            </div>
          )}

          {predictionMutation.error && (
            <div className="card border-red-200 bg-red-50">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-medium">Prediction Error</h3>
                  <p className="text-red-600 text-sm mt-1">
                    {predictionMutation.error.message || 'Failed to generate prediction. Please try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {predictions && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                  <span>Prediction Results</span>
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {predictions.predictions.RandomForest && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900">Random Forest Model</h4>
                        <p className="text-2xl font-bold text-blue-900">
                          {predictions.predictions.RandomForest.toFixed(2)} kg/ha
                        </p>
                      </div>
                    )}
                    
                    {predictions.predictions.XGBoost && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900">XGBoost Model</h4>
                        <p className="text-2xl font-bold text-green-900">
                          {predictions.predictions.XGBoost.toFixed(2)} kg/ha
                        </p>
                      </div>
                    )}
                    
                    {predictions.predictions.Ensemble && (
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900">Ensemble Prediction</h4>
                        <p className="text-2xl font-bold text-purple-900">
                          {predictions.predictions.Ensemble.toFixed(2)} kg/ha
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {predictions && (
            <>
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Financial Analysis</span>
                  </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900">Est. Revenue</h4>
                    <p className="text-green-800 text-sm mt-1">
                      ₹{(predictions.predictions.Ensemble * 25).toLocaleString('en-IN')} per hectare
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900">Est. Production Cost</h4>
                    <p className="text-yellow-800 text-sm mt-1">
                      ₹{(predictions.predictions.Ensemble * 8).toLocaleString('en-IN')} per hectare
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Est. Profit</h4>
                    <p className="text-blue-800 text-sm mt-1">
                      ₹{((predictions.predictions.Ensemble * 25) - (predictions.predictions.Ensemble * 8)).toLocaleString('en-IN')} per hectare
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900">Profit Margin</h4>
                    <p className="text-purple-800 text-sm mt-1">
                      {((((predictions.predictions.Ensemble * 25) - (predictions.predictions.Ensemble * 8)) / (predictions.predictions.Ensemble * 25)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Recommendations</span>
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900">Best Practices</h4>
                    <p className="text-green-800 text-sm mt-1">
                      {predictions.recommendations.best_practices}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Expected Yield Range</h4>
                    <p className="text-blue-800 text-sm mt-1">
                      {predictions.recommendations.expected_yield_range}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default YieldPrediction;
