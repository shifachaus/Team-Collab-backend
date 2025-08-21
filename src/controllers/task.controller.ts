import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";

export const createTaskController  = asyncHandler(async(req:Request, res:Response)=>{
    const userId = req.user?._id;
})