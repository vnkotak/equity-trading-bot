import React, { useState } from 'react';
import Plot from 'react-plotly.js';

export default function PlotlyStockCard({ stock }) {
  const [expanded, setExpanded] = useState(false);
  const [showChart, setShowChart] = useState({
    price: true,
    rsi: true,
    macd: true,
    volume: true,
  });
  const [darkMode, setDarkMode] = useState(false);

  if (!stock || !stock.history || stock.history.length === 0) {
    return null;
  }

  const dates = stock.history.map((d) => d.date);
  const close = stock.history.map((d) => d.close);
  const ema = stock.history.map((d) => d.ema);
  const rsi = stock.history.map((d) => d.rsi);
  const macd = stock.history.map((d) => d.macd);
  const signal = stock.history.map((d) => d.signal);
  const volume = stock.history.map((d) => d.volume);
  const volumeAvg = stock.history.map((d) => d.volumeAvg);

  const triggers = stock.history.map((d) => d.signal_trigger ? d.close : null);
  const triggerText = stock.history.map((d) =>
    d.signal_trigger
      ? `Buy Signal on ${d.date}\nClose: ${d.close}\nRSI: ${d.rsi}\nMACD: ${d.macd.toFixed(2)}`
      : ''
  );
  const buySignalCount = stock.history.filter((d) => d.signal_trigger).length;

  const sellTriggers = stock.history.map((d) => d.sell_trigger ? d.close : null);
  const sellTriggerText = stock.history.map((d) =>
    d.sell_trigger
      ? `Sell Signal on ${d.date}\nClose: ${d.close}\nRSI: ${d.rsi}\nMACD: ${d.macd.toFixed(2)}`
      : ''
  );
  const sellSignalCount = stock.history.filter((d) => d.sell_trigger).length;

  const bg = darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black';
  const sectionBg = darkMode ? 'bg-gray-800' : 'bg-gray-100';

  const toggleChart = (key) => {
    setShowChart((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={`rounded-xl shadow-lg border border-gray-200 overflow-hidden ${bg}`}>      
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer bg-gradient-to-r from-sky-100 to-blue-50 text-gray-900 hover:from-blue-100 hover:to-sky-100 transition dark:from-gray-700 dark:to-gray-800 dark:text-white"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
          <h2 className="text-lg font-bold tracking-wide text-blue-800 dark:text-blue-300">{stock.ticker}</h2>
          <span className="text-sm sm:inline hidden text-gray-700 dark:text-gray-300">
            ({buySignalCount} Buy, {sellSignalCount} Sell)
          </span>
        </div>
        <div className="text-xl">{expanded ? '🔼' : '🔽'}</div>
      </div>

      {expanded && (
        <div className={`space-y-6 p-5 ${bg}`}>
          <div className="flex justify-between mb-4">
            <div className="text-sm text-gray-600 sm:hidden block text-center dark:text-gray-300">
              ({buySignalCount} Buy, {sellSignalCount} Sell)
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-sm px-3 py-1 border rounded hover:bg-gray-200 dark:hover:bg-gray-700 dark:border-gray-600"
            >
              {darkMode ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>

          {/* Chart: Close & EMA */}
          <div className={`rounded-lg shadow-sm ${sectionBg} p-3`}>
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleChart('price')}
            >
              <h3 className="font-semibold">📈 Close & EMA + Buy/Sell Signals</h3>
              <span>{showChart.price ? '−' : '+'}</span>
            </div>
            {showChart.price && (
              <Plot
                data={[
                  { x: dates, y: close, type: 'scatter', name: 'Close', line: { color: 'black' } },
                  { x: dates, y: ema, type: 'scatter', name: 'EMA 50', line: { color: 'orange' } },
                  {
                    x: dates,
                    y: triggers,
                    text: triggerText,
                    type: 'scatter',
                    mode: 'markers',
                    name: 'Buy Signal',
                    marker: { color: 'green', size: 10, symbol: 'triangle-up' },
                    hoverinfo: 'text',
                  },
                  {
                    x: dates,
                    y: sellTriggers,
                    text: sellTriggerText,
                    type: 'scatter',
                    mode: 'markers',
                    name: 'Sell Signal',
                    marker: { color: 'red', size: 10, symbol: 'triangle-down' },
                    hoverinfo: 'text',
                  },
                ]}
                layout={{
                  height: 300,
                  autosize: true,
                  margin: { t: 30, r: 10, b: 40, l: 40 },
                  font: { family: 'Inter, sans-serif', size: 12 },
                  paper_bgcolor: darkMode ? '#1f2937' : 'white',
                  plot_bgcolor: darkMode ? '#1f2937' : 'white',
                }}
                useResizeHandler
                style={{ width: '100%' }}
              />
            )}
          </div>

          {/* Chart: RSI */}
          <div className={`rounded-lg shadow-sm ${sectionBg} p-3`}>
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleChart('rsi')}
            >
              <h3 className="font-semibold">📊 RSI</h3>
              <span>{showChart.rsi ? '−' : '+'}</span>
            </div>
            {showChart.rsi && (
              <Plot
                data={[
                  { x: dates, y: rsi, type: 'scatter', name: 'RSI', line: { color: 'purple' } },
                  {
                    x: dates,
                    y: Array(dates.length).fill(55),
                    type: 'scatter',
                    name: 'Threshold 55',
                    line: { dash: 'dash', color: 'gray' },
                  },
                ]}
                layout={{
                  height: 250,
                  autosize: true,
                  margin: { t: 30, r: 10, b: 40, l: 40 },
                  font: { family: 'Inter, sans-serif', size: 12 },
                  paper_bgcolor: darkMode ? '#1f2937' : 'white',
                  plot_bgcolor: darkMode ? '#1f2937' : 'white',
                }}
                useResizeHandler
                style={{ width: '100%' }}
              />
            )}
          </div>

          {/* Chart: MACD */}
          <div className={`rounded-lg shadow-sm ${sectionBg} p-3`}>
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleChart('macd')}
            >
              <h3 className="font-semibold">📉 MACD & Signal</h3>
              <span>{showChart.macd ? '−' : '+'}</span>
            </div>
            {showChart.macd && (
              <Plot
                data={[
                  { x: dates, y: macd, type: 'scatter', name: 'MACD', line: { color: 'blue' } },
                  { x: dates, y: signal, type: 'scatter', name: 'Signal Line', line: { color: 'red' } },
                ]}
                layout={{
                  height: 250,
                  autosize: true,
                  margin: { t: 30, r: 10, b: 40, l: 40 },
                  font: { family: 'Inter, sans-serif', size: 12 },
                  paper_bgcolor: darkMode ? '#1f2937' : 'white',
                  plot_bgcolor: darkMode ? '#1f2937' : 'white',
                }}
                useResizeHandler
                style={{ width: '100%' }}
              />
            )}
          </div>

          {/* Chart: Volume */}
          <div className={`rounded-lg shadow-sm ${sectionBg} p-3`}>
            <div
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleChart('volume')}
            >
              <h3 className="font-semibold">📦 Volume & Avg</h3>
              <span>{showChart.volume ? '−' : '+'}</span>
            </div>
            {showChart.volume && (
              <Plot
                data={[
                  { x: dates, y: volume, type: 'bar', name: 'Volume', marker: { color: 'gray' } },
                  { x: dates, y: volumeAvg, type: 'scatter', name: '20-day Avg', line: { color: 'black' } },
                ]}
                layout={{
                  height: 250,
                  autosize: true,
                  margin: { t: 30, r: 10, b: 40, l: 40 },
                  font: { family: 'Inter, sans-serif', size: 12 },
                  paper_bgcolor: darkMode ? '#1f2937' : 'white',
                  plot_bgcolor: darkMode ? '#1f2937' : 'white',
                }}
                useResizeHandler
                style={{ width: '100%' }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
