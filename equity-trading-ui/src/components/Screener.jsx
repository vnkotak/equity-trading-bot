import React from 'react';
import PlotlyStockCard from './PlotlyStockCard';
import { RotateCw } from 'lucide-react';

export default function Screener({
  stocks,
  progress,
  loading,
  total,
  currentTicker,
  fetchAllStocks,
  isPaused,
  isStopped,
  handlePauseToggle,
  handleStop
}) {
  const sortedStocks = [...stocks].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <>
      {/* Progress Section */}
      {(loading || isPaused) && !isStopped && (
        <div className="text-center space-y-4 animate-fade-in">
          <p className="text-lg font-medium text-gray-700">
            Scanning {currentTicker || 'stocks'}... {progress}%
          </p>

          <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <p className="text-sm text-gray-600">
            Number of stocks matched: {stocks.length} / {total}
          </p>

          <div className="flex gap-4 justify-center mt-4">
            <button
              className={`px-4 py-2 rounded-full font-semibold shadow hover:scale-105 transition
                ${isPaused
                  ? 'bg-sky-500 hover:bg-sky-600 text-white'
                  : 'bg-amber-400 hover:bg-amber-500 text-black'}
              `}
              onClick={handlePauseToggle}
            >
              {isPaused ? '▶️ Start' : '⏸️ Pause'}
            </button>

            <button
              className="bg-rose-400 hover:bg-rose-500 text-white px-4 py-2 rounded-full shadow hover:scale-105 transition"
              onClick={handleStop}
            >
              ⏹️ Stop
            </button>
          </div>
        </div>
      )}

      {/* No Match Message */}
      {!loading && stocks.length === 0 && (isStopped || progress === 100) && (
        <p className="text-center text-red-600 font-semibold text-lg mt-6">
          🚫 No stocks found matching criteria out of {total} scanned.
        </p>
      )}

      {/* Stock Cards */}
      <div className="space-y-6">
        {sortedStocks.map((stock, idx) => (
          <div key={idx} className="relative">

            {/* Number Bubble (Top Left) */}
            <div className="absolute -top-3 -left-3 bg-indigo-100 text-indigo-800 font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shadow">
              {idx + 1}
            </div>

            {/* Score Badge (Top Right) */}
            <div className="absolute -top-3 -right-3 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-[2px] rounded-full border border-indigo-500 shadow-sm">
               Score: {stock.score || 0}
            </div>

            <PlotlyStockCard stock={stock} />
          </div>
        ))}
      </div>

      {/* Floating Refresh Button */}
      <button
        onClick={fetchAllStocks}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
        title="Rescan Screener"
      >
        <RotateCw className="w-5 h-5" />
      </button>
    </>
  );
}
