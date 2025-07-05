import React, { useEffect, useState } from 'react';
import PlotlyStockCard from './components/PlotlyStockCard';
import Trades from './components/Trades';

export default function App() {
  const [view, setView] = useState('screener');
  const [stocks, setStocks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentTicker, setCurrentTicker] = useState('');

  useEffect(() => {
    if (view !== 'screener') return;

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
  }, [view]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <h1 className="text-4xl font-extrabold text-center text-indigo-700 drop-shadow-sm">
        📈 NSE Screener Dashboard
      </h1>

      {/* Fancy Toggle Button */}
      <div className="flex justify-center">
        <div className="relative inline-flex p-1 bg-white/60 backdrop-blur-md border border-indigo-300 rounded-full shadow-lg transition-all duration-300">
          {['screener', 'trades'].map((v) => {
            const isActive = view === v;
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`relative z-10 px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  isActive
                    ? 'text-white'
                    : 'text-indigo-700 hover:text-indigo-900'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 z-[-1] rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md transition-all duration-300"></div>
                )}
                {v === 'screener' ? '📊 Screener' : '📋 Trades'}
              </button>
            );
          })}
        </div>
      </div>


      {/* Screener Section */}
      {view === 'screener' && (
        <>
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
              <PlotlyStockCard key={idx} stock={stock} />
            ))}
          </div>
        </>
      )}

      {/* Trades Section */}
      {view === 'trades' && <Trades />}
    </div>
  );
}
