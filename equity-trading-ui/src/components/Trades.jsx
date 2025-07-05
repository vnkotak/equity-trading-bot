import React, { useEffect, useState } from 'react';

export default function Trades() {
  const [trades, setTrades] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('open');
  const [loading, setLoading] = useState(false);

  const fetchTrades = async (filter) => {
    setLoading(true);
    try {
      const res = await fetch(`https://fastapi-trading-bot-1.onrender.com/trades?status=${filter}`);
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
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-indigo-700 text-center">💼 Trade Summary</h1>

      <div className="flex justify-center gap-3">
        {['open', 'closed', 'all'].map((opt) => (
          <button
            key={opt}
            onClick={() => setStatus(opt)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold shadow ${
              status === opt ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {opt.toUpperCase()}
          </button>
        ))}
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow">
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
      )}

      {loading ? (
        <p className="text-center text-sm text-gray-500">Loading trades...</p>
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
