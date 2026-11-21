import { MongoClient } from "mongodb";

// Fallback only keeps `next build` from crashing when env vars are absent; a real URI is required at runtime.
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";

const globalForMongo = globalThis as unknown as { __salonbookMongoClient?: MongoClient };

export const mongoClient = globalForMongo.__salonbookMongoClient ?? new MongoClient(uri);
if (process.env.NODE_ENV !== "production") globalForMongo.__salonbookMongoClient = mongoClient;

export const db = mongoClient.db(process.env.DB_NAME || "salonbook");
