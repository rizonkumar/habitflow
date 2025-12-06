import { Project } from "../models/projectModel.js";
import { User } from "../models/userModel.js";
import { appError } from "../errors/appError.js";
import { projectErrors } from "../constants/projectConstants.js";

const VALID_ROLES = ["admin", "editor", "viewer"];

export const getUserRole = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    return null;
  }
  const member = project.members.find((m) => m.userId.toString() === userId);
  return member?.role || null;
};

const ensureAdmin = async (project, actorId) => {
  const actorMember = project.members.find(
    (m) => m.userId.toString() === actorId
  );
  if (!actorMember || actorMember.role !== "admin") {
    throw appError(
      projectErrors.adminRequired.status,
      projectErrors.adminRequired.message
    );
  }
};

export const listMembers = async ({ projectId, actorId }) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw appError(
      projectErrors.notFound.status,
      projectErrors.notFound.message
    );
  }

  const actorMember = project.members.find(
    (m) => m.userId.toString() === actorId
  );
  if (!actorMember) {
    throw appError(
      projectErrors.forbidden.status,
      projectErrors.forbidden.message
    );
  }

  const userIds = project.members.map((m) => m.userId);
  const users = await User.find({ _id: { $in: userIds } }).select(
    "name email avatarUrl"
  );

  const userMap = new Map(users.map((u) => [u.id, u]));

  const membersWithDetails = project.members.map((m) => {
    const user = userMap.get(m.userId.toString());
    return {
      userId: m.userId.toString(),
      role: m.role,
      name: user?.name || "Unknown",
      email: user?.email || "",
      avatarUrl: user?.avatarUrl || "",
    };
  });

  return membersWithDetails;
};

export const addMember = async ({
  projectId,
  email,
  role = "viewer",
  actorId,
}) => {
  if (role && !VALID_ROLES.includes(role)) {
    throw appError(
      projectErrors.invalidRole.status,
      projectErrors.invalidRole.message
    );
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw appError(
      projectErrors.notFound.status,
      projectErrors.notFound.message
    );
  }

  await ensureAdmin(project, actorId);

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw appError(
      projectErrors.userNotFound.status,
      projectErrors.userNotFound.message
    );
  }

  const existingMember = project.members.find(
    (m) => m.userId.toString() === user.id
  );
  if (existingMember) {
    throw appError(
      projectErrors.alreadyMember.status,
      projectErrors.alreadyMember.message
    );
  }

  project.members.push({ userId: user.id, role });
  await project.save();

  return {
    userId: user.id,
    role,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || "",
  };
};

export const updateMemberRole = async ({
  projectId,
  memberId,
  role,
  actorId,
}) => {
  if (!VALID_ROLES.includes(role)) {
    throw appError(
      projectErrors.invalidRole.status,
      projectErrors.invalidRole.message
    );
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw appError(
      projectErrors.notFound.status,
      projectErrors.notFound.message
    );
  }

  await ensureAdmin(project, actorId);

  const memberIndex = project.members.findIndex(
    (m) => m.userId.toString() === memberId
  );
  if (memberIndex === -1) {
    throw appError(
      projectErrors.memberNotFound.status,
      projectErrors.memberNotFound.message
    );
  }

  const currentRole = project.members[memberIndex].role;
  if (currentRole === "admin" && role !== "admin") {
    const adminCount = project.members.filter((m) => m.role === "admin").length;
    if (adminCount <= 1) {
      throw appError(
        projectErrors.cannotRemoveSelf.status,
        "Cannot demote the last admin"
      );
    }
  }

  project.members[memberIndex].role = role;
  await project.save();

  const user = await User.findById(memberId).select("name email avatarUrl");
  return {
    userId: memberId,
    role,
    name: user?.name || "Unknown",
    email: user?.email || "",
    avatarUrl: user?.avatarUrl || "",
  };
};

export const removeMember = async ({ projectId, memberId, actorId }) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw appError(
      projectErrors.notFound.status,
      projectErrors.notFound.message
    );
  }

  await ensureAdmin(project, actorId);

  const memberIndex = project.members.findIndex(
    (m) => m.userId.toString() === memberId
  );
  if (memberIndex === -1) {
    throw appError(
      projectErrors.memberNotFound.status,
      projectErrors.memberNotFound.message
    );
  }

  const memberRole = project.members[memberIndex].role;
  if (memberRole === "admin") {
    const adminCount = project.members.filter((m) => m.role === "admin").length;
    if (adminCount <= 1) {
      throw appError(
        projectErrors.cannotRemoveSelf.status,
        projectErrors.cannotRemoveSelf.message
      );
    }
  }

  project.members.splice(memberIndex, 1);
  await project.save();
};
