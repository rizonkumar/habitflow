import {
  addMember,
  getUserRole,
  listMembers,
  removeMember,
  updateMemberRole,
} from "../services/membershipService.js";

export const listMembersController = async (req, res, next) => {
  try {
    const members = await listMembers({
      projectId: req.validated.params.projectId,
      actorId: req.userId,
    });
    res.json({ members });
  } catch (error) {
    next(error);
  }
};

export const getUserRoleController = async (req, res, next) => {
  try {
    const role = await getUserRole(req.validated.params.projectId, req.userId);
    res.json({ role });
  } catch (error) {
    next(error);
  }
};

export const addMemberController = async (req, res, next) => {
  try {
    const member = await addMember({
      projectId: req.validated.params.projectId,
      email: req.validated.body.email,
      role: req.validated.body.role,
      actorId: req.userId,
    });
    res.status(201).json({ member });
  } catch (error) {
    next(error);
  }
};

export const updateMemberRoleController = async (req, res, next) => {
  try {
    const member = await updateMemberRole({
      projectId: req.validated.params.projectId,
      memberId: req.validated.params.memberId,
      role: req.validated.body.role,
      actorId: req.userId,
    });
    res.json({ member });
  } catch (error) {
    next(error);
  }
};

export const removeMemberController = async (req, res, next) => {
  try {
    await removeMember({
      projectId: req.validated.params.projectId,
      memberId: req.validated.params.memberId,
      actorId: req.userId,
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
