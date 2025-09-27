import {
  AuditActionEnumType,
  AuditEntityEnumType,
} from "../enums/auditlog.enum";
import AuditLogModel from "../models/auditlog.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import WorkspaceModel from "../models/workspace.model";
import { NotFoundException } from "../utils/app-error";

interface CreateAuditLogParams {
  workspaceId: string;
  projectId?: string | null;
  taskId?: string | null;
  action: AuditActionEnumType;
  entityType: AuditEntityEnumType;
  createdBy: string;
  metadata?: Record<string, any> | null;
}

export const createAuditLogServices = async ({
  workspaceId,
  projectId = null,
  taskId = null,
  action,
  entityType,
  createdBy,
  metadata = null,
}: CreateAuditLogParams) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) throw new NotFoundException("Workspace not found");

  let project = null;
  if (entityType === "PROJECT") {
    if (!projectId) throw new NotFoundException("ProjectId is required");

    project = await ProjectModel.findById(projectId);
    if (!project || project.workspace.toString() !== workspaceId) {
      throw new NotFoundException(
        "Project not found or does not belong to this workspace"
      );
    }
  }

  if (entityType === "TASK") {
    if (!taskId) throw new NotFoundException("TaskId is required");

    const task = await TaskModel.findById(taskId);
    if (!task || task.workspace.toString() !== workspaceId) {
      throw new NotFoundException(
        "Task not found or does not belong to this workspace"
      );
    }

    if (projectId && task.project.toString() !== projectId) {
      throw new NotFoundException("Task does not belong to this project");
    }
  }


  // 4️⃣ Create the audit log
  const auditLog = await AuditLogModel.create({
    workspaceId,
    projectId,
    taskId,
    action,
    entityType,
    createdBy,
    metadata,
  });

  return { auditLog };
};

export const getAuditLogByWorkspaceIdService = async (workspaceId: string) => {
  const logs = await AuditLogModel.find({ workspaceId })
    .populate("createdBy", "name email profilePicture -password")
    .sort({ createdAt: -1 });

  if (!logs || logs.length === 0) {
    throw new NotFoundException("No audit logs found for this workspace");
  }

  return { auditlog: logs };
};
