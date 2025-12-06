import { Project } from "../models/projectModel.js";
import { appError } from "../errors/appError.js";
import { projectErrors } from "../constants/projectConstants.js";

const ensureMember = (project, userId) => {
  const isOwner = project.ownerId.toString() === userId;
  const isMember = project.members.some((m) => m.userId.toString() === userId);
  if (!isOwner && !isMember) {
    throw appError(
      projectErrors.forbidden.status,
      projectErrors.forbidden.message
    );
  }
};

export const createProject = async ({ name, description, type, userId }) => {
  if (!name?.trim()) {
    throw appError(
      projectErrors.missingName.status,
      projectErrors.missingName.message
    );
  }

  const project = await Project.create({
    name: name.trim(),
    description: description || "",
    type: type || "mixed",
    ownerId: userId,
    members: [{ userId, role: "admin" }],
  });

  return project;
};

export const listProjects = async (userId, filter = {}) => {
  const criteria = {
    $or: [{ ownerId: userId }, { "members.userId": userId }],
  };
  if (filter.type) {
    criteria.type = filter.type;
  }
  return Project.find(criteria).sort({ createdAt: -1 });
};

export const updateProject = async ({
  projectId,
  userId,
  name,
  description,
}) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw appError(
      projectErrors.notFound.status,
      projectErrors.notFound.message
    );
  }
  ensureMember(project, userId);

  if (project.ownerId.toString() !== userId) {
    throw appError(
      projectErrors.forbidden.status,
      projectErrors.forbidden.message
    );
  }

  if (!name?.trim()) {
    throw appError(
      projectErrors.missingName.status,
      projectErrors.missingName.message
    );
  }

  project.name = name.trim();
  project.description = description || "";
  await project.save();
  return project;
};

export const deleteProject = async ({ projectId, userId }) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw appError(
      projectErrors.notFound.status,
      projectErrors.notFound.message
    );
  }
  if (project.ownerId.toString() !== userId) {
    throw appError(
      projectErrors.forbidden.status,
      projectErrors.forbidden.message
    );
  }
  await Project.deleteOne({ _id: projectId });
};
