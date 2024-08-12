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
import { rateLimit } from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  limit: 2, // Limit each IP to 5 login requests per windowMs
  message: new ApiError(
    400,
    "Too many requests for Login from this Website, please try again later."
  ),
  statusCode: "500",
});

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

routes.route("/login").post(loginLimiter, LoginUser);

routes.route("/refresh-token").post(refreshAccessToken);

//Secure Routes to use Auth Middleware
routes.route("/logout").get(authMiddleWare, LogoutUser);

routes.route("/get-userdata").get(authMiddleWare, getUserData);
routes.route("/get-Alluserdata").get(authMiddleWare, getAllUserData);

routes
  .route("/github/callback")
  .get(
    passport.authenticate("github", { failureRedirect: "/" }),
    (req, res) => {
      console.log("GitHub callback received");
      handleSocialLogin(req, res);
    }
  );
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

routes
  .route("/github")
  .get(
    passport.authenticate("github", { scope: ["profile", "email"] }),
    (req, res) => {
      res.send("redirecting to github...");
    }
  );

export default routes;
