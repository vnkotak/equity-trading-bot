import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function EChartsStockCard({ stock }) {
  const dates = stock.history.map((d) => d.date);

  const getChartOption = (title, series) => ({
    title: { text: title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series,
    grid: { top: 30, bottom: 40, left: 40, right: 20 },
  });

  const closeData = stock.history.map((d) => d.close);
  const emaData = stock.history.map((d) => d.ema);
  const rsiData = stock.history.map((d) => d.rsi);
  const macdData = stock.history.map((d) => d.macd);
  const signalData = stock.history.map((d) => d.signal);
  const volumeData = stock.history.map((d) => d.volume);
  const volumeAvgData = stock.history.map((d) => d.volumeAvg);

  return (
    <div className="bg-white shadow rounded-2xl p-4 mb-6">
      <h2 className="text-xl font-bold text-blue-600 mb-2">{stock.ticker}</h2>

      {/* Chart 1: Price & EMA */}
      <ReactECharts
        option={getChartOption('Price & EMA', [
          { name: 'Close', type: 'line', data: closeData },
          { name: 'EMA 50', type: 'line', data: emaData },
        ])}
        style={{ height: 250 }}
      />

      {/* Chart 2: RSI */}
      <ReactECharts
        option={getChartOption('RSI', [
          {
            name: 'RSI',
            type: 'line',
            data: rsiData,
            markLine: {
              silent: true,
              data: [{ yAxis: 55 }],
              lineStyle: { type: 'dashed', color: 'gray' },
            },
          },
        ])}
        style={{ height: 250 }}
      />

      {/* Chart 3: MACD & Signal */}
      <ReactECharts
        option={getChartOption('MACD', [
          { name: 'MACD', type: 'line', data: macdData },
          { name: 'Signal', type: 'line', data: signalData },
        ])}
        style={{ height: 250 }}
      />

      {/* Chart 4: Volume */}
      <ReactECharts
        option={getChartOption('Volume', [
          { name: 'Volume', type: 'bar', data: volumeData },
          { name: '20-day Avg', type: 'line', data: volumeAvgData },
        ])}
        style={{ height: 250 }}
      />
    </div>
  );
}
