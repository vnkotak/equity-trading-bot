import React, { useState } from 'react';
import Plot from 'react-plotly.js';

export default function PlotlyStockCard({ stock }) {
  const [expanded, setExpanded] = useState(false);
  const [showChart, setShowChart] = useState({
    price: true,
    rsi: true,
    macd: true,
    volume: true,
    willr: false,
    atr: false,
    bbpos: false,
    pricechange: false,
    stoch: false,
  });

  if (!stock || !stock.history || stock.history.length === 0) return null;

  const matchedIndicators = stock.matched_indicators || [];
  const isMatched = (key) => matchedIndicators.includes(key);

  const dates = stock.history.map((d) => d.date);
  const close = stock.history.map((d) => d.close);
  const ema = stock.history.map((d) => d.ema);
  const rsi = stock.history.map((d) => d.rsi);
  const macd = stock.history.map((d) => d.macd);
  const signal = stock.history.map((d) => d.signal);
  const volume = stock.history.map((d) => d.volume);
  const volumeAvg = stock.history.map((d) => d.volumeAvg);
  const willr = stock.history.map((d) => d.willr);
  const atr = stock.history.map((d) => d.atr);
  const bbpos = stock.history.map((d) => d.bb_pos);
  const priceChange1D = stock.history.map((d) => d.priceChange1D);
  const priceChange3D = stock.history.map((d) => d.priceChange3D);
  const priceChange5D = stock.history.map((d) => d.priceChange5D);
  const stochK = stock.history.map((d) => d.stochK);
  const stochD = stock.history.map((d) => d.stochD);

  const triggers = stock.history.map((d) => d.signal_trigger ? d.close : null);
  const triggerText = stock.history.map((d) =>
    d.signal_trigger ? `Buy Signal on ${d.date}\nClose: ${d.close}\nRSI: ${d.rsi}\nMACD: ${d.macd.toFixed(2)}` : ''
  );
  const sellTriggers = stock.history.map((d) => d.sell_trigger ? d.close : null);
  const sellTriggerText = stock.history.map((d) =>
    d.sell_trigger ? `Sell Signal on ${d.date}\nClose: ${d.close}\nRSI: ${d.rsi}\nMACD: ${d.macd.toFixed(2)}` : ''
  );
  const buySignalCount = stock.history.filter((d) => d.signal_trigger).length;
  const sellSignalCount = stock.history.filter((d) => d.sell_trigger).length;

  const toggleChart = (key) => {
    setShowChart((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const chartLayout = (title) => ({
    title,
    height: 250,
    autosize: true,
    margin: { t: 30, r: 10, b: 40, l: 40 },
    font: { family: 'Montserrat, sans-serif', size: 12 },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
  });

  const chartBlock = (key, title, content) => (
    <div
      className={`rounded-xl p-3 transition-all ${
        isMatched(key)
          ? 'border-2 border-green-500 shadow-lg shadow-green-200/40'
          : 'border border-gray-200 shadow-sm'
      } bg-white`}
    >
      <div className="flex justify-between items-center cursor-pointer mb-2" onClick={() => toggleChart(key)}>
        <h3 className="font-semibold flex items-center gap-2">
          {title}
          {isMatched(key) && (
            <span className="text-green-700 bg-green-100 text-xs px-2 py-0.5 rounded-full shadow-sm">
              Match
            </span>
          )}
        </h3>
        <span>{showChart[key] ? '🔽' : '▶️'}</span>
      </div>
      {showChart[key] && content}
    </div>
  );

  return (
    <div className="rounded-xl shadow-lg border border-gray-200 overflow-hidden bg-white text-black">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer bg-gradient-to-r from-blue-100 to-sky-50 hover:from-blue-200 hover:to-sky-100 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
          <h2 className="text-lg font-bold tracking-wide text-blue-800">{stock.ticker}</h2>
          <span className="text-sm sm:inline hidden text-gray-700">
            ({buySignalCount} Buy, {sellSignalCount} Sell)
          </span>
        </div>
        <div className="text-xl">{expanded ? '🔼' : '🔽'}</div>
      </div>

      {expanded && (
        <div className="space-y-6 p-5">
          <div className="text-sm text-gray-600 sm:hidden block text-center">
            ({buySignalCount} Buy, {sellSignalCount} Sell)
          </div>

          {chartBlock('price', '📈 Close & EMA + Buy/Sell Signals', (
            <Plot
              data={[
                { x: dates, y: close, type: 'scatter', name: 'Close', line: { color: 'black' } },
                { x: dates, y: ema, type: 'scatter', name: 'EMA 50', line: { color: 'orange' } },
                { x: dates, y: triggers, text: triggerText, type: 'scatter', mode: 'markers', name: 'Buy Signal', marker: { color: 'green', size: 10, symbol: 'triangle-up' }, hoverinfo: 'text' },
                { x: dates, y: sellTriggers, text: sellTriggerText, type: 'scatter', mode: 'markers', name: 'Sell Signal', marker: { color: 'red', size: 10, symbol: 'triangle-down' }, hoverinfo: 'text' },
              ]}
              layout={chartLayout('')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          ))}

          {chartBlock('rsi', '📊 RSI', (
            <Plot
              data={[
                { x: dates, y: rsi, type: 'scatter', name: 'RSI', line: { color: 'purple' } },
                { x: dates, y: Array(dates.length).fill(55), type: 'scatter', name: 'Threshold 55', line: { dash: 'dash', color: 'gray' } },
              ]}
              layout={chartLayout('')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          ))}

          {chartBlock('macd', '📉 MACD & Signal', (
            <Plot
              data={[
                { x: dates, y: macd, type: 'scatter', name: 'MACD', line: { color: 'blue' } },
                { x: dates, y: signal, type: 'scatter', name: 'Signal Line', line: { color: 'red' } },
              ]}
              layout={chartLayout('')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          ))}

          {chartBlock('volume', '📦 Volume & Avg', (
            <Plot
              data={[
                { x: dates, y: volume, type: 'bar', name: 'Volume', marker: { color: 'gray' } },
                { x: dates, y: volumeAvg, type: 'scatter', name: '20-day Avg', line: { color: 'black' } },
              ]}
              layout={chartLayout('')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          ))}

          {chartBlock('willr', '📉 Williams %R', (
            <Plot
              data={[{ x: dates, y: willr, type: 'scatter', name: 'Williams %R', line: { color: 'teal' } }]}
              layout={chartLayout('')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          ))}

          {chartBlock('atr', '📏 ATR (Volatility)', (
            <Plot
              data={[{ x: dates, y: atr, type: 'scatter', name: 'ATR', line: { color: 'darkblue' } }]}
              layout={chartLayout('')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          ))}

          {chartBlock('bbpos', '📊 Bollinger Band Position', (
            <Plot
              data={[{ x: dates, y: bbpos, type: 'scatter', name: 'BB Position', line: { color: 'brown' } }]}
              layout={chartLayout('')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          ))}

          {chartBlock('pricechange', '📈 Price Change % (1D, 3D, 5D)', (
            <Plot
              data={[
                { x: dates, y: priceChange1D, type: 'scatter', name: '1D %', line: { color: 'green' } },
                { x: dates, y: priceChange3D, type: 'scatter', name: '3D %', line: { color: 'blue' } },
                { x: dates, y: priceChange5D, type: 'scatter', name: '5D %', line: { color: 'red' } },
              ]}
              layout={chartLayout('')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          ))}

          {chartBlock('stoch', '📊 Stochastic %K and %D', (
            <Plot
              data={[
                { x: dates, y: stochK, type: 'scatter', name: '%K', line: { color: 'navy' } },
                { x: dates, y: stochD, type: 'scatter', name: '%D', line: { color: 'orange' } },
              ]}
              layout={chartLayout('')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
