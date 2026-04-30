import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { DollarSign, TrendingUp, TrendingDown, Minus, Filter, Search } from 'lucide-react';
import { fetchMarketPrices, fetchDistricts } from '../services/api';

const MarketPrices = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data
  const { data: districtsData } = useQuery('districts', fetchDistricts);
  const { data: marketPricesData } = useQuery(
    ['marketPrices', selectedDistrict, selectedCrop],
    () => fetchMarketPrices(selectedDistrict || null, selectedCrop || null),
    { enabled: true }
  );

  // Filter prices based on search term
  const filteredPrices = marketPricesData?.prices?.filter(price => 
    price.crop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    price.mandi_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    price.district_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getTrendIcon = (trend) => {
    switch (trend.toLowerCase()) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend.toLowerCase()) {
      case 'increasing':
        return 'text-green-600 bg-green-50';
      case 'decreasing':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const uniqueCrops = [...new Set(marketPricesData?.prices?.map(p => p.crop_name) || [])];
  const uniqueMandis = [...new Set(marketPricesData?.prices?.map(p => p.mandi_name) || [])];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Market Prices</h1>
        <p className="text-gray-600 mt-2">Real-time crop prices from mandis across Odisha</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="input-field"
            >
              <option value="">All Districts</option>
              {districtsData?.districts?.map(district => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="input-field"
            >
              <option value="">All Crops</option>
              {uniqueCrops.map(crop => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mandi</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="input-field"
            >
              <option value="">All Mandis</option>
              {uniqueMandis.map(mandi => (
                <option key={mandi} value={mandi}>
                  {mandi}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search crops, mandis..."
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Total Crops</p>
              <p className="text-white text-2xl font-bold">{uniqueCrops.length}</p>
            </div>
            <DollarSign className="h-8 w-8 text-white/50" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-r from-green-500 to-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Highest Price</p>
              <p className="text-white text-2xl font-bold">
                ₹{Math.max(...filteredPrices.map(p => p.price_per_quintal), 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-white/50" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Lowest Price</p>
              <p className="text-white text-2xl font-bold">
                ₹{Math.min(...filteredPrices.map(p => p.price_per_quintal), 999999)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-white/50" />
          </div>
        </div>

        <div className="stat-card bg-gradient-to-r from-purple-500 to-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Active Mandis</p>
              <p className="text-white text-2xl font-bold">{uniqueMandis.length}</p>
            </div>
            <div className="h-8 w-8 text-white/50 flex items-center justify-center">
              <div className="h-4 w-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Current Prices</h2>
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mandi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price/Quintal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <DollarSign className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium">No price data available</p>
                      <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPrices.map((price, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{price.crop_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{price.district_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{price.mandi_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">₹{price.price_per_quintal}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded ${getTrendColor(price.trend)}`}>
                        {getTrendIcon(price.trend)}
                        <span>{price.trend}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-primary-600 hover:text-primary-900 font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Trends Chart Placeholder */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Price Trends</h2>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Price trend charts coming soon</p>
            <p className="text-sm text-gray-400 mt-1">Historical price analysis and predictions</p>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Market Insights</h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Rice Prices Rising</h4>
              <p className="text-sm text-green-800 mt-1">
                Rice prices have increased by 8% across most mandis due to festive demand.
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900">Pulse Market Stable</h4>
              <p className="text-sm text-yellow-800 mt-1">
                Pigeon pea and black gram prices remain stable with slight upward trend.
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Vegetable Prices High</h4>
              <p className="text-sm text-blue-800 mt-1">
                Tomato and brinjal prices are high due to seasonal supply constraints.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Selling Tips</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="h-2 w-2 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Best Time to Sell</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Monitor price trends for 2-3 weeks before selling to maximize returns.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Compare Mandis</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Check prices in multiple mandis to find the best rates.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Quality Matters</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Better quality produce fetches premium prices in the market.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPrices;
