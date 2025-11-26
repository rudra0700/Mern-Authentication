import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import { createClient } from "redis";
import cookieParser from "cookie-parser";
import cors from "cors";
import { router } from "./routes/index.js";

await connectDB();

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.log("redis url not found");
  process.exit(1);
}

export const redisClient = createClient({
  url: redisUrl,
});

redisClient
  .connect()
  .then(() => console.log("connected to redis"))
  .catch(console.error);

const PORT = process.env.PORT || 3000;
const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials:true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}))

app.use("/api/v1", router);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
