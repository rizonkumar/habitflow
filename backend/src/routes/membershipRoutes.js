import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  listMembers,
  addMember,
  updateMemberRole,
  removeMember,
  getUserRole,
} from "../services/membershipService.js";

const router = Router();

const projectParam = z.object({ projectId: z.string().min(1) });
const memberParam = z.object({
  projectId: z.string().min(1),
  memberId: z.string().min(1),
});

const listMembersSchema = z.object({ params: projectParam });

const addMemberSchema = z.object({
  params: projectParam,
  body: z.object({
    email: z.string().email(),
    role: z.enum(["admin", "editor", "viewer"]).optional(),
  }),
});

const updateRoleSchema = z.object({
  params: memberParam,
  body: z.object({
    role: z.enum(["admin", "editor", "viewer"]),
  }),
});

const removeMemberSchema = z.object({ params: memberParam });

const getRoleSchema = z.object({ params: projectParam });

// List all members of a project
router.get(
  "/:projectId/members",
  requireAuth,
  validate(listMembersSchema),
  async (req, res, next) => {
    try {
      const members = await listMembers({
        projectId: req.validated.params.projectId,
        actorId: req.userId,
      });
      res.json({ members });
    } catch (error) {
      next(error);
    }
  }
);

// Get current user's role in a project
router.get(
  "/:projectId/role",
  requireAuth,
  validate(getRoleSchema),
  async (req, res, next) => {
    try {
      const role = await getUserRole(
        req.validated.params.projectId,
        req.userId
      );
      res.json({ role });
    } catch (error) {
      next(error);
    }
  }
);

// Add a member to a project
router.post(
  "/:projectId/members",
  requireAuth,
  validate(addMemberSchema),
  async (req, res, next) => {
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
  }
);

// Update a member's role
router.patch(
  "/:projectId/members/:memberId",
  requireAuth,
  validate(updateRoleSchema),
  async (req, res, next) => {
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
  }
);

// Remove a member from a project
router.delete(
  "/:projectId/members/:memberId",
  requireAuth,
  validate(removeMemberSchema),
  async (req, res, next) => {
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
  }
);

export const membershipRoutes = router;
