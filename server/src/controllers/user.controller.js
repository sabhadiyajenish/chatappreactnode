import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fileUploadCloud } from "../utils/cloudinary.js";
import { UserLoginType, cookieOptions } from "../utils/constant.js";
import jwt from "jsonwebtoken";
import { nodeCache } from "../app.js";
import { encrypt } from "../utils/EncryptDecrypt/encryptDescrypt.js";
import axios from "axios";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(
        400,
        "something is wrong while getting user in generate and access tokens"
      );
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      400,
      "something is wrong while generationg access and refresh tokens"
    );
  }
};

const Register = asyncHandler(async (req, res) => {
  const { userName = "", email = "", fullName = "", password = "" } = req.body;

  if (
    [userName, email, password, fullName].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(409, "Please Provide all Fields..");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existedUser) {
    throw new ApiError(400, "User already exists with email or userName");
  }

  const avatarLocalFile = req.files?.avatar[0]?.path;
  //    const coverImageLocalFile = req.files?.coverImage[0]?.path;
  let coverImageLocalFile;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalFile = req.files.coverImage[0].path;
  }

  if (!avatarLocalFile) {
    throw new ApiError(309, "avatar image is required..");
  }
  const avatarSerPath = await fileUploadCloud(avatarLocalFile);
  const coverImageSerPath = await fileUploadCloud(coverImageLocalFile);

  if (!avatarSerPath) {
    throw new ApiError(400, "avatar image is required...");
  }
  nodeCache.del("allUserList");
  const user = await User.create({
    userName: userName.toLowerCase(),
    email,
    password,
    fullName,
    avatar: avatarSerPath.url,
    coverImage: coverImageSerPath?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(400, "something wrong while registering the user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "Register Successfully.."));
});

const LoginUser = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;
  if (!email && !userName) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "email or userName is Required."));
  }

  const userCheck = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!userCheck) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Please enter Valid userName or Email"));
  }

  if (userCheck.loginType !== UserLoginType.EMAIL_PASSWORD) {
    // If user is registered with some other method, we will ask him/her to use the same method as registered.
    // This shows that if user is registered with methods other than email password, he/she will not be able to login with password. Which makes password field redundant for the SSO
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          {},
          "You have previously registered using " +
            userCheck.loginType?.toLowerCase() +
            ". Please use the " +
            userCheck.loginType?.toLowerCase() +
            " login option to access your account."
        )
      );
  }

  const passwordVerify = await userCheck.isPasswordCompare(password);

  if (!passwordVerify) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Please Enter Valid Credential."));
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
    userCheck?._id
  );

  const loggedInUser = await User.findById(userCheck?._id).select(
    "-password -refreshToken"
  );
  nodeCache.del("allUserList");

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Login Successfully"
      )
    );
});

const LogoutUser = asyncHandler(async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .clearCookie("clone_app", cookieOptions)
      .clearCookie("connect.sid", cookieOptions)
      .json(new ApiResponse(200, {}, "User logged Out"));
  } catch (error) {
    throw new ApiError(400, "something wrong while logouting User");
  }
});
const UserGetWebapp = asyncHandler(async (req, res) => {
  try {
    try {
      const response = await axios.get("https://www.wikipedia.org");
      return res
        .status(200)
        .json(new ApiResponse(200, response.data, "Register Successfully.."));
    } catch (error) {
      return res
        .status(200)
        .json(new ApiResponse(200, error, "failed Successfully.."));
    }
  } catch (error) {
    throw new ApiError(400, "something wrong while logouting User", error);
  }
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookie?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unAuthorizied request");
  }

  try {
    const decodeRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodeRefreshToken?._id);

    if (!user) {
      throw new ApiError(401, "inValid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token Expired");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user?._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid Refresh Token");
  }
});

const getUserData = asyncHandler(async (req, res) => {
  const data = JSON.stringify(req?.user);
  const encryptedData = encrypt(data);
  return res
    .status(200)
    .json(new ApiResponse(200, encryptedData, "UserData Fetched successFully"));
});

const getAllUserData = asyncHandler(async (req, res) => {
  let userIs;
  if (nodeCache.has("allUserList")) {
    userIs = JSON.parse(nodeCache.get("allUserList"));
  } else {
    userIs = await User.find({})
      .select(
        "-password -refreshToken -loginType -userLastMessages -watchHistory -updatedAt -isEmailVerified"
      )
      .exec();
    nodeCache.set(`allUserList`, JSON.stringify(userIs), 120);
  }
  const data = JSON.stringify(userIs);
  const encryptedData = encrypt(data);
  return res
    .status(200)
    .json(new ApiResponse(200, encryptedData, "UserData Fetched successFully"));
});

const handleSocialLogin = asyncHandler(async (req, res) => {
  console.log("come in >>>>>>>>>>>>>>>>>>>>>>>");
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
    user?._id
  );
  console.log(
    "<<<<<<<<<<<",
    `${process.env.CLIENT_SSO_REDIRECT_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}`
  );

  return res
    .status(301)
    .cookie("accessToken", accessToken, cookieOptions) // set the access token in the cookie
    .cookie("refreshToken", refreshToken, cookieOptions) // set the refresh token in the cookie
    .redirect(
      // redirect user to the frontend with access and refresh token in case user is not using cookies
      `${process.env.CLIENT_SSO_REDIRECT_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
});

export {
  Register,
  LoginUser,
  LogoutUser,
  refreshAccessToken,
  getUserData,
  handleSocialLogin,
  getAllUserData,
  UserGetWebapp,
};
