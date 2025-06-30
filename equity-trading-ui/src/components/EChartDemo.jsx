import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const sampleData = [
  {
    date: '2024-06-01',
    close: 2500,
    ema: 2450,
    rsi: 60,
    macd: 12,
    signal: 10,
    volume: 3000000,
  },
  {
    date: '2024-06-02',
    close: 2550,
    ema: 2480,
    rsi: 62,
    macd: 13,
    signal: 11,
    volume: 3200000,
  },
  {
    date: '2024-06-03',
    close: 2600,
    ema: 2500,
    rsi: 64,
    macd: 14,
    signal: 12,
    volume: 3500000,
  },
  {
    date: '2024-06-04',
    close: 2630,
    ema: 2530,
    rsi: 66,
    macd: 15,
    signal: 13,
    volume: 3700000,
  },
  {
    date: '2024-06-05',
    close: 2650,
    ema: 2550,
    rsi: 68,
    macd: 16,
    signal: 14,
    volume: 4000000,
  },
];

export default function EChartDemo() {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);

    const option = {
      title: { text: '📈 Sample Stock Chart with ECharts' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['Close', 'EMA'] },
      xAxis: {
        type: 'category',
        data: sampleData.map((d) => d.date),
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Close',
          type: 'line',
          data: sampleData.map((d) => d.close),
          smooth: true,
        },
        {
          name: 'EMA',
          type: 'line',
          data: sampleData.map((d) => d.ema),
          smooth: true,
        },
      ],
    };

    chart.setOption(option);

    return () => chart.dispose();
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
}
