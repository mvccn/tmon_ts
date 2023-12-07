import dbConnect from '../../dbConnect';
import AggTrades from '../../_models/AggTrades'; // Assuming AggTrades is correctly typed in its own file
import Orders from "../../_models/Orders";
import {resampleToOHLC} from "../ohlc"

export async function GET(request: Request): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const nString = searchParams.get('n');
    const n = nString ? parseInt(nString) : 100; //default 100

    await dbConnect();

    // Assuming that AggTrades.find() returns a Promise
    const index_model = AggTrades; 
    const data1_model = Orders;

    const index = await index_model.find({})
        .sort({ time: -1 })
        .limit(n); // Assuming n is a number or undefined
    

    // const agg = resampleToOHLC(index, 100)
    // console.log(new Date(index[0]['time']), new Date(index[index.length-1]['time']));
    // console.log(index[0]['time'], index[index.length-1]['time']);

    let data1 = await data1_model.find({
        "time": {
            $gte: index[index.length-1]['time'], //new Date("2023-01-31T23:59:59Z")  // End date of the range
            $lte: index[0]['time'], //new Date("2023-01-01T00:00:00Z"), // Start date of the range
          }
        })
        

    const data = index.concat(data1).sort((a,b)=>(a.time-b.time));
    
    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
    });
}
