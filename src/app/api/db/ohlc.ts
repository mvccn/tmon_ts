interface PriceTimePoint {
  time: number; // timestamp in ms
  price: number;
}

interface OHLC {
  open: number;
  high: number;
  low: number;
  close: number;
  time: string;
}

export function resampleToOHLC(
  data: PriceTimePoint[],
  intervalMs: number //100 ->100ms
): OHLC[] {
  let result: OHLC[] = [];
  let groupedData: Record<number, number[]> = {};

  // Step 1: Group data by 100ms intervals
  data.forEach((item) => {
    // const date = new Date(item.time);
    const periodKey = Math.floor(item.time / intervalMs);
    console.log(item.time, periodKey)
    // const periodKeyString = periodKey.toString();

    if (!groupedData[periodKey]) {
      groupedData[periodKey] = [];
    }
    groupedData[periodKey].push(item.price);
  });

  // Step 2: Calculate OHLC for each period
  for (let key in groupedData) {
    let values = groupedData[key];
    let ohlc: OHLC = {
      open: values[0],
      high: Math.max(...values),
      low: Math.min(...values),
      close: values[values.length - 1],
      time: new Date(parseInt(key)*intervalMs).toISOString(),
    };
    result.push(ohlc);
  }

  return result;
}

// // Example usage
// let timeSeriesData: TimeSeriesPoint[] = [
//     { timestamp: '2023-12-01T00:00:00.000', value: 100 },
//     { timestamp: '2023-12-01T00:00:00.100', value: 105 },
//     // ... more data points
//     { timestamp: '2023-12-01T00:00:00.200', value: 110 }
// ];

// let ohlcData = resampleToOHLC(timeSeriesData, 100); // 100ms interval
// console.log(ohlcData);
