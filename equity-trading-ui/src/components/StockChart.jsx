import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function StockChart({ data }) {
  return (
    <div className="w-full h-60 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#2563eb"
            name="Close Price"
          />
          <Line type="monotone" dataKey="ema" stroke="#10b981" name="EMA 50" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
