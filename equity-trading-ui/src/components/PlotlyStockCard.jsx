import React, { useState } from 'react';
import Plot from 'react-plotly.js';

export default function PlotlyStockCard({ stock }) {
  const [expanded, setExpanded] = useState(false);
  const [showChart, setShowChart] = useState({
    price: true,
    rsi: true,
    macd: true,
    volume: true,
    willr: true,
    atr: true,
    bbpos: true,
    priceChange: true,
    stoch: true,
  });

  if (!stock || !stock.history || stock.history.length === 0) return null;

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
  const change1d = stock.history.map((d) => d.priceChange1D);
  const change3d = stock.history.map((d) => d.priceChange3D);
  const change5d = stock.history.map((d) => d.priceChange5D);
  const stochK = stock.history.map((d) => d.stochK);
  const stochD = stock.history.map((d) => d.stochD);

  const triggers = stock.history.map((d) => (d.signal_trigger ? d.close : null));
  const triggerText = stock.history.map((d) =>
    d.signal_trigger ? `✅ Buy Signal\n${d.date}\nClose: ₹${d.close}` : ''
  );
  const sellTriggers = stock.history.map((d) => (d.sell_trigger ? d.close : null));
  const sellTriggerText = stock.history.map((d) =>
    d.sell_trigger ? `🔻 Sell Signal\n${d.date}\nClose: ₹${d.close}` : ''
  );

  const toggleChart = (key) => setShowChart((prev) => ({ ...prev, [key]: !prev[key] }));

  const chartLayout = (title, height = 250) => ({
    height,
    title: { text: title, font: { size: 16 } },
    autosize: true,
    margin: { t: 40, r: 10, b: 40, l: 40 },
    font: { family: 'Montserrat, sans-serif', size: 12 },
    paper_bgcolor: '#fff',
    plot_bgcolor: '#fff',
  });

  const chartBlock = (key, title, content) => (
    <div className="rounded-xl shadow border bg-white p-4">
      <div
        className="flex justify-between items-center cursor-pointer mb-2"
        onClick={() => toggleChart(key)}
      >
        <h3 className="font-semibold text-blue-700">{title}</h3>
        <span>{showChart[key] ? '🔽' : '▶️'}</span>
      </div>
      {showChart[key] && content}
    </div>
  );

  return (
    <div className="rounded-xl shadow-lg border border-gray-200 overflow-hidden bg-white text-black">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer bg-gradient-to-r from-blue-100 to-sky-50 hover:from-blue-200 hover:to-sky-100"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
          <h2 className="text-lg font-bold tracking-wide text-blue-800">{stock.ticker}</h2>
        </div>
        <div className="text-xl">{expanded ? '🔼' : '🔽'}</div>
      </div>

      {expanded && (
        <div className="space-y-6 p-5">
          {chartBlock(
            'price',
            '📈 Close & EMA + Buy/Sell Signals',
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
              layout={chartLayout('Close & EMA')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          )}

          {chartBlock(
            'rsi',
            '📊 RSI',
            <Plot
              data={[{ x: dates, y: rsi, type: 'scatter', name: 'RSI', line: { color: 'purple' } }]}
              layout={chartLayout('RSI')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          )}

          {chartBlock(
            'macd',
            '📉 MACD & Signal',
            <Plot
              data={[
                { x: dates, y: macd, type: 'scatter', name: 'MACD', line: { color: 'blue' } },
                { x: dates, y: signal, type: 'scatter', name: 'Signal', line: { color: 'red' } },
              ]}
              layout={chartLayout('MACD')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          )}

          {chartBlock(
            'volume',
            '📦 Volume & 20-day Avg',
            <Plot
              data={[
                { x: dates, y: volume, type: 'bar', name: 'Volume', marker: { color: 'gray' } },
                { x: dates, y: volumeAvg, type: 'scatter', name: '20-day Avg', line: { color: 'black' } },
              ]}
              layout={chartLayout('Volume')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          )}

          {chartBlock(
            'willr',
            '📉 Williams %R',
            <Plot
              data={[{ x: dates, y: willr, type: 'scatter', name: 'Williams %R', line: { color: 'teal' } }]}
              layout={chartLayout('Williams %R')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          )}

          {chartBlock(
            'atr',
            '📏 ATR',
            <Plot
              data={[{ x: dates, y: atr, type: 'scatter', name: 'ATR', line: { color: 'brown' } }]}
              layout={chartLayout('ATR')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          )}

          {chartBlock(
            'bbpos',
            '📶 Bollinger Band Position',
            <Plot
              data={[{ x: dates, y: bbpos, type: 'scatter', name: 'BB Position', line: { color: 'darkgreen' } }]}
              layout={chartLayout('Bollinger Band Position')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          )}

          {chartBlock(
            'priceChange',
            '📊 Price Change % (1D/3D/5D)',
            <Plot
              data={[
                { x: dates, y: change1d, type: 'scatter', name: '1D %', line: { color: 'steelblue' } },
                { x: dates, y: change3d, type: 'scatter', name: '3D %', line: { color: 'cadetblue' } },
                { x: dates, y: change5d, type: 'scatter', name: '5D %', line: { color: 'lightslategray' } },
              ]}
              layout={chartLayout('Price Change %')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          )}

          {chartBlock(
            'stoch',
            '📉 Stochastic %K & %D',
            <Plot
              data={[
                { x: dates, y: stochK, type: 'scatter', name: 'Stoch %K', line: { color: 'darkorange' } },
                { x: dates, y: stochD, type: 'scatter', name: 'Stoch %D', line: { color: 'crimson' } },
              ]}
              layout={chartLayout('Stochastic Oscillator')}
              useResizeHandler
              style={{ width: '100%' }}
            />
          )}
        </div>
      )}
    </div>
  );
}
