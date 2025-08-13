//External Imports
import express from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";

//Internal Imports
import authRouter from "./routes/auth.route.js";
import { connectDB } from "./db/db.js";
import productRouter from "./routes/product.route.js";

configDotenv();
const app = express();

const PORT = process.env.PORT || 5000;

//Middlewares
app.use(express.json());
app.use(cookieParser());

//Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on  http://localhost:${PORT} `);
  });
});
