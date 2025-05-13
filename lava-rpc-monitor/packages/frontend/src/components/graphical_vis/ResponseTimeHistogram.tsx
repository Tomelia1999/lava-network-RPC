import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CallRecord } from '../../services/websocketClient'; // Import CallRecord

// Define the expected structure of a single call record
// interface CallRecord {  <-- Remove local definition
//   method: string;
//   startTime: number;
//   endTime: number;
//   statusCode: number;
//   isSuccess: boolean;
//   result?: any; // Can be any type or undefined if error
//   error?: string;
// }

interface ResponseTimeHistogramProps {
  callRecords: CallRecord[];
}

const ResponseTimeHistogram: React.FC<ResponseTimeHistogramProps> = ({ callRecords }) => {
  // Define response time buckets (in milliseconds)
  const buckets = [
    { range: '0-100ms', min: 0, max: 100, count: 0 },
    { range: '101-250ms', min: 101, max: 250, count: 0 },
    { range: '251-500ms', min: 251, max: 500, count: 0 },
    { range: '501-1000ms', min: 501, max: 1000, count: 0 },
    { range: '>1000ms', min: 1001, max: Infinity, count: 0 },
  ];

  // Process callRecords to populate buckets
  callRecords.forEach(record => {
    if (record.isSuccess) {
      const duration = record.endTime - record.startTime;
      for (const bucket of buckets) {
        if (duration >= bucket.min && duration <= bucket.max) {
          bucket.count++;
          break;
        }
      }
    }
  });

  const chartData = buckets.map(bucket => ({
    name: bucket.range,
    count: bucket.count,
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <h3 style={{ textAlign: 'center' }}>Response Time Distribution</h3>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name="Request Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResponseTimeHistogram; 