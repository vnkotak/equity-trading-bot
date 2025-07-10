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

  const columns = useMemo(() => {
    const baseCols = [
      {
        accessorKey: "timestamp",
        header: () => <SortableHeader label="Date" />,        
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        enableColumnFilter: true
      },
      {
        accessorKey: "ticker",
        header: () => <SortableHeader label="Ticker" />,        
        cell: (info) => info.getValue(),
        enableColumnFilter: true
      },
      {
        accessorKey: "price",
        header: () => <SortableHeader label="Buy Price" />,        
        cell: (info) => `₹${(+info.getValue()).toFixed(2)}`,
        enableColumnFilter: true
      },
      {
        accessorKey: "sell_or_current_price",
        header: () => (
          <SortableHeader label={status === "open" ? "Current Price" : "Sell Price"} />
        ),
        cell: (info) => `₹${(+info.getValue()).toFixed(2)}`,
        enableColumnFilter: true
      },
      {
        accessorKey: "quantity",
        header: () => <SortableHeader label="Qty" />,        
        cell: (info) => info.getValue(),
        enableColumnFilter: true
      },
      {
        accessorKey: "total_invested",
        header: () => <SortableHeader label="Invested" />,        
        cell: (info) => `₹${(+info.getValue()).toFixed(2)}`,
        enableColumnFilter: true
      },
      {
        accessorKey: "current_value",
        header: () => <SortableHeader label="Curr Value" />,        
        cell: (info) => `₹${(+info.getValue()).toFixed(2)}`,
        enableColumnFilter: true
      },
      {
        accessorKey: "profit",
        header: () => <SortableHeader label="Profit" />,        
        cell: (info) => {
          const val = +info.getValue();
          return (
            <span className={val >= 0 ? "text-green-600" : "text-red-600"}>
              ₹{val.toFixed(2)}
            </span>
          );
        },
        enableColumnFilter: true
      },
      {
        accessorKey: "profit_pct",
        header: () => <SortableHeader label="Profit %" />,        
        cell: (info) => {
          const val = +info.getValue();
          return (
            <span className={val >= 0 ? "text-green-600" : "text-red-600"}>
              {val.toFixed(2)}%
            </span>
          );
        },
        enableColumnFilter: true
      }
    ];

    if (status === "closed") {
      baseCols.push({
        accessorKey: "reason",
        header: () => <SortableHeader label="Reason" />,        
        cell: (info) => info.getValue() || "-",
        enableColumnFilter: true
      });
    }

    if (status === "all") {
      baseCols.push({
        accessorKey: "status",
        header: () => <SortableHeader label="Status" />,        
        cell: (info) => info.getValue(),
        enableColumnFilter: true
      });
    }

    return baseCols;
  }, [status]);

  const table = useReactTable({
    data: trades,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-indigo-700 text-center">
        💼 Trades Dashboard
      </h1>

      {/* Tabs */}
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

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow">
        {[
          "total_invested",
          "current_value",
          "profit",
          "profit_pct"
        ].map((key) => (
          <div key={key} className="text-center min-h-[48px] flex flex-col justify-center">
            <p className="text-gray-500 text-sm capitalize">
              {key.replace(/_/g, " ")}
            </p>
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

      {/* Extra Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow">
        {status === "open" && (
          <>
            <MetricCard title="Total Buys" value={summary?.total_buy_trades} loading={loading} />
            <MetricCard title="Open Trades" value={summary?.open_trades} loading={loading} />
            <MetricCard title="Winning Trades" value={summary?.winning_trades} loading={loading} />
            <MetricCard title="Winning %" value={`${summary?.winning_pct?.toFixed(2)}%`} loading={loading} />
          </>
        )}
        {status === "closed" && (
          <>
            <MetricCard title="Total Buys" value={summary?.total_buy_trades} loading={loading} />
            <MetricCard title="Closed Trades" value={summary?.closed_trades} loading={loading} />
            <MetricCard title="Winning Trades" value={summary?.winning_trades} loading={loading} />
            <MetricCard title="Winning %" value={`${summary?.winning_pct?.toFixed(2)}%`} loading={loading} />
          </>
        )}
        {status === "all" && (
          <>
            <MetricCard title="Open Trades" value={summary?.open_trades} loading={loading} />
            <MetricCard title="Closed Trades" value={summary?.closed_trades} loading={loading} />
            <MetricCard title="Winning Trades" value={summary?.winning_trades} loading={loading} />
            <MetricCard title="Winning %" value={`${summary?.winning_pct?.toFixed(2)}%`} loading={loading} />
          </>
        )}
      </div>

      {/* Table */}
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
                    <th key={header.id} className="p-2 border text-left w-32">
                      <div
                        className="cursor-pointer select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc"
                          ? " ↑"
                          : header.column.getIsSorted() === "desc"
                          ? " ↓"
                          : ""}
                      </div>
                      {header.column.getCanFilter() ? (
                        <div>
                          <input
                            type="text"
                            onChange={(e) =>
                              header.column.setFilterValue(e.target.value)
                            }
                            value={header.column.getFilterValue() ?? ""}
                            placeholder="Filter..."
                            className="mt-1 block w-full px-2 py-1 text-xs border rounded"
                          />
                        </div>
                      ) : null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 even:bg-gray-50">
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

function SortableHeader({ label }) {
  return <span className="font-medium text-sm">{label}</span>;
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
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.1s]" />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
    </div>
  );
}
