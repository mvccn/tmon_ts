import dbConnect from '../../dbConnect';
import Orders from "../../_models/Orders";

export async function GET(request: Request): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const nString = searchParams.get('n');
    const n = nString ? parseInt(nString) : 100; //default 100

    await dbConnect();

    // Assuming that AggTrades.find() returns a Promise
    const coll = Orders; 

    const data = await coll.find({})
        .sort({ time: -1 })
        .limit(n); // Assuming n is a number or undefined

    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
    });
}
