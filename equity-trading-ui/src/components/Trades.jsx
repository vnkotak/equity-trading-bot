import React, { useEffect, useState } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';

export default function Trades() {
  const [trades, setTrades] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('open');
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

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

  const columns = [
    { header: 'Date', accessorKey: 'timestamp', cell: info => new Date(info.getValue()).toLocaleDateString() },
    { header: 'Ticker', accessorKey: 'ticker' },
    { header: 'Buy Price', accessorKey: 'price', cell: info => `₹${parseFloat(info.getValue()).toFixed(2)}` },
    { header: 'Sell/Current Price', accessorKey: 'sell_or_current_price', cell: info => `₹${info.getValue().toFixed(2)}` },
    { header: 'Quantity', accessorKey: 'quantity' },
    { header: 'Total Invested', accessorKey: 'total_invested', cell: info => `₹${info.getValue().toFixed(2)}` },
    { header: 'Current Value', accessorKey: 'current_value', cell: info => `₹${info.getValue().toFixed(2)}` },
    { header: 'Profit', accessorKey: 'profit', cell: info => <span className={info.getValue() >= 0 ? 'text-green-600' : 'text-red-600'}>₹{info.getValue().toFixed(2)}</span> },
    { header: 'Profit %', accessorKey: 'profit_pct', cell: info => <span className={info.getValue() >= 0 ? 'text-green-600' : 'text-red-600'}>{info.getValue().toFixed(2)}%</span> },
    ...(status === 'all' ? [{ header: 'Status', accessorKey: 'status' }] : []),
    ...(status === 'closed' ? [{ header: 'Reason', accessorKey: 'reason' }] : [])
  ];

  const table = useReactTable({
    data: trades,
    columns,
    state: { globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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

      {/* Filter */}
      <div className="flex justify-end items-center">
        <input
          value={globalFilter || ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="border p-2 rounded-md text-sm w-full md:w-1/3 mb-2"
        />
      </div>

      {/* Trades Table */}
      {loading ? (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        </div>
      ) : trades.length === 0 ? (
        <p className="text-center text-red-500 font-medium">No trades to display.</p>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-100 text-indigo-800">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-2 border text-center cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted()] || ''}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 text-center">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-2 border">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
