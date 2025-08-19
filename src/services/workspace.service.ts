import mongoose from "mongoose";
import UserModel from "../models/user.model";
import { NotFoundException } from "../utils/app-error";
import RoleModel from "../models/roles-permission.model";
import { Roles } from "../enums/role.enum";
import WorkspaceModel from "../models/workspace.model";
import MemberModel from "../models/member.model";

// CREATE NEW WORKSPACE
export const createWorkspaceService = async (
  userId: string,
  body: { name: string; description?: string | undefined }
) => {
  const { name, description } = body;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundException("user not found");
  }

  const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });
  if (!ownerRole) {
    throw new NotFoundException("Owner role not found");
  }

  const workspace = new WorkspaceModel({
    name: name,
    description: description,
    owner: user._id,
  });
  await workspace.save();

  const memeber = new MemberModel({
    userId: user._id,
    workspaceId: workspace._id,
    role: ownerRole._id,
    joinedAt: new Date(),
  });
  await memeber.save();

  user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
  await user.save();

  return { workspace };
};

// GET WORKSPACES USER IS A MEMBER
export const getAllWorkspacesUserIsMemberService = async (userId: string) => {
  const memberships = await MemberModel.find({ userId })
    .populate("workspaceId")
    .select("-password")
    .exec();

  const workspaces = memberships.map((membership) => membership.workspaceId);
  return { workspaces };
};
