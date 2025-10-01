import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { createTaskSchema, taskIdSchema } from "../validation/task.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { projectIdSchema } from "../validation/project.validation";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/role-guard";
import { Permissions } from "../enums/role.enum";
import { HTTPSTATUS } from "../config/http.config";
import {
  createTaskService,
  deleteTaskService,
  getAllTaskService,
  getTaskByIdSevice,
  updateTaskService,
} from "../services/task.service";
import { createAuditLogServices } from "../services/auditlog.service";
import { AuditActionEnum, AuditEntityEnum } from "../enums/auditlog.enum";
import { getMetadata } from "../utils/auditlog.helper";
import TaskModel from "../models/task.model";
import { NotFoundException } from "../utils/app-error";

export const createTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = createTaskSchema.parse(req.body);

    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_TASK]);

    const { task } = await createTaskService(
      workspaceId,
      projectId,
      userId,
      body
    );

    await createAuditLogServices({
      workspaceId: workspaceId,
      projectId: projectId,
      taskId: (task._id as string).toString(),
      action: AuditActionEnum.CREATE,
      entityType: AuditEntityEnum.TASK,
      createdBy: userId.toString(),
      metadata: getMetadata(
        AuditEntityEnum.TASK,
        {
          name: task.title,
          taskCodeId: task.taskCode,
          createdBy: {
            _id: userId,
            name: req.user?.name,
            email: req.user?.email,
          },
          assignedTo: task.assignedTo,
          comment: "",
        },
        AuditActionEnum.CREATE
      ),
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Task created successfully",
      task,
    });
  }
);

export const updateTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = createTaskSchema.parse(req.body);

    const taskId = taskIdSchema.parse(req.params.id);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    // Fetch old workspace
    const oldTask = await TaskModel.findById(taskId);
    if (!oldTask) throw new NotFoundException("task not found");

    const { updatedTask } = await updateTaskService(
      workspaceId,
      projectId,
      taskId,
      body
    );

    await createAuditLogServices({
      workspaceId: workspaceId,
      projectId: projectId,
      taskId: taskId,
      action: AuditActionEnum.UPDATE,
      entityType: AuditEntityEnum.TASK,
      createdBy: userId.toString(),
      metadata: getMetadata(
        AuditEntityEnum.TASK,
        {
          oldValue: {
            name: oldTask.title,
            priority: oldTask.priority,
            status: oldTask.status,
          },
          newValue: {
            name: updatedTask.title,
            priority: updatedTask.priority,
            status: updatedTask.status,
          },

          taskCodeId: updatedTask.taskCode,
          updatedBy: {
            _id: userId,
            name: req.user?.name,
            email: req.user?.email,
          },
        },
        AuditActionEnum.UPDATE
      ),
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  }
);

export const getAllTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const filters = {
      projectId: req.query.projectId as string | undefined,
      status: req.query.status
        ? (req.query.status as string)?.split(",")
        : undefined,
      priority: req.query.priority
        ? (req.query.priority as string)?.split(",")
        : undefined,
      assignedTo: req.query.assignedTo
        ? (req.query.assignedTo as string)?.split(",")
        : undefined,
      keyword: req.query.keyword as string | undefined,
      dueDate: req.query.dueDate as string | undefined,
    };

    const pagination = {
      pageSize: parseInt(req.params.pageSize as string) || 10,
      pageNumber: parseInt(req.params.pageNumber as string) || 1,
    };

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const result = await getAllTaskService(workspaceId, filters, pagination);

    return res.status(HTTPSTATUS.OK).json({
      message: "All tasks fetched successfully",
      ...result,
    });
  }
);

export const getTaskByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.id);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const task = await getTaskByIdSevice(workspaceId, projectId, taskId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Task fetched successfully",
      task,
    });
  }
);

export const deleteTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_TASK]);

    // Fetch workspace before deletion for metadata
    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        message: "Task not found",
        errorCode: "RESOURCE_NOT_FOUND",
      });
    }

    const projectId = task.project?.toString() || null;

    const taskMetadata = {
      name: task.title,
      taskCodeId: task.taskCode,
      deletedBy: {
        _id: userId,
        name: req.user?.name,
        email: req.user?.email,
      },
      deletedAt: new Date(),
      comment: "",
    };

    await createAuditLogServices({
      workspaceId: workspaceId,
      taskId: taskId,
      projectId: projectId,
      action: AuditActionEnum.DELETE,
      entityType: AuditEntityEnum.TASK,
      createdBy: userId.toString(),
      metadata: getMetadata(
        AuditEntityEnum.TASK,
        taskMetadata,
        AuditActionEnum.DELETE
      ),
    });

    await deleteTaskService(workspaceId, taskId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Task deleted successfully",
    });
  }
);
