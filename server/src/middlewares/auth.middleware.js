import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";

export const authMiddleWare = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "") ||
      "xyz";

    if (!token) {
      throw new ApiError(400, "Unauthorized user");
    }

    const isTokenDecode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!isTokenDecode) {
      throw new ApiError(400, "Invalid access token");
    }

    const user = await User.findById(isTokenDecode?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(400, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid access token");
  }
});
