import AuditLogModel from "../models/auditlog.model";
import { NotFoundException } from "../utils/app-error";

export const getAuditLogByWorkspaceIdService = async (workspaceId: string) => {
    
  const logs = await AuditLogModel.find({ workspaceId })
    .populate("createdBy", "name email profilePicture")
    .sort({ createdAt: -1 });
    

  if (!logs || logs.length === 0) {
    throw new NotFoundException("No audit logs found for this workspace");
  }

  return { auditlog: logs };
};
