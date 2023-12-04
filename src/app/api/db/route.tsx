import dbConnect from '../dbConnect';
import AggTrades from '../_models/AggTrades'; // Assuming AggTrades is correctly typed in its own file
import Orders from "../_models/Orders";

export async function GET(request: Request): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const nString = searchParams.get('n');
    const collection = searchParams.get('collection');
    const n = nString ? parseInt(nString) : 100; //default 100

    await dbConnect();

    // Assuming that AggTrades.find() returns a Promise
    let coll = AggTrades
    if (collection =='Orders') {
        const coll = Orders 
    }

    const data = await coll.find({})
        .sort({ time: -1 })
        .limit(n); // Assuming n is a number or undefined

    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
    });
}
