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
    time: Number,
    order_id: String,
    price: Number,
    quantity: Number,
    side: String,
    profit: Number,
}
