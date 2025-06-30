// /src/data/sampleData.js
export const sampleData = {
  ticker: 'HDFCLIFE.NS',
  history: [
    {
      date: '2024-06-01',
      close: 800.5,
      ema: 790.1,
      rsi: 65.2,
      macd: 12.5,
      signal: 10.2,
      volume: 1500000,
      volumeAvg: 1200000,
      signal_trigger: true,
    },
    {
      date: '2024-06-02',
      close: 805.3,
      ema: 792.0,
      rsi: 67.0,
      macd: 13.0,
      signal: 11.0,
      volume: 1600000,
      volumeAvg: 1250000,
      signal_trigger: false,
    },
    {
      date: '2024-06-03',
      close: 810.6,
      ema: 794.5,
      rsi: 69.3,
      macd: 14.0,
      signal: 11.5,
      volume: 1700000,
      volumeAvg: 1300000,
      signal_trigger: true,
    },
    // Add more points...
  ],
};
