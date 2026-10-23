import { NextFunction, Request, Response } from "express";
import passport, { session } from "passport";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { config } from "../config/app.config";
import { registerSchema } from "../validation/auth.validation";
import { registerUserService } from "../services/auth.service";
import { signJwtToken } from "../utils/jwt";

export const googleLoginCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.jwt;

    if (!token) {
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
      );
    }

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.redirect(
      `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=success`
    );
  }
);

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse({ ...req.body });

    await registerUserService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User created successfully",
    });
  }
);

export const loginUserController = asyncHandler(
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // find the user and verify the password.
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined
      ) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(HTTPSTATUS.UNAUTHORIZED).json({
            message: info?.message || "Invalid email or password",
          });
        }
        const access_token = signJwtToken({ userId: user._id });
        return res.status(HTTPSTATUS.OK).json({
          message: "Logged in successfully",
          access_token,
          user,
        });
      }
    )(req, res, next);
  })
);

export const logoutUserController = asyncHandler(
  async (req: Request, res: Response) => {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res
      .status(HTTPSTATUS.OK)
      .json({ message: "Logged out successfully" });
  }
);
