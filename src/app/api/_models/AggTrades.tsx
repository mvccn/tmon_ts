import mongoose from 'mongoose';

const AggTradesSchema = new mongoose.Schema({
    time: Number,
    value: Number,
    price: Number,
    quntity: Number,
    is_maker: Boolean,
    // Add other fields as needed
});

export default mongoose.models.AggTrades || mongoose.model('AggTrades', AggTradesSchema); //mongoose convert this to plural and lowercase
