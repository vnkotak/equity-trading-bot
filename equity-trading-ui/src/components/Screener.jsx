import React from 'react';
import PlotlyStockCard from './PlotlyStockCard';
import { RotateCw } from 'lucide-react';

export default function Screener({ stocks, progress, loading, total, currentTicker, fetchAllStocks }) {
  return (
    <>
      {loading && (
        <div className="text-center space-y-3 animate-fade-in">
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
        </div>
      )}

      {!loading && stocks.length === 0 && (
        <p className="text-center text-red-600 font-semibold text-lg">
          🚫 No stocks found matching criteria.
        </p>
      )}

      <div className="space-y-6">
        {stocks.map((stock, idx) => (
          <PlotlyStockCard key={idx} stock={stock} />
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
