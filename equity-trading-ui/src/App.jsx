import React, { useEffect, useState } from 'react';
import PlotlyStockCard from './components/PlotlyStockCard';

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [currentTicker, setCurrentTicker] = useState('');

  useEffect(() => {
    const fetchAllStocks = async () => {
      try {
        // Step 1: Get the list of tickers
        const metaRes = await fetch('https://fastapi-trading-bot-1.onrender.com/screener-meta');
        const metaData = await metaRes.json();
        const tickers = metaData.tickers || [];
        setTotal(tickers.length);

        // Step 2: Fetch each stock one by one
        for (let i = 0; i < tickers.length; i++) {
          const ticker = tickers[i];
          setCurrentTicker(ticker);
          setProcessedCount(i + 1);

          try {
            const stockRes = await fetch(`https://fastapi-trading-bot-1.onrender.com/screener-stock?ticker=${ticker}`);
            const stockData = await stockRes.json();
            if (
              stockData &&
              stockData.history &&
              stockData.history.length > 0 &&
              stockData.match_type === "full"
            ) {
              setStocks((prev) => [...prev, stockData]);
              console.log(`✅ Full Match: ${ticker}`);
            } else {
              console.log(`⏭️ Skipping: ${ticker}`);
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
          <p className="mb-2 font-medium text-blue-700">
            🔄 Processing: {currentTicker || '...'}
          </p>
          <p className="mb-2">Progress: {progress}% ({processedCount} of {total})</p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-green-700 mt-1">
            ✅ Number of stocks matched: {stocks.length}
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
