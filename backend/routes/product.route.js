import express from "express";
import {
  getAllProducts,
  getFeaturedProducts,
  createProduct,
  deleteProduct,
  getRecommendedProducts,
  getProductsByCategory,
  toggleFeaturedProduct,
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";

const productRouter = express.Router();

productRouter.get("/", protectRoute, adminRoute, getAllProducts);
productRouter.get("/category/:category", getProductsByCategory);
productRouter.get("/featured", getFeaturedProducts);
productRouter.get("/recommendations", getRecommendedProducts);
productRouter.post("/", protectRoute, adminRoute, createProduct);
productRouter.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
productRouter.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default productRouter;
