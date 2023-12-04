import mongoose from 'mongoose';

const OrdersSchema = new mongoose.Schema({
    time: Number,
    E: Number,
    order_id: String,
    price: Number,
    quntity: Number,
    side: String,
    profit: Number,
    // Add other fields as needed
});

export default mongoose.models.Orders || mongoose.model('Orders', OrdersSchema); //mongoose convert this to plural and lowercase
