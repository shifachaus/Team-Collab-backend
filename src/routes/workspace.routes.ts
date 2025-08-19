import { Router } from "express";
import { createWorkspaceController,getAllWorkspacesUserIsMemberController,getWorkspaceByIdController } from "../controllers/workspace.controller";

const workspaceRoutes= Router();

workspaceRoutes.get("/all", getAllWorkspacesUserIsMemberController)
workspaceRoutes.get("/:id", getWorkspaceByIdController);

workspaceRoutes.post("/create/new", createWorkspaceController)


export default workspaceRoutes;