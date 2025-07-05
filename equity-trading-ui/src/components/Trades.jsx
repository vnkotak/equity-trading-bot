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

  const statuses = ['open', 'closed', 'all'];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 space-y-6">
      <h2 className="text-2xl font-bold text-indigo-700 text-center mb-2">💼 Trades Dashboard</h2>

      {/* Toggle Buttons */}
      <div className="relative w-full max-w-md mx-auto bg-gray-200 rounded-full shadow-inner p-1 flex justify-between">
        {/* Sliding Pill */}
        <div
          className={`absolute top-1 left-1 h-[calc(100%-0.5rem)] w-1/3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-transform duration-300 ease-in-out`}
          style={{
            transform:
              status === 'open'
                ? 'translateX(0%)'
                : status === 'closed'
                ? 'translateX(100%)'
                : 'translateX(200%)',
          }}
        ></div>
      
        {/* Buttons */}
        {['open', 'closed', 'all'].map((opt, idx) => (
          <button
            key={opt}
            onClick={() => setStatus(opt)}
            className={`w-1/3 z-10 py-2 font-semibold text-sm transition-all duration-300 rounded-full ${
              status === opt ? 'text-white' : 'text-gray-800'
            }`}
          >
            {opt.toUpperCase()}
          </button>
        ))}
      </div>


      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Total Invested</p>
            <p className="text-lg font-bold text-blue-800">₹{summary.total_invested.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Current Value</p>
            <p className="text-lg font-bold text-green-700">₹{summary.current_value.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Profit</p>
            <p className={`text-lg font-bold ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{summary.profit.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Profit %</p>
            <p className={`text-lg font-bold ${summary.profit_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.profit_pct.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-center text-sm text-gray-500">Loading trades...</p>
      ) : trades.length === 0 ? (
        <p className="text-center text-red-500 font-medium">No trades to display.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border text-sm text-center bg-white rounded-xl shadow">
            <thead>
              <tr className="bg-indigo-100 text-indigo-800">
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Ticker</th>
                <th className="p-3 border">Action</th>
                <th className="p-3 border">Buy Price</th>
                <th className="p-3 border">Sell/Current</th>
                <th className="p-3 border">Profit</th>
                <th className="p-3 border">Profit %</th>
                <th className="p-3 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
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
