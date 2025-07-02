import React, { useEffect, useState } from 'react';
import PlotlyStockCard from './components/PlotlyStockCard';

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentTicker, setCurrentTicker] = useState('');
  const [expandedCards, setExpandedCards] = useState({});

  const toggleChart = (idx) => {
    setExpandedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  useEffect(() => {
    const fetchAllStocks = async () => {
      try {
        const metaRes = await fetch('https://fastapi-trading-bot-1.onrender.com/screener-meta');
        const metaData = await metaRes.json();
        const tickers = metaData.tickers || [];
        setTotal(tickers.length);

        for (let i = 0; i < tickers.length; i++) {
          const ticker = tickers[i];
          setCurrentTicker(ticker);

          try {
            const stockRes = await fetch(`https://fastapi-trading-bot-1.onrender.com/screener-stock?ticker=${ticker}`);
            const stockData = await stockRes.json();
            if (
              stockData &&
              stockData.history &&
              stockData.history.length > 0 &&
              stockData.match_type === 'full'
            ) {
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 p-6 space-y-6">
      <h1 className="text-4xl font-extrabold text-center text-indigo-700 drop-shadow-sm">
        📈 NSE Screener Dashboard
      </h1>

      {loading && (
        <div className="text-center space-y-3 animate-fade-in">
          <p className="text-lg font-medium text-gray-700">
            Scanning {currentTicker || 'stocks'}... {progress}%
          </p>
          <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            Number of stocks matched: {stocks.length} / {total}
          </p>
        </div>
      )}

      {!loading && stocks.length === 0 && (
        <p className="text-center text-red-600 font-semibold text-lg">
          🚫 No stocks found matching criteria.
        </p>
      )}

      <div className="space-y-6">
        {stocks.map((stock, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow p-4">
            <div
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center cursor-pointer"
              onClick={() => toggleChart(idx)}
            >
              <h2 className="text-xl font-semibold text-indigo-700">{stock.ticker}</h2>
              <span className="text-sm text-gray-600 sm:order-none order-2 mt-1 sm:mt-0">
                ({stock.buy_signals || 0} Buy, {stock.sell_signals || 0} Sell)
              </span>
              <span className="text-2xl sm:ml-2 sm:mt-0 mt-2">
                {expandedCards[idx] ? '▲' : '▼'}
              </span>
            </div>
            {expandedCards[idx] && <PlotlyStockCard stock={stock} />}
          </div>
        ))}
      </div>
    </div>
  );
}
