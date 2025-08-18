import { Router } from "express";
import passport from "passport";
import { config } from "../config/app.config";
import { googleLoginCallback, registerUserController } from "../controllers/auth.controller";

const authRoutes = Router();

const failedURL = `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`;

authRoutes.post("/register",registerUserController);
// authRoutes.post("/login");
// authRoutes.post("/logout");

authRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: failedURL,
    session: false,
  }),
  googleLoginCallback
);

export default authRoutes;
