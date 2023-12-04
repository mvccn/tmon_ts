// pages/api/sse.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function GET(req: NextApiRequest,res: NextApiResponse ) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Ensures headers are sent immediately

  const sendEvent = () => {
    // Fetch the latest data or generate some data
    const data = { time: new Date().toISOString() }; // Example data
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const intervalId = setInterval(sendEvent, 1000); // Send an event every second

  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
}
