import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
// import session from "express-session";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware.ts";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
// import { BadRequestException } from "./utils/app-error";
// import { ErrorCodeEnum } from "./enums/error-code.enum";

import "./utils/jwt";

import "./config/passport.config";
import passport from "passport";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
// import isAuthenticated from "./middlewares/isAuthenticated.middleware";
import workspaceRoutes from "./routes/workspace.routes";
import memberRoutes from "./routes/member.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import { passportAuthenticateJwt } from "./config/passport.config";
import auditlogRoutes from "./routes/auditlog.routes";

//App Initialization
const app = express();

const BASE_PATH = config.BASE_PATH;

//Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Session Configuration
// app.use(
//   session({
//     secret: config.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       maxAge: 24 * 60 * 60 * 1000,
//       httpOnly: true,
//       secure: config.NODE_ENV === "production",
//     },
//   })
// );

app.use(passport.initialize());
// app.use(passport.session());

const allowedOrigins = config.FRONTEND_ORIGIN.split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // throw new BadRequestException(
    //   "This is a bad request",
    //   ErrorCodeEnum.AUTH_INVALID_TOKEN
    // );
    return res.status(HTTPSTATUS.OK).json({
      message: "Hello World!!!",
    });
  })
);

// mount
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes);
app.use(`${BASE_PATH}/workspace`, passportAuthenticateJwt, workspaceRoutes);
app.use(`${BASE_PATH}/member`, passportAuthenticateJwt, memberRoutes);
app.use(`${BASE_PATH}/project`, passportAuthenticateJwt, projectRoutes);
app.use(`${BASE_PATH}/task`, passportAuthenticateJwt, taskRoutes);
app.use(`${BASE_PATH}/auditlog`, passportAuthenticateJwt, auditlogRoutes);

// error handler
app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
