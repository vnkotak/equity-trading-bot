import React, { useState, useEffect } from 'react';
import Screener from './components/Screener';
import Trades from './components/Trades';

export default function App() {
  const [view, setView] = useState('screener');

  // Screener states lifted to App
  const [stocks, setStocks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentTicker, setCurrentTicker] = useState('');

  const fetchAllStocks = async () => {
    setProgress(0);
    setCurrentTicker('');
    setLoading(true);
    setStocks([]);

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
            setStocks((prev) => {
              if (prev.find((s) => s.ticker === stockData.ticker)) return prev;
              return [...prev, stockData];
            });
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

  // Run fetch only once on mount
  useEffect(() => {
    fetchAllStocks();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6 relative">
      <h1 className="text-4xl font-extrabold text-center text-indigo-700 drop-shadow-sm">
        📈 NSE Equity Dashboard
      </h1>

      {/* Toggle: Screener / Trades */}
      <div className="relative w-full max-w-xs mx-auto mt-4">
        <div className="grid grid-cols-2 bg-gray-200 rounded-full shadow-inner p-1 relative">
          <span
            className={`absolute inset-y-1 transition-all duration-300 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500`}
            style={{
              left: view === 'screener' ? '4px' : 'calc(50% + 4px)',
              width: 'calc(50% - 8px)',
            }}
          ></span>

          {['screener', 'trades'].map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`relative z-10 w-full py-2 font-semibold text-sm transition-all rounded-full ${
                view === tab ? 'text-white' : 'text-gray-800'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Rendering */}
      {view === 'screener' ? (
        <Screener
          stocks={stocks}
          loading={loading}
          progress={progress}
          total={total}
          currentTicker={currentTicker}
          fetchAllStocks={fetchAllStocks}
        />
      ) : (
        <Trades />
      )}
    </div>
  );
}
