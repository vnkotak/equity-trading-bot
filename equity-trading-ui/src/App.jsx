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

  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false; // when unmounted
    };
  }, []);

  const fetchAllStocks = async () => {
    setProgress(0);
    setCurrentTicker('');
    setLoading(true);
    setStocks([]);

    try {
      const metaRes = await fetch('https://fastapi-trading-bot-1.onrender.com/screener-meta');
      const metaData = await metaRes.json();

      // 🛠 Fix for plain array or { tickers: [...] }
      const tickers = Array.isArray(metaData) ? metaData : metaData.tickers || [];

      console.log(`📦 Tickers received: ${tickers.length}`);
      setTotal(tickers.length);

      for (let i = 0; i < tickers.length; i++) {
        const ticker = tickers[i];
        if (!isMounted.current) break;

        setCurrentTicker(ticker);
        console.log(`🔍 Fetching: ${ticker}`);

        try {
          const res = await fetch(`https://fastapi-trading-bot-1.onrender.com/screener-stock?ticker=${ticker}`);
          const data = await res.json();
          console.log(`✅ Response for ${ticker}:`, data);
          //alert(data);
          if (
            data &&
            data.history &&
            data.history.length > 0
            // data.match_type === 'full'
          ) {
            //alert("1");
            setStocks((prev) => {
              if (prev.find((s) => s.ticker === data.ticker)) return prev;
              return [...prev, data];
            });
          } else {
            console.log(`⚠️ ${ticker} did not match`);
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

  useEffect(() => {
    fetchAllStocks(); // load on mount
  }, []);

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
