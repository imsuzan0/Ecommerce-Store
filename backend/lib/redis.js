import Redis from "ioredis"
import { configDotenv } from "dotenv";

configDotenv();

export const redis = new Redis(process.env.UPSTASH_REDIS_URL,{
    tls:{}
});
// console.log("Redis URL:", process.env.UPSTASH_REDIS_URL);