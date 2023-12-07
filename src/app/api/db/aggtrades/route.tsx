import dbConnect from '../../dbConnect';
import AggTrades from '../../_models/AggTrades'; // Assuming AggTrades is correctly typed in its own file

export async function GET(request: Request): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const nString = searchParams.get('n');
    const n = nString ? parseInt(nString) : 100; //default 100

    await dbConnect();

    // Assuming that AggTrades.find() returns a Promise
    const coll = AggTrades; 

    const data = await coll.find({})
        .sort({ time: -1 })
        .limit(n); // Assuming n is a number or undefined

    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
    });
}
