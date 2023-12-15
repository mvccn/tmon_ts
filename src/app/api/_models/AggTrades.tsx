import mongoose from 'mongoose';

const AggTradeSchema = new mongoose.Schema({
    time: Number,
    value: Number,
    price: Number,
    quantity: Number,
    is_maker: Boolean,
    // Add other fields as needed
});

export default mongoose.models.AggTrade || mongoose.model('AggTrade', AggTradeSchema); //mongoose convert this to plural and lowercase
