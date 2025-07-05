import React, { useEffect, useState } from 'react';

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
    <div className="p-4 space-y-6 font-sans">
      {/* Smaller Heading */}
      <h2 className="text-xl font-semibold text-indigo-700 text-center">📊 Trades Dashboard</h2>

      {/* Toggle Tabs */}
      <div className="relative flex justify-center">
        <div className="inline-flex relative bg-gray-200 rounded-full p-1 shadow-inner">
          {['open', 'closed', 'all'].map((opt, idx) => (
            <button
              key={opt}
              onClick={() => setStatus(opt)}
              className={`relative z-10 px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                status === opt ? 'text-white' : 'text-indigo-600'
              }`}
            >
              {opt.toUpperCase()}
            </button>
          ))}
          {/* Sliding background */}
          <span
            className={`absolute top-1 left-1 h-[28px] w-[70px] rounded-full bg-indigo-600 shadow-md transition-all duration-300 ${
              status === 'closed' ? 'translate-x-[72px]' : status === 'all' ? 'translate-x-[144px]' : ''
            }`}
          ></span>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl shadow-lg">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Total Invested</p>
            <p className="text-lg font-bold text-blue-800">₹{summary.total_invested.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">Current Value</p>
            <p className="text-lg font-bold text-green-700">₹{summary.current_value.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">Profit</p>
            <p className={`text-lg font-bold ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{summary.profit.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">Profit %</p>
            <p className={`text-lg font-bold ${summary.profit_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.profit_pct.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      {/* Trade Table */}
      {loading ? (
        <p className="text-center text-sm text-gray-500">Loading trades...</p>
      ) : trades.length === 0 ? (
        <p className="text-center text-red-500 font-medium">No trades to display.</p>
      ) : (
        <div className="overflow-x-auto max-w-6xl mx-auto">
          <table className="min-w-full border-collapse border text-sm bg-white rounded-xl shadow overflow-hidden">
            <thead>
              <tr className="bg-indigo-100 text-indigo-800 text-center">
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
              {trades.map((t) => (
                <tr key={t.id} className="text-center hover:bg-gray-50 transition">
                  <td className="p-2 border">{new Date(t.timestamp).toLocaleDateString()}</td>
                  <td className="p-2 border">{t.ticker}</td>
                  <td className="p-2 border">{t.action}</td>
                  <td className="p-2 border">₹{parseFloat(t.price).toFixed(2)}</td>
                  <td className="p-2 border">₹{t.sell_or_current_price?.toFixed(2)}</td>
                  <td className={`p-2 border ${t.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{t.profit.toFixed(2)}
                  </td>
                  <td className={`p-2 border ${t.profit_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {t.profit_pct.toFixed(2)}%
                  </td>
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
