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
        📈 NSE Equity Dashboard
      </h1>

      {/* Fancy Toggle Button */}
      <div className="relative flex justify-center my-6">
        <div className="relative bg-gray-200 rounded-full p-1 shadow-inner w-[280px]">
          <div
            className={`absolute top-1 left-1 h-10 w-[130px] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md transition-all duration-300 ${
              view === 'trades' ? 'translate-x-[134px]' : 'translate-x-0'
            }`}
          ></div>
      
          <div className="relative z-10 flex justify-between">
            <button
              className={`w-[130px] h-10 rounded-full font-semibold transition duration-200 ${
                view === 'screener'
                  ? 'text-white'
                  : 'text-gray-700 hover:text-indigo-700 hover:font-semibold'
              }`}
              onClick={() => setView('screener')}
            >
              Screener
            </button>
            <button
              className={`w-[130px] h-10 rounded-full font-semibold transition duration-200 ${
                view === 'trades'
                  ? 'text-white'
                  : 'text-gray-700 hover:text-indigo-700 hover:font-semibold'
              }`}
              onClick={() => setView('trades')}
            >
              Trades
            </button>
          </div>
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
