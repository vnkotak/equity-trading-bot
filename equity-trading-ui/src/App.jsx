import React, { useState } from 'react';
import Screener from './components/Screener';
import Trades from './components/Trades';

export default function App() {
  const [view, setView] = useState('screener');

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6 relative">
      <h1 className="text-4xl font-extrabold text-center text-indigo-700 drop-shadow-sm">
        📈 NSE Equity Dashboard
      </h1>

      {/* Toggle: Screener / Trades */}
      <div className="relative w-full max-w-xs mx-auto mt-4">
        <div className="grid grid-cols-2 bg-gray-200 rounded-full shadow-inner p-1 relative">
          <span
            className={`absolute inset-y-1 transition-all duration-300 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500`}
            style={{
              left: view === 'screener' ? '4px' : 'calc(50% + 4px)',
              width: 'calc(50% - 8px)',
            }}
          ></span>

          {['screener', 'trades'].map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`relative z-10 w-full py-2 font-semibold text-sm transition-all rounded-full ${
                view === tab ? 'text-white' : 'text-gray-800'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Rendering */}
      {view === 'screener' ? <Screener /> : <Trades />}
    </div>
  );
}
