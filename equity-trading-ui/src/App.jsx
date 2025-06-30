import React, { useEffect, useState } from 'react';
import PlotlyStockCard from './components/PlotlyStockCard';

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://fastapi-trading-bot-1.onrender.com/screener-data')
      .then((res) => res.json())
      .then((data) => {
        setStocks(data.stocks || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch screener data:', err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="p-4 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-blue-600">
        📈 NSE Stock Screener Dashboard
      </h1>

      {loading ? (
        <p>🔄 Loading stock data...</p>
      ) : stocks.length === 0 ? (
        <p className="text-gray-500">
          🚫 No stocks matched the strategy today.
        </p>
      ) : (
        stocks.map((stock) => (
          <PlotlyStockCard key={stock.ticker} stock={stock} />
        ))
      )}
    </main>
  );
}
