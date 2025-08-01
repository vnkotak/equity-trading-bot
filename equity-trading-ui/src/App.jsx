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
  const [lastRefreshedAt, setLastRefreshedAt] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);

  const isMounted = useRef(true);
  const pauseRef = useRef(false);
  const stopRef = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    fetchLatestBatch(); // Load initially 
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

  const fetchLatestBatch = async () => {
    setLoading(true);
    setStocks([]);
    try {
      const res = await fetch('https://fastapi-trading-bot-1.onrender.com/screener-latest');
      const data = await res.json();
      const tickers = Array.isArray(data.tickers) ? data.tickers : [];
      setTotal(tickers.length);
      setLastRefreshedAt(data.refreshed_at || '');

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
          const stockData = await res.json();
          if (stockData && stockData.history && stockData.history.length > 0) {
            setStocks((prev) => {
              if (prev.find((s) => s.ticker === stockData.ticker)) return prev;
              return [...prev, stockData];
            });
          }
        } catch (err) {
          console.warn(`❌ Error fetching ${ticker}:`, err);
        }

        setProgress(Math.round(((i + 1) / tickers.length) * 100));
      }
    } catch (err) {
      console.error("❌ Error fetching screener-latest:", err);
    } finally {
      setLoading(false);
      setScanCompleted(true);
    }
  };

  const fetchAllStocks = async () => {
    setProgress(0);
    setCurrentTicker('');
    setLoading(true);
    setIsPaused(false);
    setIsStopped(false);
    setScanCompleted(false);
    setLastRefreshedAt(new Date().toISOString()); // store ISO string
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
      if (isMounted.current) {
        setLoading(false);
        setScanCompleted(true);
      }
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
<div className="flex justify-center items-center h-20 sm:h-24 overflow-hidden">
  <img
    src="/logo.png"
    alt="TradPulse Logo"
    className="h-full object-contain"
  />
</div>
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

        {/* Last Refreshed Timestamp — aligned right */}
        {view === 'screener' && lastRefreshedAt && (
          <div className="text-right mt-1 pr-1">
            <p className="text-[10px] sm:text-xs text-gray-500 italic animate-fade-in">
            Last refreshed at: {new Date(lastRefreshedAt).toLocaleString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </p>
        </div>
      )}

      {/* Screener Controls */}
      {view === 'screener' && (
        <div className="flex flex-col items-center gap-6 mt-4">
          {!loading && !isPaused && !isStopped && !scanCompleted && !stocks.length && (
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
