// /src/components/StockChartPlotly.jsx
import React from 'react';
import Plot from 'react-plotly.js';

export default function StockChartPlotly({ data }) {
  const dates = data.map((d) => d.date);

  return (
    <div className="bg-white rounded-2xl shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-3">
        {data[0]?.ticker || 'Stock Chart'}
      </h2>

      <Plot
        data={[
          {
            x: dates,
            y: data.map((d) => d.close),
            type: 'scatter',
            mode: 'lines',
            name: 'Close',
            line: { color: 'black' },
          },
          {
            x: dates,
            y: data.map((d) => d.ema),
            type: 'scatter',
            mode: 'lines',
            name: 'EMA 50',
            line: { color: 'orange' },
          },
          {
            x: data.filter((d) => d.signal_trigger).map((d) => d.date),
            y: data.filter((d) => d.signal_trigger).map((d) => d.close),
            mode: 'markers',
            name: 'Buy Signal',
            marker: { color: 'green', symbol: 'triangle-up', size: 10 },
          },
        ]}
        layout={{
          title: 'Price + EMA + Buy Signal',
          margin: { t: 40 },
          height: 300,
        }}
      />

      <Plot
        data={[
          {
            x: dates,
            y: data.map((d) => d.rsi),
            type: 'scatter',
            mode: 'lines',
            name: 'RSI',
            line: { color: 'purple' },
          },
          {
            x: [dates[0], dates[dates.length - 1]],
            y: [55, 55],
            mode: 'lines',
            name: 'Threshold (55)',
            line: { dash: 'dash', color: 'gray' },
          },
        ]}
        layout={{
          title: 'RSI',
          margin: { t: 40 },
          height: 250,
        }}
      />

      <Plot
        data={[
          {
            x: dates,
            y: data.map((d) => d.macd),
            type: 'scatter',
            mode: 'lines',
            name: 'MACD',
            line: { color: 'blue' },
          },
          {
            x: dates,
            y: data.map((d) => d.signal),
            type: 'scatter',
            mode: 'lines',
            name: 'Signal',
            line: { color: 'red' },
          },
        ]}
        layout={{
          title: 'MACD vs Signal',
          margin: { t: 40 },
          height: 250,
        }}
      />

      <Plot
        data={[
          {
            x: dates,
            y: data.map((d) => d.volume),
            type: 'bar',
            name: 'Volume',
            marker: { color: 'gray' },
          },
          {
            x: dates,
            y: data.map((d) => d.volumeAvg),
            type: 'scatter',
            mode: 'lines',
            name: '20d Avg Volume',
            line: { color: 'black' },
          },
        ]}
        layout={{
          title: 'Volume',
          margin: { t: 40 },
          height: 250,
        }}
      />
    </div>
  );
}
