import React, { useEffect, useState } from 'react';
import PlotlyStockCard from './components/PlotlyStockCard';
import Trades from './components/Trades';
import { RotateCw } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('screener');
  const [stocks, setStocks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentTicker, setCurrentTicker] = useState('');

  const fetchAllStocks = async () => {
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

  useEffect(() => {
    if (stocks.length > 0 || view !== 'screener') return;
    fetchAllStocks();
  }, []); // only run once on mount

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

          {/* Floating Refresh Button */}
          <button
            onClick={fetchAllStocks}
            className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
            title="Rescan Screener"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Trades Section */}
      {view === 'trades' && <Trades />}
    </div>
  );
}
