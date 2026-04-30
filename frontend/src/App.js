import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DistrictTracking from './pages/DistrictTracking';
import YieldPrediction from './pages/YieldPrediction';
import DiseaseDetection from './pages/DiseaseDetection';
import Chatbot from './pages/Chatbot';
import MarketPrices from './pages/MarketPrices';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/districts" element={<DistrictTracking />} />
              <Route path="/yield-prediction" element={<YieldPrediction />} />
              <Route path="/disease-detection" element={<DiseaseDetection />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/market-prices" element={<MarketPrices />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
