import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SuccessRateChartProps {
  currentSuccessRate: number | null; // Allow null for initial state
}

interface SuccessRateDataPoint {
  time: number; // Sequence number or timestamp
  rate: number;
}

const MAX_DATA_POINTS = 30; // Number of data points to show on the chart

const SuccessRateChart: React.FC<SuccessRateChartProps> = ({ currentSuccessRate }) => {
  const [successRateHistory, setSuccessRateHistory] = useState<SuccessRateDataPoint[]>([]);
  const timeCounterRef = useRef<number>(0);

  useEffect(() => {
    if (currentSuccessRate !== null) {
      setSuccessRateHistory(prevHistory => {
        const newTime = timeCounterRef.current;
        const newPoint = { time: newTime, rate: currentSuccessRate };
        const updatedHistory = [...prevHistory, newPoint];
        if (updatedHistory.length > MAX_DATA_POINTS) {
          return updatedHistory.slice(updatedHistory.length - MAX_DATA_POINTS);
        }
        return updatedHistory;
      });
      timeCounterRef.current += 1;
    }
  }, [currentSuccessRate]);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <h3 style={{ textAlign: 'center' }}>Success Rate Over Time (%)</h3>
      {successRateHistory.length > 0 ? (
        <ResponsiveContainer>
          <LineChart
            data={successRateHistory}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} />
            <YAxis domain={[0, 100]} allowDecimals={false} />
            <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
            <Legend />
            <Line type="monotone" dataKey="rate" stroke="#82ca9d" name="Success Rate" dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Waiting for data...</p>
      )}
    </div>
  );
};

export default SuccessRateChart; 