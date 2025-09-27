import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  changeRoleSchema,
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdSchema,
} from "../validation/workspace.validation";
import { HTTPSTATUS } from "../config/http.config";
import {
  changeMemberRoleService,
  createWorkspaceService,
  deleteWorkspaceByIdService,
  getAllWorkspacesUserIsMemberService,
  getWorkspaceAnalyticsService,
  getWorkspaceByIdService,
  getWorkspaceMembersService,
  updateWorkspaceByIdService,
} from "../services/workspace.service";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/role-guard";
import { Permissions } from "../enums/role.enum";
import { createAuditLogServices } from "../services/auditlog.service";
import { AuditActionEnum, AuditEntityEnum } from "../enums/auditlog.enum";
import { getMetadata } from "../utils/auditlog.helper";
import { NotFoundException } from "../utils/app-error";
import WorkspaceModel from "../models/workspace.model";

export const createWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createWorkspaceSchema.parse(req.body);

    const userId = req.user?._id;

    const { workspace } = await createWorkspaceService(userId, body);

    await createAuditLogServices({
      workspaceId: (workspace._id as string).toString(),
      action: AuditActionEnum.CREATE,
      entityType: AuditEntityEnum.WORKSPACE,
      createdBy: userId.toString(),
      metadata: getMetadata(
        AuditEntityEnum.WORKSPACE,
        {
          name: workspace.name,
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

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Workspace created successfully",
      workspace,
    });
  }
);

export const getAllWorkspacesUserIsMemberController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { workspaces } = await getAllWorkspacesUserIsMemberService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User workspaces fetched successfully",
      workspaces,
    });
  }
);

export const getWorkspaceByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    await getMemberRoleInWorkspace(userId, workspaceId);

    const { workspace } = await getWorkspaceByIdService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace fetched successfully",
      workspace,
    });
  }
);

export const getWorkspaceMembersController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { members, roles } = await getWorkspaceMembersService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace members retrieved successfully",
      members,
      roles,
    });
  }
);

export const getWorkspaceAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { analytics } = await getWorkspaceAnalyticsService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace analytics retrieved successfully",
      analytics,
    });
  }
);

export const changeWorkspaceMemberRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const { memberId, roleId } = changeRoleSchema.parse(req.body);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CHANGE_MEMBER_ROLE]);

    const { member } = await changeMemberRoleService(
      workspaceId,
      memberId,
      roleId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Member Role changed successfully",
      member,
    });
  }
);

export const updateWorkspaceByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const { name, description } = updateWorkspaceSchema.parse(req.body);

    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_WORKSPACE]);

    // Fetch old workspace
    const oldWorkspace = await WorkspaceModel.findById(workspaceId);
    if (!oldWorkspace) throw new NotFoundException("Workspace not found");

    const { workspace } = await updateWorkspaceByIdService(
      workspaceId,
      name,
      description
    );

    await createAuditLogServices({
      workspaceId: workspaceId,
      action: AuditActionEnum.UPDATE,
      entityType: AuditEntityEnum.WORKSPACE,
      createdBy: userId.toString(),
      metadata: getMetadata(
        AuditEntityEnum.WORKSPACE,
        {
          oldValue: {
            name: oldWorkspace.name,
            description: oldWorkspace.description,
          },
          newValue: {
            name: workspace.name,
            description: workspace.description,
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
      message: "Workspace updated successfully",
      workspace,
    });
  }
);

export const deleteWorkspaceByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_WORKSPACE]);

    // Fetch workspace before deletion for metadata
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundException("Workspace not found");

    const { currentWorkspace } = await deleteWorkspaceByIdService(
      workspaceId,
      userId
    );

    // delete audit log for that workspace

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace deleted successfully",
      currentWorkspace,
    });
  }
);
