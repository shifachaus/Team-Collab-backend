import { NextFunction, Request, Response } from "express";

type AyncControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

//  handle async route errors
export const asyncHandler = (
  controller: AyncControllerType
): AyncControllerType => {
  return async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
