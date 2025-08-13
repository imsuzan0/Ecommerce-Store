import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken)
      return res.status(401).json({
        success: false,
        message:
          "User not logged in - 'Unauthorized (No access token provided) '",
      });

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

      if (!decoded)
        return res.status(401).json({
          success: false,
          message: "User not logged in - Unauthorized (Invalid access token)",
        });

      const user = await User.findById(decoded.userId).select("-password");
      if (!user)
        return res.status(401).json({
          success: false,
          message: "User not found",
        });

      req.user = user;

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError")
        return res.status(401).json({
          success: false,
          message: "User not logged in - Unauthorized (Access token expired)",
        });
      else {
        throw error;
      }
    }
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const adminRoute = async (req, res, next) => {
  try {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Access Denied - You are not authorized to access this route",
      });
    }
  } catch (error) {}
};
