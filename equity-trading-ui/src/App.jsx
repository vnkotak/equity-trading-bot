import React, { useState, useEffect, useRef } from 'react';
import Screener from './components/Screener';
import Trades from './components/Trades';

export default function App() {
  const [view, setView] = useState('screener');

  const [stocks, setStocks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentTicker, setCurrentTicker] = useState('');

  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);

  const isMounted = useRef(true);
  const pauseRef = useRef(false);
  const stopRef = useRef(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    stopRef.current = isStopped;
  }, [isStopped]);

  const fetchAllStocks = async () => {
    setProgress(0);
    setCurrentTicker('');
    setLoading(true);
    setIsPaused(false);
    setIsStopped(false);
    pauseRef.current = false;
    stopRef.current = false;
    setStocks([]);

    try {
      const metaRes = await fetch('https://fastapi-trading-bot-1.onrender.com/screener-meta');
      const metaData = await metaRes.json();
      const tickers = Array.isArray(metaData) ? metaData : metaData.tickers || [];

      setTotal(tickers.length);

      for (let i = 0; i < tickers.length; i++) {
        if (!isMounted.current || stopRef.current) break;

        while (pauseRef.current) {
          await new Promise(resolve => setTimeout(resolve, 500));
          if (stopRef.current) break;
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
    stopRef.current = true;
    setLoading(false);
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

      {/* Screener Controls */}
      {view === 'screener' && (
        <div className="flex flex-col items-center gap-6 mt-6">
          {!loading && !isPaused && !stocks.length && !isStopped && (
            <div className="flex justify-center items-center min-h-[60vh] w-full">
              <button
                className="bg-indigo-600 text-white px-6 py-4 text-lg font-bold rounded-2xl shadow-md hover:bg-indigo-700 transition"
                onClick={fetchAllStocks}
              >
                🚀 Screen Stocks
              </button>
            </div>
          )}
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
          isPaused={isPaused}
          isStopped={isStopped}
          handlePauseToggle={handlePauseToggle}
          handleStop={handleStop}
        />
      ) : (
        <Trades />
      )}
    </div>
  );
}
