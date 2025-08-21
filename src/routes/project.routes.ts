import { Router } from "express";
import {
  createProjectController,
  getAllProjectInWorkspaceController,
  getProjectAnalyticsController,
  getProjectByIdAndWorkspaceIdController,
  updateProjectController,
} from "../controllers/project.controller";

const projectRoutes = Router();

projectRoutes.post("/workspace/:workspaceId/create", createProjectController);

projectRoutes.get(
  "/workspace/:workspaceId/all",
  getAllProjectInWorkspaceController
);
projectRoutes.get(
  "/:id/workspace/:workspaceId/",
  getProjectByIdAndWorkspaceIdController
);
projectRoutes.get(
  "/:id/workspace/:workspaceId/analytics",
  getProjectAnalyticsController
);

projectRoutes.put(
  "/:id/workspace/:workspaceId/update",
  updateProjectController
);

// projectRoutes.delete("/:id/workspace/:workspaceId/delete",);

export default projectRoutes;
