import { Router } from "express";
import { createProjectController } from "../controllers/project.controller";

const projectRoutes = Router();

projectRoutes.get("/create/:workspaceId", createProjectController);

export default projectRoutes