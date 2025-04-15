import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CityCostComparison = ({ data }) => {
  const [activeTab, setActiveTab] = useState('avgCost');

  // Format city names for display
  const formatCityName = (name) => {
    if (!name) return '';
    // Convert names like san_francisco to San Francisco
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format data for display, making sure location names are properly formatted
  const formattedData = data.map(item => ({
    ...item,
    location: formatCityName(item.location)
  }));

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title">
          <i className="fas fa-map-marker-alt"></i> Cost Comparison by City
        </div>
        <div className="chart-tabs">
          <button 
            className={`chart-tab ${activeTab === 'avgCost' ? 'active' : ''}`}
            onClick={() => setActiveTab('avgCost')}
          >
            Average Cost
          </button>
          <button 
            className={`chart-tab ${activeTab === 'totalClaims' ? 'active' : ''}`}
            onClick={() => setActiveTab('totalClaims')}
          >
            Total Claims
          </button>
        </div>
      </div>
      <div className="chart-container" style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="location" />
            <YAxis />
            <Tooltip formatter={(value) => activeTab === 'avgCost' ? `$${value}` : value} />
            <Legend />
            <Bar 
              dataKey={activeTab === 'avgCost' ? 'avgCost' : 'totalClaims'} 
              name={activeTab === 'avgCost' ? 'Average Cost ($)' : 'Total Claims'}
              fill={activeTab === 'avgCost' ? '#4361ee' : '#82ca9d'} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-footer">
        <div className="chart-insight">
          <i className="fas fa-info-circle"></i> 
          {activeTab === 'avgCost' 
            ? 'San Francisco has the highest average healthcare costs' 
            : 'San Francisco has the highest number of claims processed'}
        </div>
      </div>
    </div>
  );
};

export default CityCostComparison;