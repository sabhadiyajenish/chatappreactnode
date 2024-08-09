import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2"; // Import GitHub Strategy
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { UserLoginType } from "../utils/constant.js";

// Serialize and deserialize user
try {
  passport.serializeUser((user, next) => {
    next(null, user._id);
  });

  passport.deserializeUser(async (id, next) => {
    try {
      const user = await User.findById(id);
      if (user) next(null, user);
      else next(new ApiError(404, "User does not exist"), null);
    } catch (error) {
      next(
        new ApiError(
          500,
          "Something went wrong while deserializing User",
          error
        ),
        null
      );
    }
  });

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (_, __, profile, next) => {
        const user = await User.findOne({ email: profile._json.email });
        if (user) {
          if (user.loginType !== UserLoginType.GOOGLE) {
            next(
              new ApiError(
                400,
                "You have previously registered using " +
                  user.loginType?.toLowerCase()?.split("_").join(" ") +
                  ". Please use the " +
                  user.loginType?.toLowerCase()?.split("_").join(" ") +
                  " login option to access your account."
              ),
              null
            );
          } else {
            next(null, user);
          }
        } else {
          const createdUser = await User.create({
            email: profile._json.email,
            password: profile._json.sub, // For Google, sub is used as a password placeholder
            userName: profile._json.email?.split("@")[0],
            fullName: profile._json.email?.split("@")[0],
            isEmailVerified: true,
            avatar: profile._json.picture,
            loginType: UserLoginType.GOOGLE,
          });
          if (createdUser) {
            next(null, createdUser);
          } else {
            next(new ApiError(500, "Error while registering the user"), null);
          }
        }
      }
    )
  );

  // GitHub Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, next) => {
        console.log("enter nin git hub pages<<<<<<<<<<<", profile);

        const user = await User.findOne({
          email: profile._json.email || `${profile.username}@github.com`,
        });
        if (user) {
          if (user.loginType !== UserLoginType.GITHUB) {
            next(
              new ApiError(
                400,
                "You have previously registered using " +
                  user.loginType?.toLowerCase()?.split("_").join(" ") +
                  ". Please use the " +
                  user.loginType?.toLowerCase()?.split("_").join(" ") +
                  " login option to access your account."
              ),
              null
            );
          } else {
            next(null, user);
          }
        } else {
          const createdUser = await User.create({
            email: profile._json.email || `${profile.username}@github.com`, // GitHub users may not always have an email
            password: profile.id, // For GitHub, use profile.id as a password placeholder
            userName: profile.username,
            fullName: profile.displayName || profile.username,
            isEmailVerified: true, // Email is not always verified for GitHub users
            avatar: profile._json.avatar_url,

            loginType: UserLoginType.GITHUB,
          });
          if (createdUser) {
            next(null, createdUser);
          } else {
            next(new ApiError(500, "Error while registering the user"), null);
          }
        }
      }
    )
  );
} catch (error) {
  console.error("PASSPORT ERROR: ", error);
}
