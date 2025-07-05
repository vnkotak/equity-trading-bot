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
      <h1 className="text-2xl font-bold text-indigo-700 text-center">💼 Trades Dashboard</h1>

      {/* Toggle Button */}
      <div className="relative w-full max-w-sm mx-auto">
        <div className="grid grid-cols-3 bg-gray-200 rounded-full shadow-inner p-1 relative">
          <span
            className={`absolute inset-y-1 transition-all duration-300 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500`}
            style={{
              left: status === 'open' ? '4px' : status === 'closed' ? 'calc(33.333% + 4px)' : 'calc(66.666% + 4px)',
              width: 'calc(33.333% - 8px)',
            }}
          ></span>
          {['open', 'closed', 'all'].map((opt) => (
            <button
              key={opt}
              onClick={() => setStatus(opt)}
              className={`relative z-10 w-full py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                status === opt ? 'text-white' : 'text-gray-800'
              }`}
            >
              {opt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow">
        {['total_invested', 'current_value', 'profit', 'profit_pct'].map((key) => (
          <div key={key} className="text-center min-h-[48px] flex flex-col justify-center">
            <p className="text-gray-500 text-sm capitalize">{key.replace(/_/g, ' ')}</p>
            <p
              className={`text-lg font-bold ${
                key.includes('profit')
                  ? summary && summary[key] >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                  : 'text-blue-800'
              }`}
            >
              {loading ? <LoadingDots /> : key.includes('pct') ? `${summary?.[key]?.toFixed(2)}%` : `₹${summary?.[key]?.toFixed(2)}`}
            </p>
          </div>
        ))}
      </div>

      {/* Secondary Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow">
        {status === 'open' && (
          <>
            <MetricCard title="Total Buys" value={summary?.total_buy_trades} loading={loading} />
            <MetricCard title="Open Trades" value={summary?.open_trades} loading={loading} />
            <MetricCard title="Winning Trades" value={summary?.winning_trades} loading={loading} />
            <MetricCard title="Winning %" value={`${summary?.winning_pct?.toFixed(2)}%`} loading={loading} />
          </>
        )}
        {status === 'closed' && (
          <>
            <MetricCard title="Total Buys" value={summary?.total_buy_trades} loading={loading} />
            <MetricCard title="Closed Trades" value={summary?.closed_trades} loading={loading} />
            <MetricCard title="Winning Trades" value={summary?.winning_trades} loading={loading} />
            <MetricCard title="Winning %" value={`${summary?.winning_pct?.toFixed(2)}%`} loading={loading} />
          </>
        )}
        {status === 'all' && (
          <>
            <MetricCard title="Open Trades" value={summary?.open_trades} loading={loading} />
            <MetricCard title="Closed Trades" value={summary?.closed_trades} loading={loading} />
            <MetricCard title="Winning Trades" value={summary?.winning_trades} loading={loading} />
            <MetricCard title="Winning %" value={`${summary?.winning_pct?.toFixed(2)}%`} loading={loading} />
          </>
        )}
      </div>

      {/* Trades Table */}
      {loading ? (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        </div>
      ) : trades.length === 0 ? (
        <p className="text-center text-red-500 font-medium">No trades to display.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border text-sm">
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

function MetricCard({ title, value, loading }) {
  return (
    <div className="text-center min-h-[48px] flex flex-col justify-center">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-lg font-bold text-indigo-700">
        {loading ? <LoadingDots /> : value}
      </p>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex justify-center items-center gap-[4px] h-[20px] mt-1">
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.1s]"></span>
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
    </div>
  );
}
