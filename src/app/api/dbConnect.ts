import mongoose, { Mongoose, ConnectOptions } from 'mongoose';
// import {MongoosCache, global} from "./dbConnect.d.ts";
// Define the type for the cache object
// import dbcache from './dbConnect';

interface MongooseCache {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}
declare global {
    // namespace NodeJS {
    //     interface Global {
    //         dbcache: MongooseCache;
    //     }
    // }
    var dbcache: MongooseCache;
}

const MONGODB_URI: string | undefined = process.env.MONGODB_URI;

let mongodb_url: string; 
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
} else{
    mongodb_url = MONGODB_URI;
}

// Use the cache from the global scope
// let cached : MongooseCache= dbcache;

// if (!cached) {
//     cached = global.dbcache = { conn: null, promise: null };
// }
global.dbcache = { conn: null, promise: null };

async function dbConnect(): Promise<Mongoose> {
    if (global.dbcache.conn) {
        return global.dbcache.conn;
    }
    if (!global.dbcache.promise) {
        const opts: ConnectOptions = {
            // Uncomment and configure these options if needed
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // bufferCommands: false,
            // bufferMaxEntries: 0,
            // useFindAndModify: true,
            // useCreateIndex: true
        };

        global.dbcache.promise = mongoose.connect(mongodb_url, opts).then((mongoose) => {
            return mongoose;
        });
    }
    global.dbcache.conn = await global.dbcache.promise;
    return global.dbcache.conn;
}

export default dbConnect;
