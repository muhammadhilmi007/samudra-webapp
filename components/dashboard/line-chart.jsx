// components/dashboard/line-chart.jsx
"use client";

import { useEffect, useRef, useState } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LineChart({ 
  data, 
  xKey, 
  yKey, 
  multipleYKeys, 
  height = 300, 
  formatYAxis = (value) => value,
  customTooltip
}) {
  const [chartWidth, setChartWidth] = useState(0);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    const updateWidth = () => {
      if (chartContainerRef.current) {
        setChartWidth(chartContainerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Generate a array of colors for multiple lines
  const defaultColors = ['#4f46e5', '#f43f5e', '#10b981', '#eab308', '#ec4899', '#8b5cf6'];

  const renderLines = () => {
    if (multipleYKeys) {
      return multipleYKeys.map((item, index) => (
        <Line
          key={item.key}
          type="monotone"
          dataKey={item.key}
          name={item.name || item.key}
          stroke={item.color || defaultColors[index % defaultColors.length]}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      ));
    }
    
    return (
      <Line
        type="monotone"
        dataKey={yKey}
        stroke="#4f46e5"
        strokeWidth={2}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
      />
    );
  };

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey={xKey} 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#9ca3af' }}
            axisLine={{ stroke: '#9ca3af' }}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#9ca3af' }}
            axisLine={{ stroke: '#9ca3af' }}
          />
          <Tooltip 
            content={customTooltip}
            formatter={(value) => {
              if (typeof value === 'number') {
                // If it looks like currency, format it as currency
                if (value > 1000) {
                  return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(value);
                }
                // Otherwise just format as number
                return new Intl.NumberFormat('id-ID').format(value);
              }
              return value;
            }}
          />
          <Legend />
          {renderLines()}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}