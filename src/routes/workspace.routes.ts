import { Router } from "express";
import { createWorkspaceController,getAllWorkspacesUserIsMemberController } from "../controllers/workspace.controller";

const workspaceRoutes= Router();

workspaceRoutes.get("/all", getAllWorkspacesUserIsMemberController)
// workspaceRoutes.get("/:id");

workspaceRoutes.post("/create/new", createWorkspaceController)


export default workspaceRoutes;