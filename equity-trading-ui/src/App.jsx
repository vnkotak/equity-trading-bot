import React, { useEffect, useState } from 'react';
import PlotlyStockCard from './components/PlotlyStockCard';

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchAllStocks = async () => {
      try {
        // Step 1: Get the list of tickers
        const metaRes = await fetch('/screener-meta');
        const metaData = await metaRes.json();
        const tickers = metaData.tickers || [];
        setTotal(tickers.length);

        // Step 2: Fetch each stock one by one
        const results = [];
        for (let i = 0; i < tickers.length; i++) {
          const ticker = tickers[i];

          try {
            const stockRes = await fetch(`/screener-stock?ticker=${ticker}`);
            const stockData = await stockRes.json();
            if (stockData && stockData.history && stockData.history.length > 0) {
              results.push(stockData);
              setStocks((prev) => [...prev, stockData]);
            }
          } catch (err) {
            console.warn(`⚠️ Failed to fetch ${ticker}`);
          }

          setProgress(Math.round(((i + 1) / tickers.length) * 100));
        }
      } catch (err) {
        console.error('❌ Error in fetching screener meta:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStocks();
  }, []);

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-center">📊 NSE Screener Dashboard</h1>

      {loading && (
        <div className="text-center">
          <p className="mb-2">Loading stock data... {progress}%</p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Loaded {stocks.length} of {total} stocks
          </p>
        </div>
      )}

      {!loading && stocks.length === 0 && (
        <p className="text-center text-red-500">No stocks found matching criteria.</p>
      )}

      {stocks.map((stock, idx) => (
        <PlotlyStockCard key={idx} stock={stock} />
      ))}
    </div>
  );
}
