import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function Trades() {
  const [trades, setTrades] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('open');
  const [loading, setLoading] = useState(false);

  const fetchTrades = async (filter) => {
    setLoading(true);
    try {
      const res = await fetch(`https://fastapi-trading-bot-1.onrender.com/trades-summary?status=${filter}`);
      const data = await res.json();
      setTrades(data.trades || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error('Failed to fetch trades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades(status);
  }, [status]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-indigo-700 text-center">💼 Trade Summary</h1>

      {/* Toggle Buttons */}
      <div className="relative w-full max-w-sm mx-auto mt-2">
        <div className="grid grid-cols-3 bg-gray-200 rounded-full shadow-inner p-1 relative">
          <span
            className={`absolute inset-y-1 transition-all duration-300 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500`}
            style={{
              left:
                status === 'open'
                  ? '4px'
                  : status === 'closed'
                  ? 'calc(33.333% + 4px)'
                  : 'calc(66.666% + 4px)',
              width: 'calc(33.333% - 8px)',
            }}
          ></span>

          {['open', 'closed', 'all'].map((opt) => (
            <button
              key={opt}
              onClick={() => setStatus(opt)}
              className={`relative z-10 w-full py-2 font-semibold text-sm transition-all rounded-full ${
                status === opt ? 'text-white' : 'text-gray-800'
              }`}
            >
              {opt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Summary */}
      {summary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow text-center">
          <div>
            <p className="text-gray-500 text-sm">Total Invested</p>
            <p className="text-lg font-bold text-blue-800">₹{summary.total_invested.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Current Value</p>
            <p className="text-lg font-bold text-green-700">₹{summary.current_value.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Profit</p>
            <p className={`text-lg font-bold ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{summary.profit.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Profit %</p>
            <p className={`text-lg font-bold ${summary.profit_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>{summary.profit_pct.toFixed(2)}%</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow text-center animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-4 w-3/5 mx-auto bg-gray-200 rounded"></div>
              <div className="h-6 w-4/5 mx-auto bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center text-sm text-gray-500">
          <span className="inline-flex gap-1 items-center justify-center">
            <span className="animate-bounce delay-100">.</span>
            <span className="animate-bounce delay-200">.</span>
            <span className="animate-bounce delay-300">.</span>
          </span>{' '}
          Loading trades...
        </div>
      ) : trades.length === 0 ? (
        <p className="text-center text-red-500 font-medium">No trades to display.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border text-sm">
            <thead>
              <tr className="bg-indigo-100 text-indigo-800">
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Ticker</th>
                <th className="p-2 border">Action</th>
                <th className="p-2 border">Buy Price</th>
                <th className="p-2 border">Sell/Current Price</th>
                <th className="p-2 border">Profit</th>
                <th className="p-2 border">Profit %</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t, i) => (
                <tr key={t.id} className="text-center hover:bg-gray-50">
                  <td className="p-2 border">{new Date(t.timestamp).toLocaleDateString()}</td>
                  <td className="p-2 border">{t.ticker}</td>
                  <td className="p-2 border">{t.action}</td>
                  <td className="p-2 border">₹{parseFloat(t.price).toFixed(2)}</td>
                  <td className="p-2 border">₹{t.sell_or_current_price?.toFixed(2)}</td>
                  <td className={`p-2 border ${t.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{t.profit.toFixed(2)}</td>
                  <td className={`p-2 border ${t.profit_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>{t.profit_pct.toFixed(2)}%</td>
                  <td className="p-2 border">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
