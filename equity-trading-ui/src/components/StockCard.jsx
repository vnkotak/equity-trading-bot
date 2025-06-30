import React, { useState } from 'react';
import ExpandedChart from './ExpandedChart';

export default function StockCard({ stock }) {
  const [showChart, setShowChart] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow p-4 hover:shadow-lg transition-all">
      <h2
        className="text-xl font-semibold text-blue-600 mb-2 cursor-pointer"
        onClick={() => setShowChart(!showChart)}
      >
        {stock.ticker}
      </h2>
      <div className="space-y-1 text-sm text-gray-800 mb-3">
        <p>💰 Close: ₹{stock.close}</p>
        <p>📉 RSI: {stock.rsi}</p>
        <p>📊 MACD: {stock.macd}</p>
        <p>🔁 Volume: {stock.volume.toLocaleString()}</p>
      </div>

      {showChart && (
        <div className="mt-4 border-t pt-4">
          <ExpandedChart stock={stock} />
        </div>
      )}
    </div>
  );
}
