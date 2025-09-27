import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  createProjectSchema,
  projectIdSchema,
  updateProjectSchema,
} from "../validation/project.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/role-guard";
import { Permissions } from "../enums/role.enum";
import { HTTPSTATUS } from "../config/http.config";
import {
  createProjectService,
  deltedProjectService,
  getProjectAnalyticsService,
  getProjectByIdAndWorkspaceIdservice,
  getProjectsInWorkspaceService,
  updateProjectService,
} from "../services/project.service";
import { createAuditLogServices } from "../services/auditlog.service";
import { AuditActionEnum, AuditEntityEnum } from "../enums/auditlog.enum";
import { getMetadata } from "../utils/auditlog.helper";
import { NotFoundException } from "../utils/app-error";
import ProjectModel from "../models/project.model";

export const createProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createProjectSchema.parse(req.body);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_PROJECT]);

    const { project } = await createProjectService(userId, workspaceId, body);

    await createAuditLogServices({
      workspaceId: workspaceId,
      projectId: (project._id as string).toString(),
      action: AuditActionEnum.CREATE,
      entityType: AuditEntityEnum.PROJECT,
      createdBy: userId.toString(),
      metadata: getMetadata(
        AuditEntityEnum.PROJECT,
        {
          name: project.name,
          createdBy: {
            _id: userId,
            name: req.user?.name,
            email: req.user?.email,
          },
          comment: "",
        },
        AuditActionEnum.CREATE
      ),
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Project created successfully",
      project,
    });
  }
);

export const getAllProjectInWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const pageNumber = parseInt(req.query.pageNumber as string) || 1;
    const { projects, totalCount, totalPage, skip } =
      await getProjectsInWorkspaceService(workspaceId, pageSize, pageNumber);

    return res.status(HTTPSTATUS.OK).json({
      message: "Project fetched successfully",
      projects,
      pagination: {
        totalCount,
        totalPage,
        skip,
        pageNumber,
        limit: pageSize,
      },
    });
  }
);

export const getProjectByIdAndWorkspaceIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { project } = await getProjectByIdAndWorkspaceIdservice(
      workspaceId,
      projectId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Project fetched successfully",
      project,
    });
  }
);

export const getProjectAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { analytics } = await getProjectAnalyticsService(
      workspaceId,
      projectId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Project analytics retrieved successfully",
      analytics,
    });
  }
);

export const updateProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = updateProjectSchema.parse(req.body);

    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.id);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_PROJECT]);

    // Fetch old workspace
    const oldProject = await ProjectModel.findById(projectId);
    if (!oldProject) throw new NotFoundException("Project not found");

    const { project } = await updateProjectService(
      workspaceId,
      projectId,
      body
    );

    await createAuditLogServices({
      workspaceId: workspaceId,
      projectId: projectId,
      action: AuditActionEnum.UPDATE,
      entityType: AuditEntityEnum.PROJECT,
      createdBy: userId.toString(),
      metadata: getMetadata(
        AuditEntityEnum.PROJECT,
        {
          oldValue: {
            name: oldProject.name,
            description: oldProject.description,
          },
          newValue: {
            name: project.name,
            description: project.description,
          },
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
      message: "Project updated successfully",
      project,
    });
  }
);

export const deleteProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.id);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_PROJECT]);

    // Fetch workspace before deletion for metadata
    const project = await ProjectModel.findById(projectId);

    if (!project) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        message: "Task not found",
        errorCode: "RESOURCE_NOT_FOUND",
      });
    }

    await createAuditLogServices({
      workspaceId: workspaceId,
      projectId: projectId,
      action: AuditActionEnum.DELETE,
      entityType: AuditEntityEnum.PROJECT,
      createdBy: userId.toString(),
      metadata: getMetadata(
        AuditEntityEnum.PROJECT,
        {
          name: project.name,
          deletedBy: {
            _id: userId,
            name: req.user?.name,
            email: req.user?.email,
          },
          deletedAt: new Date(),
          comment: "",
        },
        AuditActionEnum.DELETE
      ),
    });

    await deltedProjectService(workspaceId, projectId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Project deleted successfully",
    });
  }
);
