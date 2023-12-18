/*
TS based on react chart draw aggtrades and order info
*/
'use client'
import React, { useEffect, useState } from 'react';
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import { scaleTime } from "d3-scale";
import {
  elderRay,
  ema,
  discontinuousTimeScaleProviderBuilder,
  Chart,
  ChartCanvas,
  CurrentCoordinate,
  BarSeries,
  CandlestickSeries,
  ElderRaySeries,
  LineSeries,
  MovingAverageTooltip,
  OHLCTooltip,
  SingleValueTooltip,
  lastVisibleItemBasedZoomAnchor,
  XAxis,
  YAxis,
  CrossHairCursor,
  EdgeIndicator,
  MouseCoordinateX,
  MouseCoordinateY,
  ZoomButtons,
  ScatterSeries,
  CircleMarker,
  Square,
  Triangle,
  // withDeviceRatio,
  // withSize
} from "react-financial-charts";

import { OrderSeries } from './series/OrderSeries';
import { OHLCSeries } from './series/OHLCSeries';

// interface DataPoint {
//   open: number;
//   high: number;
//   low: number;
//   close: number;
//   quantity: number;
//   time: number;
// }
const MINIMUM_PRICE: number = 1;

interface Props {
  apiUrl?: string; // URL to fetch chart data from
}

const ReactChart: React.FC<Props> = ({ apiUrl = '/api/db/combined?n=5000' }) => {
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // const [chartData, setChartData] = useState({});
  // const [loading, setLoading] = useState(true);
  // const apiUrl = '/api/db?n=200';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json() as DataPoint[];
        setChartData(data.sort((a, b) => (a.time - b.time)));
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    // fetchData();
    // Set up the interval
    const interval = setInterval(() => {
      fetchData();
    }, 1000);
    // Clean up the interval
    return () => clearInterval(interval);
  }, [apiUrl]);


  const ScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
    (d) => new Date(d.time)
  );
  const { data, xScale, xAccessor, displayXAccessor } = ScaleProvider(
    chartData
  );
  // const data = chartData;
  // const xScale=scaleTime()
  // const xAccessor = (d: ChartData): number => {
  //   return d.time;
  // };


  const height = 700;
  const width = 900;
  const margin = { left: 0, right: 48, top: 0, bottom: 24 };

  const ema12 = ema()
    .id(1)
    .options({ windowSize: 12 })
    .merge((d: any, c: number) => {
      d.ema12 = c;
    })
    .accessor((d: any) => d.ema12);

  const ema26 = ema()
    .id(2)
    .options({ windowSize: 26 })
    .merge((d: any, c: number) => {
      d.ema26 = c;
    })
    .accessor((d: any) => d.ema26);

  const elder = elderRay();

  const calculatedData = elder(ema26(ema12(chartData)));

  const pricesDisplayFormat = format(".2f");
  const max = xAccessor(data[data.length - 1]);
  const min = xAccessor(data[Math.max(0, data.length - 100)]);
  const xExtents = [min, max + 5];

  const gridHeight = height - margin.top - margin.bottom;

  const elderRayHeight = 100;
  const elderRayOrigin = (_: any, h: number) => [0, h - elderRayHeight];
  const barChartHeight = gridHeight / 4;
  const barChartOrigin = (_: any, h: number) => [0, h - barChartHeight - elderRayHeight];
  const chartHeight = gridHeight - elderRayHeight;

  const dateTimeFormat = "%b%d %H:%M:%S";
  // const timeDisplayFormat = timeFormat(dateTimeFormat);
  /*create a customized timeformat to display millisecond */
  const timeFormatwithMilli = (date: Date): string => {
    const format = timeFormat("%b%d %H:%M:%S"); // Standard date-time format
    const milliseconds = date.getMilliseconds();
    return format(date) + "." + String(milliseconds).padStart(3, '0'); // Adding milliseconds
  };
  const barChartExtents = (data: DataPoint): number => {
    return data.ohlc?.quantity;
  };

  const assetExtents = (data: DataPoint): number => {
    return data.order.asset;
  }

  /*this is for price data range to be scaled properly*/ 
  const candleChartExtents = (data: DataPoint): [number, number] => {
    let prices =[data.ohlc?.high, data.ohlc?.low]
    if(data.order){
      prices = prices.concat(data.order.map(d=> d.price));
    }
    prices = prices.filter(d=>d!==undefined).filter(d=>d>MINIMUM_PRICE); //filter out undefined and small values
    return [Math.max(...prices), Math.min(...prices)];
  };

  const yEdgeIndicator = (data: DataPoint): number | undefined => {
    return data.ohlc ? data.ohlc.close : undefined;
  };
  const volumeColor = (data: DataPoint): string => {
    return data.ohlc.close > data.ohlc.open
      ? "rgba(38, 166, 154, 0.3)"
      : "rgba(239, 83, 80, 0.3)";
    // return "rgba(38, 166, 154, 0.3)";
  };

  // const orderExtents = (data: DataPoint): [number, number] | undefined => {
  //   if (data.order) {
  //     return undefined;
  //   } else {
  //     return [data.order?[0]?.price, data.order[0]?.price];
  //   }
  // };

  // const buysellShape = (data: DataPoint): string => {
  //   // if data.
  // }; 

  const volumeSeries = (data: DataPoint): number | undefined => {
    return data.ohlc ? data.ohlc.quantity : undefined;
  };

  const openCloseColor = (data: DataPoint): string => {
    return data.ohlc.close > data.ohlc.open ? "#26a69a" : "#ef5350";
    // return "#26a69a";
  };
  return (
    <ChartCanvas
      height={height}
      ratio={3}
      width={width}
      margin={margin}
      data={data}
      displayXAccessor={displayXAccessor}
      seriesName="Data"
      xScale={xScale}
      xAccessor={xAccessor}
      xExtents={xExtents}
      zoomAnchor={lastVisibleItemBasedZoomAnchor}
    >
      <Chart
        id={2}
        height={barChartHeight}
        origin={barChartOrigin}
        yExtents={barChartExtents}
      >
        <BarSeries fillStyle={volumeColor} yAccessor={volumeSeries} />
      </Chart>
      <Chart id={3} height={chartHeight} yExtents={candleChartExtents}>
        <XAxis showGridLines showTickLabel={false} />
        <YAxis showGridLines tickFormat={pricesDisplayFormat} />
        <OHLCSeries width={3} />

        <OrderSeries
          // yAccessor={(d) => d.order} 
          marker={Triangle}
          markerProps={{
            width: 8,
            direction: "top",
            stroke: "#2ca02c",
            fill: "#2ca02c"
          }}
        />
        {/* <OrderSeries yAccessor={(d) => d.order} /> */}
        <MouseCoordinateY
          rectWidth={margin.right}
          displayFormat={pricesDisplayFormat}
        />
        <EdgeIndicator
          itemType="last"
          rectWidth={margin.right}
          fill={openCloseColor}
          lineStroke={openCloseColor}
          displayFormat={pricesDisplayFormat}
          yAccessor={yEdgeIndicator}
        />
        <MovingAverageTooltip
          origin={[8, 24]}
          options={[
            {
              yAccessor: ema26.accessor(),
              type: "EMA",
              stroke: ema26.stroke(),
              windowSize: ema26.options().windowSize
            },
            {
              yAccessor: ema12.accessor(),
              type: "EMA",
              stroke: ema12.stroke(),
              windowSize: ema12.options().windowSize
            }
          ]}
        />

        <ZoomButtons />
        <OHLCTooltip origin={[8, 16]} accessor={(d) => { return d.ohlc }} />
      </Chart>
      <Chart
        id={4}
        height={elderRayHeight}
        yExtents={assetExtents}
        origin={elderRayOrigin}
        padding={{ top: 8, bottom: 8 }}
      >
        <XAxis showGridLines gridLinesStrokeStyle="#e0e3eb" />
        <YAxis ticks={4} tickFormat={pricesDisplayFormat} />

        <MouseCoordinateX displayFormat={timeFormatwithMilli} />
        <MouseCoordinateY
          rectWidth={margin.right}
          displayFormat={pricesDisplayFormat}
        />

        {/* <ElderRaySeries yAccessor={elder.accessor()} /> */}
        <LineSeries yAccessor={assetExtents} strokeStyle={'#2596be'} connectNulls={true}/>

        <SingleValueTooltip
          yAccessor={assetExtents}
          yLabel="Account"
          yDisplayFormat={(d: any) =>
            `${pricesDisplayFormat(d.bullPower)}, ${pricesDisplayFormat(
              d.bearPower
            )}`
          }
          origin={[8, 16]}
        />
      </Chart>
      <CrossHairCursor />
    </ChartCanvas>
  );
};

export default ReactChart; 