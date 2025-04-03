// components/dashboard/bar-chart.jsx
"use client";

import { useEffect, useRef, useState } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BarChart({ 
  data, 
  xKey, 
  yKey, 
  height = 300, 
  horizontal = false,
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

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {horizontal ? (
          <RechartsBarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={!horizontal} />
            <XAxis 
              type="number"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#9ca3af' }}
              axisLine={{ stroke: '#9ca3af' }}
              tickFormatter={formatYAxis}
            />
            <YAxis 
              dataKey={xKey} 
              type="category"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#9ca3af' }}
              axisLine={{ stroke: '#9ca3af' }}
              width={100}
            />
            <Tooltip
              formatter={(value) => {
                if (typeof value === 'number') {
                  return new Intl.NumberFormat('id-ID').format(value);
                }
                return value;
              }}
            />
            <Legend />
            <Bar dataKey={yKey} fill="#4f46e5" radius={[0, 4, 4, 0]} />
          </RechartsBarChart>
        ) : (
          <RechartsBarChart
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
              formatter={(value) => {
                if (typeof value === 'number') {
                  return new Intl.NumberFormat('id-ID').format(value);
                }
                return value;
              }}
            />
            <Legend />
            <Bar dataKey={yKey} fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}