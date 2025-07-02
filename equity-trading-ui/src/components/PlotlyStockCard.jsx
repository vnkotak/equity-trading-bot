import React, { useState } from 'react';
import Plot from 'react-plotly.js';

export default function PlotlyStockCard({ stock }) {
  const [expanded, setExpanded] = useState(false);

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

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer bg-gradient-to-r from-indigo-500 to-indigo-700 text-white hover:from-indigo-600 hover:to-indigo-800 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
          <h2 className="text-lg font-semibold">{stock.ticker}</h2>
          <span className="text-sm sm:inline hidden text-white/80">
            ({buySignalCount} Buy, {sellSignalCount} Sell)
          </span>
        </div>
        <div className="text-xl">{expanded ? '🔼' : '🔽'}</div>
      </div>
      {expanded && (
        <div className="space-y-6 p-4 bg-white">
          <div className="text-sm text-gray-600 sm:hidden block text-center">
            ({buySignalCount} Buy, {sellSignalCount} Sell)
          </div>

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
              title: 'Close & EMA + Buy/Sell Signals',
              height: 300,
              autosize: true,
              margin: { t: 30, r: 10, b: 40, l: 40 },
              font: { family: 'Inter, sans-serif', size: 12 },
            }}
            useResizeHandler
            style={{ width: '100%' }}
          />

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
              title: 'RSI',
              height: 250,
              autosize: true,
              margin: { t: 30, r: 10, b: 40, l: 40 },
              font: { family: 'Inter, sans-serif', size: 12 },
            }}
            useResizeHandler
            style={{ width: '100%' }}
          />

          <Plot
            data={[
              { x: dates, y: macd, type: 'scatter', name: 'MACD', line: { color: 'blue' } },
              { x: dates, y: signal, type: 'scatter', name: 'Signal Line', line: { color: 'red' } },
            ]}
            layout={{
              title: 'MACD & Signal',
              height: 250,
              autosize: true,
              margin: { t: 30, r: 10, b: 40, l: 40 },
              font: { family: 'Inter, sans-serif', size: 12 },
            }}
            useResizeHandler
            style={{ width: '100%' }}
          />

          <Plot
            data={[
              { x: dates, y: volume, type: 'bar', name: 'Volume', marker: { color: 'gray' } },
              { x: dates, y: volumeAvg, type: 'scatter', name: '20-day Avg', line: { color: 'black' } },
            ]}
            layout={{
              title: 'Volume & Avg',
              height: 250,
              autosize: true,
              margin: { t: 30, r: 10, b: 40, l: 40 },
              font: { family: 'Inter, sans-serif', size: 12 },
            }}
            useResizeHandler
            style={{ width: '100%' }}
          />
        </div>
      )}
    </div>
  );
}
