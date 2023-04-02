import mongoose from "mongoose";
import config from "../utils/config";

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export default async function connect() {
    if (cached.conn) return cached.conn;
    if (!cached.promise)
        cached.promise = await mongoose.connect(config.MONGODB_URI);
    cached.conn = await cached.promise;
    return cached.conn;
}
