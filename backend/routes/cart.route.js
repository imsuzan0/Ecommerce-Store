import express from "express";
import { addToCart, getCartProducts, removeFromCart, updateQuantity,removeAllFromCart } from "../controllers/cart.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const cartRouter = express.Router();

cartRouter.get("/", protectRoute, getCartProducts);
cartRouter.post("/", protectRoute, addToCart);
cartRouter.delete("/", protectRoute, removeFromCart);
cartRouter.put("/:id", protectRoute, updateQuantity);
cartRouter.delete("/remove-all", protectRoute, removeAllFromCart);

export default cartRouter;
