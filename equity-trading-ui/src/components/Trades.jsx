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
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-extrabold text-center text-indigo-700 drop-shadow">
        💼 Trades Dashboard
      </h1>

      {/* Stylish Toggle */}
      <div className="relative flex justify-center">
        <div className="relative bg-gray-200 rounded-full p-1 shadow-inner w-[300px]">
          <div
            className={`absolute top-1 left-1 h-10 w-[90px] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md transition-all duration-300 ${
              status === 'closed' ? 'translate-x-[104px]' : status === 'all' ? 'translate-x-[208px]' : 'translate-x-0'
            }`}
          ></div>

          <div className="relative z-10 flex justify-between">
            {['open', 'closed', 'all'].map((opt) => (
              <button
                key={opt}
                onClick={() => setStatus(opt)}
                className={`w-[90px] h-10 rounded-full font-semibold transition duration-200 ${
                  status === opt
                    ? 'text-white'
                    : 'text-gray-700 hover:text-indigo-700 hover:font-semibold'
                }`}
              >
                {opt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow hover:shadow-lg transition">
            <p className="text-sm text-gray-500">Total Invested</p>
            <p className="text-xl font-bold text-blue-800">₹{summary.total_invested.toFixed(2)}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow hover:shadow-lg transition">
            <p className="text-sm text-gray-500">Current Value</p>
            <p className="text-xl font-bold text-green-800">₹{summary.current_value.toFixed(2)}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow hover:shadow-lg transition">
            <p className="text-sm text-gray-500">Profit</p>
            <p className={`text-xl font-bold ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{summary.profit.toFixed(2)}
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow hover:shadow-lg transition">
            <p className="text-sm text-gray-500">Profit %</p>
            <p className={`text-xl font-bold ${summary.profit_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.profit_pct.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-500 italic">⏳ Loading trades...</p>
      ) : trades.length === 0 ? (
        <p className="text-center text-red-600 font-medium">🚫 No trades to display.</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full text-sm border border-slate-300 bg-white rounded-xl">
            <thead>
              <tr className="bg-indigo-100 text-indigo-800 text-left">
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Ticker</th>
                <th className="p-3 border">Action</th>
                <th className="p-3 border">Buy Price</th>
                <th className="p-3 border">Sell / Current</th>
                <th className="p-3 border">Profit</th>
                <th className="p-3 border">Profit %</th>
                <th className="p-3 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition text-center">
                  <td className="p-2 border">{new Date(t.timestamp).toLocaleDateString()}</td>
                  <td className="p-2 border font-medium">{t.ticker}</td>
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
