interface PriceTimePoint {
  time: number; // timestamp in ms
  price: string;
  quantity: string;
}

interface DataPoint {
  ohlc: OHLC;
  order?: Order[];
  time: number;
}

interface OHLC{
  open: number;
  high: number;
  low: number;
  close: number;
  quantity: number;
}


interface Order {
    time: number,
    order_id: string,
    price: number,
    quantity: number,
    side: string,
    profit: number,
    asset?: number, 
    balance?: number, 
}
