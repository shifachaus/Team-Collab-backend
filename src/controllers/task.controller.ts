import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { createTaskSchema } from "../validation/task.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { projectIdSchema } from "../validation/project.validation";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/role-guard";
import { Permissions } from "../enums/role.enum";
import { HTTPSTATUS } from "../config/http.config";
import { createTaskService } from "../services/task.service";

export const createTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = createTaskSchema.parse(req.body);

    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);


    console.log("userId:", userId, "workspaceId:", workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_TASK]);

    const { task } = await createTaskService(
      workspaceId,
      projectId,
      userId,
      body
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Task created successfully",
      task,
    });
  }
);
