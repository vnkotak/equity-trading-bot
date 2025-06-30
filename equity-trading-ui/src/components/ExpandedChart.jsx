import React from "react";
import Plot from "react-plotly.js";

export default function ExpandedChart({ stock }) {
  if (!stock || !stock.history || stock.history.length === 0) return null;

  const df = stock.history;

  // Extract data arrays
  const dates = df.map((d) => d.date);
  const close = df.map((d) => d.close);
  const ema = df.map((d) => d.ema);
  const rsi = df.map((d) => d.rsi);
  const macd = df.map((d) => d.macd);
  const signal = df.map((d) => d.signal);
  const volume = df.map((d) => d.volume);
  const volAvg = df.map((d) => d.volumeAvg);

  // Signal points
  const buySignals = df
    .map((d, i) =>
      d.signal_trigger ? { x: dates[i], y: d.close[i] } : null
    )
    .filter(Boolean);

  return (
    <Plot
      data={[
        // 1. Price + EMA
        {
          x: dates,
          y: close,
          type: "scatter",
          mode: "lines",
          name: "Close",
          line: { color: "black" },
          yaxis: "y1"
        },
        {
          x: dates,
          y: ema,
          type: "scatter",
          mode: "lines",
          name: "EMA 50",
          line: { color: "orange", dash: "dot" },
          yaxis: "y1"
        },
        {
          x: buySignals.map((p) => p.x),
          y: buySignals.map((p) => p.y),
          type: "scatter",
          mode: "markers",
          name: "Buy Signal",
          marker: { color: "green", size: 10, symbol: "triangle-up" },
          yaxis: "y1"
        },

        // 2. RSI
        {
          x: dates,
          y: rsi,
          type: "scatter",
          mode: "lines",
          name: "RSI",
          line: { color: "purple" },
          yaxis: "y2"
        },

        // 3. MACD + Signal
        {
          x: dates,
          y: macd,
          type: "scatter",
          mode: "lines",
          name: "MACD",
          line: { color: "blue" },
          yaxis: "y3"
        },
        {
          x: dates,
          y: signal,
          type: "scatter",
          mode: "lines",
          name: "Signal",
          line: { color: "red" },
          yaxis: "y3"
        },

        // 4. Volume
        {
          x: dates,
          y: volume,
          type: "bar",
          name: "Volume",
          marker: { color: "gray" },
          yaxis: "y4"
        },
        {
          x: dates,
          y: volAvg,
          type: "scatter",
          mode: "lines",
          name: "Avg Vol",
          line: { color: "black", dash: "dot" },
          yaxis: "y4"
        }
      ]}
      layout={{
        title: `${stock.ticker} Strategy Dashboard`,
        height: 700,
        showlegend: true,
        margin: { t: 50, l: 50, r: 30, b: 40 },
        xaxis: {
          domain: [0, 1],
          anchor: "y4"
        },
        yaxis: {
          domain: [0.75, 1],
          title: "Price"
        },
        yaxis2: {
          domain: [0.5, 0.75],
          title: "RSI"
        },
        yaxis3: {
          domain: [0.25, 0.5],
          title: "MACD"
        },
        yaxis4: {
          domain: [0, 0.25],
          title: "Volume"
        }
      }}
      useResizeHandler
      style={{ width: "100%", height: "100%" }}
      config={{ responsive: true }}
    />
  );
}
