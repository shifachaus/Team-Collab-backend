import mongoose from "mongoose";
import ProjectModel from "../models/project.model";
import { NotFoundException } from "../utils/app-error";

export const createProjectService = async (
  userId: string,
  workspaceId: string,
  body: {
    emoji?: string;
    name: string;
    description?: string;
  }
) => {
  const project = new ProjectModel({
    ...(body.emoji && { emoji: body.emoji }),
    name: body.name,
    description: body.description,
    workspace: workspaceId,
    createdBy: userId,
  });

  await project.save();
  return { project };
};

export const getProjectsInWorkspaceService = async (
  workspaceId: string,
  pageSize: number,
  pageNumber: number
) => {
  // Find all projects in the workspace
  const totalCount = await ProjectModel.countDocuments({
    workspace: workspaceId,
  });

  //  (1-1)*10 --> 0 * 10 --> 0
  const skip = (pageNumber - 1) * pageSize;

  const projects = await ProjectModel.find({
    workspace: workspaceId,
  })
    .skip(skip)
    .limit(pageSize)
    .populate("createdBy", "_id name profilePicture -password")
    .sort({ createdAt: -1 });

  const totalPage = Math.ceil(totalCount / pageSize);

  return {
    projects,
    skip,
    totalCount,
    totalPage,
  };
};

export const getProjectByIdAndWorkspaceIdservice = async (
  workspaceId: string,
  projectId: string
) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  }).select("_id emoji name description");

  if (!project) {
    throw new NotFoundException(
      "Project not found or does not belong to the specified workspace"
    );
  }

  return {
    project,
  };
};
