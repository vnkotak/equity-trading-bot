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

  const renderExtraCards = () => {
    if (!summary) return null;

    const extraCards = [];

    if (status === 'open') {
      extraCards.push(
        { label: 'Total BUY', value: summary.total_buy_trades, color: 'text-indigo-700' },
        { label: 'Open Trades', value: summary.open_trades, color: 'text-orange-600' },
        { label: 'Winning Trades', value: summary.winning_trades, color: 'text-green-600' },
        { label: 'Winning %', value: `${summary.winning_pct.toFixed(2)}%`, color: 'text-green-600' }
      );
    } else if (status === 'closed') {
      extraCards.push(
        { label: 'Total BUY', value: summary.total_buy_trades, color: 'text-indigo-700' },
        { label: 'Closed Trades', value: summary.closed_trades, color: 'text-green-700' },
        { label: 'Winning Trades', value: summary.winning_trades, color: 'text-green-600' },
        { label: 'Winning %', value: `${summary.winning_pct.toFixed(2)}%`, color: 'text-green-600' }
      );
    } else if (status === 'all') {
      extraCards.push(
        { label: 'Open Trades', value: summary.open_trades, color: 'text-orange-600' },
        { label: 'Closed Trades', value: summary.closed_trades, color: 'text-green-700' },
        { label: 'Winning Trades', value: summary.winning_trades, color: 'text-green-600' },
        { label: 'Winning %', value: `${summary.winning_pct.toFixed(2)}%`, color: 'text-green-600' }
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {extraCards.map((card, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">{card.label}</p>
            <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 space-y-6">
      <h2 className="text-2xl font-bold text-indigo-700 text-center mb-2">💼 Trades Dashboard</h2>

      {/* Toggle Buttons */}
      <div className="relative w-full max-w-md mx-auto">
        <div className="grid grid-cols-3 bg-gray-200 rounded-full shadow-inner p-1 relative">
          <span
            className={`absolute inset-y-1 transition-all duration-300 rounded-full bg-gradient-to-r from-blue-500 to-purple-500`}
            style={{
              left: status === 'open' ? '4px' : status === 'closed' ? 'calc(33.333% + 4px)' : 'calc(66.666% + 4px)',
              width: 'calc(33.333% - 8px)',
            }}
          ></span>

          {statuses.map((opt) => (
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

      {/* Summary Dashboard */}
      {summary && (
        <>
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

          {/* Additional Dynamic Cards */}
          {renderExtraCards()}
        </>
      )}

      {/* Trades Table */}
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
