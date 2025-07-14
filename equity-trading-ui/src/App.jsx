import React, { useState, useEffect, useRef } from 'react';
import Screener from './components/Screener';
import Trades from './components/Trades';

export default function App() {
  const [view, setView] = useState('screener');

  // Screener states
  const [stocks, setStocks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentTicker, setCurrentTicker] = useState('');

  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);

  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchAllStocks = async () => {
    setProgress(0);
    setCurrentTicker('');
    setLoading(true);
    setIsPaused(false);
    setIsStopped(false);
    setStocks([]);

    try {
      const metaRes = await fetch('https://fastapi-trading-bot-1.onrender.com/screener-meta');
      const metaData = await metaRes.json();
      const tickers = Array.isArray(metaData) ? metaData : metaData.tickers || [];

      setTotal(tickers.length);

      for (let i = 0; i < tickers.length; i++) {
        if (!isMounted.current || isStopped) break;

        // Wait if paused
        while (isPaused) {
          await new Promise(resolve => setTimeout(resolve, 500));
          if (isStopped) break;
        }

        const ticker = tickers[i];
        setCurrentTicker(ticker);

        try {
          const res = await fetch(`https://fastapi-trading-bot-1.onrender.com/screener-stock?ticker=${ticker}`);
          const data = await res.json();

          if (data && data.history && data.history.length > 0) {
            setStocks((prev) => {
              if (prev.find((s) => s.ticker === data.ticker)) return prev;
              return [...prev, data];
            });
          }
        } catch (err) {
          console.warn(`❌ Error fetching ${ticker}:`, err);
        }

        setProgress(Math.round(((i + 1) / tickers.length) * 100));
      }
    } catch (err) {
      console.error('❌ Error in screener-meta:', err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handlePauseToggle = () => {
    setIsPaused(prev => !prev);
  };

  const handleStop = () => {
    setIsStopped(true);
    setLoading(false);
  };

  const handleRefresh = () => {
    fetchAllStocks();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6 relative">
      <h1 className="text-4xl font-extrabold text-center text-indigo-700 drop-shadow-sm">
        📈 NSE Equity Dashboard
      </h1>

      {/* Toggle Tabs */}
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

      {/* Buttons */}
      {view === 'screener' && (
        <div className="flex justify-center gap-4 flex-wrap">
          {!loading && !isPaused && !stocks.length && (
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow hover:bg-indigo-700 transition"
              onClick={fetchAllStocks}
            >
              🧪 Screen Stocks
            </button>
          )}

          {(loading || isPaused) && (
            <>
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded-full shadow hover:bg-yellow-600 transition"
                onClick={handlePauseToggle}
              >
                {isPaused ? '▶️ Start' : '⏸️ Pause'}
              </button>

              <button
                className="bg-red-500 text-white px-4 py-2 rounded-full shadow hover:bg-red-600 transition"
                onClick={handleStop}
              >
                ⏹️ Stop
              </button>
            </>
          )}

          {stocks.length > 0 && (
            <button
              className="bg-gray-700 text-white px-4 py-2 rounded-full shadow hover:bg-gray-800 transition"
              onClick={handleRefresh}
            >
              🔄 Refresh
            </button>
          )}
        </div>
      )}

      {/* Progress */}
      {(loading || isPaused) && (
        <div className="text-center text-sm text-gray-600 mt-4">
          Loading: {progress}% — {currentTicker}
          <div className="w-full max-w-xl mx-auto h-2 mt-2 bg-gray-200 rounded">
            <div
              className="h-full bg-green-500 rounded transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Render Active Tab */}
      {view === 'screener' ? (
        <Screener
          stocks={stocks}
          progress={progress}
          loading={loading}
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
