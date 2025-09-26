import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { getAuditLogByWorkspaceIdService } from "../services/auditlog.service";

export const getWorkspaceAuditLogs = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;
    
    await getMemberRoleInWorkspace(userId, workspaceId);

    const { auditlog } = await getAuditLogByWorkspaceIdService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Audit log fetched successfully",
      auditlog,
    });
  }
);

