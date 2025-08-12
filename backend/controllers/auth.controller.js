import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import { generateTokens } from "../utils/generateTokens.js";
import { setCookies } from "../utils/setCookies.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if (!emailRegex.test(email))
      return res.status(400).json({ success: false, message: "Invalid email" });

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return res
        .status(400)
        .json({ success: false, message: "User already exist" });
    }

    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken } = generateTokens(user._id);

    const storeRefreshToken = async (userId, refreshToken) => {
      await redis.set(
        `refresh_token:${userId}`,
        refreshToken,
        "EX",
        7 * 24 * 60 * 60
      );
    };
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Error in signup controller: ", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if (!emailRegex.test(email))
      return res.status(400).json({ success: false, message: "Invalid email" });

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);
      res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (error) {
    console.log("Error in login controller: ", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token:${decoded.userId}`);
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res
      .status(200)
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller: ", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
