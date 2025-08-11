import express from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";
const authRouter = express.Router();

authRouter.get("/signup", signup);
authRouter.get("/login", login);
authRouter.get("/logout", logout);

export default authRouter;
