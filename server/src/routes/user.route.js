import express from "express";
import {
  LoginUser,
  LogoutUser,
  Register,
  getUserData,
  refreshAccessToken,
  handleSocialLogin,
  getAllUserData,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { signUpSchemaValidation } from "../utils/schemaValidation.js";
import { authMiddleWare } from "../middlewares/auth.middleware.js";
import passport from "passport";
import "../passport/index.js";

const routes = express.Router();

routes.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  validate(signUpSchemaValidation),
  Register
);

routes.route("/login").post(LoginUser);

routes.route("/refresh-token").post(refreshAccessToken);

//Secure Routes to use Auth Middleware
routes.route("/logout").get(authMiddleWare, LogoutUser);

routes.route("/get-userdata").get(authMiddleWare, getUserData);
routes.route("/get-Alluserdata").get(getAllUserData);

// SSO routes
routes.route("/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
  (req, res) => {
    res.send("redirecting to google...");
  }
);

routes
  .route("/google/callback")
  .get(passport.authenticate("google"), handleSocialLogin);
export default routes;
