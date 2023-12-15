import dbConnect from '../../dbConnect';
import AggTrade from '../../_models/AggTrades'; // Assuming AggTrades is correctly typed in its own file
import Orders from "../../_models/Orders";


function resampleToOHLC(
    data: PriceTimePoint[],
    intervalMs: number //100 ->100ms
  ): Record<number, DataPoint> {
    // let result: OHLC[] = [];
    let result: Record<number, DataPoint> = {};
    let groupedData: Record<number, { price: number[]; quantity: number[] }> = {};
  
    // Step 1: Group data by 100ms intervals
    data.forEach((item) => {
      // const date = new Date(item.time);
      // item = item.toJSON();
      const periodKey = Math.floor(item.time / intervalMs);
      // const periodKeyString = periodKey.toString();
      if (!groupedData[periodKey]) {
        groupedData[periodKey] = { price: [], quantity: [] };
      }
      groupedData[periodKey].price.push(parseFloat(item.price));
      groupedData[periodKey].quantity.push(parseFloat(item.quantity));
    });
  
    // Step 2: Calculate OHLC for each period
    const keys = Object.keys(groupedData).map((k) => Number(k));
    const min = Math.min(...keys);
    const max = Math.max(...keys);
    for (let i = min; i <= max; i++) {
      let datapoint: DataPoint = {
        time: i * intervalMs,
        ohlc: {
          open: NaN,
          high: NaN,
          low: NaN,
          close: NaN,
          quantity: NaN,
        },
      };
      let values = groupedData[i];
      if (values) {
        let ohlc: OHLC = {
          open: values.price[0],
          high: Math.max(...values.price),
          low: Math.min(...values.price),
          close: values.price[values.price.length - 1],
          quantity: values.quantity.reduce((a, b) => a + b, 0),
        };
        datapoint.ohlc = ohlc;
        result[i] = datapoint;
      }
    }
    return result;
  }


export async function GET(request: Request): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const nString = searchParams.get('n');
    const n = nString ? parseInt(nString) : 100; //default 100
    const interval_String = searchParams?.get('interval')
    const interval = interval_String ? parseInt(interval_String) : 100; //default 1 hour
    console.log("n: ", n, "interval: ", interval)
    await dbConnect();

    // Assuming that AggTrades.find() returns a Promise
    const index_model = AggTrade;
    const data1_model = Orders;

    const index = await index_model.find({})
        .sort({ time: -1 })
        .limit(n); // Assuming n is a number or undefined


    const agg = resampleToOHLC(index.map((i) => i.toJSON()), interval)

    let data1 = await data1_model.find({
        "time": {
            $gte: index[index.length - 1]['time'], //new Date("2023-01-31T23:59:59Z")  // End date of the range
            $lte: index[0]['time'], //new Date("2023-01-01T00:00:00Z"), // Start date of the range
        }
    })

    // let orders: DataPoint[] = []
    for(let d of data1){
        d = d.toJSON()
        let i = Math.floor(d['time']/interval)
        if(agg[i]){
            if (agg[i].order){
                agg[i].order?.push(d)
            }else{
                agg[i].order = [d]
            }
        }else{
            agg[i] = {
                time: i,

                order: [d]
            }
        }
    }

    return new Response(JSON.stringify(Object.values(agg)), {
        headers: { 'Content-Type': 'application/json' }
    });
}
