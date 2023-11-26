// export default function GET(req) {
//     // Your logic to fetch time series data
//     res.status(200).json({ data: "Time Series Data" });
// }
export async function GET(request: Request) {
    // const res = await fetch('https://data.mongodb-api.com/...', {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'API-Key': process.env.DATA_API_KEY,
    //   },
    // })
    // const data = await res.json()
   
    return Response.json({ 'data': "test" })
  }