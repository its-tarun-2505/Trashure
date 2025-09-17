import mongoose from 'mongoose'

const MONGODB_URL = process.env.MONGODB_URL
if (!MONGODB_URL) {
  throw new Error('Please define the MONGODB_URL environment variable in .env')
}

let cached = global._mongoose

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null }
}

export async function dbConnect() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }
    cached.promise = mongoose.connect(MONGODB_URL, opts).then(m => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}