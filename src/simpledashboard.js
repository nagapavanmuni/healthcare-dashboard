import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './App.css';

const SimpleDashboard = () => {
  const [selectedAge, setSelectedAge] = useState('all');

  // Simple expense data
  const allData = [
    { ageGroup: '0-18', White: 4500, Black: 4200, Asian: 3800 },
    { ageGroup: '19-35', White: 5600, Black: 5100, Asian: 4800 },
    { ageGroup: '36-50', White: 7200, Black: 6800, Asian: 6500 },
    { ageGroup: '51-65', White: 9500, Black: 9000, Asian: 8700 },
    { ageGroup: '65+', White: 12000, Black: 11500, Asian: 11000 }
  ];

  // Filter based on age
  const filteredData = selectedAge === 'all' 
    ? allData 
    : allData.filter(item => item.ageGroup === selectedAge);

  return (
    <div className="simple-dashboard">
      <h1>Healthcare Cost Dashboard</h1>
      
      <div className="filters">
        <label>
          Age Group:
          <select value={selectedAge} onChange={(e) => setSelectedAge(e.target.value)}>
            <option value="all">All Age Groups</option>
            <option value="0-18">0-18</option>
            <option value="19-35">19-35</option>
            <option value="36-50">36-50</option>
            <option value="51-65">51-65</option>
            <option value="65+">65+</option>
          </select>
        </label>
      </div>
      
      <div className="chart-container">
        <BarChart
          width={800}
          height={400}
          data={filteredData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ageGroup" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="White" fill="#8884d8" />
          <Bar dataKey="Black" fill="#82ca9d" />
          <Bar dataKey="Asian" fill="#ffc658" />
        </BarChart>
      </div>
    </div>
  );
};

export default SimpleDashboard;