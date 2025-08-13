//External Imports
import express from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";

//Internal Imports
import { connectDB } from "./db/db.js";
import authRouter from "./routes/auth.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";

configDotenv();
const app = express();

const PORT = process.env.PORT || 5000;

//Middlewares
app.use(express.json());
app.use(cookieParser());

//Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter)

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on  http://localhost:${PORT} `);
  });
});
