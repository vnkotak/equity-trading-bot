import React, { useEffect, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import matchSorter from "match-sorter";

export default function Trades() {
  const [trades, setTrades] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("open");
  const [loading, setLoading] = useState(false);

  const fetchTrades = async (filter) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://fastapi-trading-bot-1.onrender.com/trades-summary?status=${filter}`
      );
      const data = await res.json();
      setTrades(data.trades || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error("Failed to fetch trades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades(status);
  }, [status]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "timestamp",
        header: "Date",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      },
      {
        accessorKey: "ticker",
        header: "Ticker",
        cell: (info) => info.getValue(),
        filterFn: "includesString",
      },
      {
        accessorKey: "price",
        header: "Buy Price",
        cell: (info) => {
          const val = info.getValue();
          return typeof val === "number" ? `₹${val.toFixed(2)}` : "-";
        },
      },
      {
        accessorKey: "sell_or_current_price",
        header: status === "open" ? "Current Price" : "Sell Price",
        cell: (info) => {
          const val = info.getValue();
          return typeof val === "number" ? `₹${val.toFixed(2)}` : "-";
        },
      },
      {
        accessorKey: "quantity",
        header: "Qty",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "total_invested",
        header: "Invested",
        cell: (info) => {
          const val = info.getValue();
          return typeof val === "number" ? `₹${val.toFixed(2)}` : "-";
        },
      },
      {
        accessorKey: "current_value",
        header: "Curr Value",
        cell: (info) => {
          const val = info.getValue();
          return typeof val === "number" ? `₹${val.toFixed(2)}` : "-";
        },
      },
      {
        accessorKey: "profit",
        header: "Profit",
        cell: (info) => {
          const val = info.getValue();
          const num = typeof val === "number" ? val.toFixed(2) : "-";
          return (
            <span className={val >= 0 ? "text-green-600" : "text-red-600"}>₹{num}</span>
          );
        },
      },
      {
        accessorKey: "profit_pct",
        header: "Profit %",
        cell: (info) => {
          const val = info.getValue();
          const num = typeof val === "number" ? val.toFixed(2) : "-";
          return (
            <span className={val >= 0 ? "text-green-600" : "text-red-600"}>{num}%</span>
          );
        },
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: (info) => info.getValue() || "-",
      },
    ],
    [status]
  );

  const table = useReactTable({
    data: trades,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {},
  });

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-indigo-700 text-center">💼 Trades Dashboard</h1>

      {/* Toggle Tabs */}
      <div className="relative w-full max-w-sm mx-auto">
        <div className="grid grid-cols-3 bg-gray-200 rounded-full shadow-inner p-1 relative">
          <span
            className="absolute inset-y-1 transition-all duration-300 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            style={{
              left:
                status === "open"
                  ? "4px"
                  : status === "closed"
                  ? "calc(33.333% + 4px)"
                  : "calc(66.666% + 4px)",
              width: "calc(33.333% - 8px)",
            }}
          ></span>
          {["open", "closed", "all"].map((opt) => (
            <button
              key={opt}
              onClick={() => setStatus(opt)}
              className={`relative z-10 w-full py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                status === opt ? "text-white" : "text-gray-800"
              }`}
            >
              {opt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow">
        {["total_invested", "current_value", "profit", "profit_pct"].map((key) => (
          <div key={key} className="text-center min-h-[48px] flex flex-col justify-center">
            <p className="text-gray-500 text-sm capitalize">{key.replace(/_/g, " ")}</p>
            <p
              className={`text-lg font-bold ${
                key.includes("profit")
                  ? summary?.[key] >= 0
                    ? "text-green-600"
                    : "text-red-600"
                  : "text-blue-800"
              }`}
            >
              {loading ? (
                <LoadingDots />
              ) : typeof summary?.[key] === "number" ? (
                key.includes("pct")
                  ? `${summary[key].toFixed(2)}%`
                  : `₹${summary[key].toFixed(2)}`
              ) : (
                "-"
              )}
            </p>
          </div>
        ))}
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
            <thead className="bg-indigo-100 text-indigo-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-2 border text-left">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2 border text-left">
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
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.1s]" />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
    </div>
  );
}
