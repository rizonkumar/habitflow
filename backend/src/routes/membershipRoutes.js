import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  addMemberController,
  getUserRoleController,
  listMembersController,
  removeMemberController,
  updateMemberRoleController,
} from "../controllers/membershipController.js";
import {
  addMemberSchema,
  getRoleSchema,
  listMembersSchema,
  removeMemberSchema,
  updateRoleSchema,
} from "../validators/membershipValidators.js";

const router = Router();

router.get(
  "/:projectId/members",
  requireAuth,
  validate(listMembersSchema),
  listMembersController
);

router.get(
  "/:projectId/role",
  requireAuth,
  validate(getRoleSchema),
  getUserRoleController
);

router.post(
  "/:projectId/members",
  requireAuth,
  validate(addMemberSchema),
  addMemberController
);

router.patch(
  "/:projectId/members/:memberId",
  requireAuth,
  validate(updateRoleSchema),
  updateMemberRoleController
);

router.delete(
  "/:projectId/members/:memberId",
  requireAuth,
  validate(removeMemberSchema),
  removeMemberController
);

export const membershipRoutes = router;
