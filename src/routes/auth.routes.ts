import { Router } from "express";
import passport from "passport";
import { config } from "../config/app.config";
import { googleLoginCallback } from "../controllers/auth.controller";

const authRoutes = Router();

const failedURL = `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`;

// authRoutes.post("/registre");
// authRoutes.post("/login");
// authRoutes.post("/logout");

authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: failedURL }),
  googleLoginCallback
);

export default authRoutes;
