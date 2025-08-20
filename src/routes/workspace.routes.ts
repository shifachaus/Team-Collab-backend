import { Router } from "express";
import {
  changeWorkspaceMemberRoleController,
  createWorkspaceController,
  getAllWorkspacesUserIsMemberController,
  getWorkspaceAnalyticsController,
  getWorkspaceByIdController,
  getWorkspaceMembersController,
  updateWorkspaceByIdController
} from "../controllers/workspace.controller";

const workspaceRoutes = Router();

workspaceRoutes.get("/all", getAllWorkspacesUserIsMemberController);
workspaceRoutes.get("/:id", getWorkspaceByIdController);
workspaceRoutes.get("/members/:id", getWorkspaceMembersController);
workspaceRoutes.get("/analytics/:id", getWorkspaceAnalyticsController);

workspaceRoutes.post("/create/new", createWorkspaceController);

workspaceRoutes.put(
  "/change/member/role/:id",
  changeWorkspaceMemberRoleController
);
workspaceRoutes.put("/update/:id", updateWorkspaceByIdController);

//  workspaceRoutes.delete("/delete/:id");

export default workspaceRoutes;
