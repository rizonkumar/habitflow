import { z } from "zod";

const projectParam = z.object({ projectId: z.string().min(1) });
const memberParam = z.object({
  projectId: z.string().min(1),
  memberId: z.string().min(1),
});

export const listMembersSchema = z.object({ params: projectParam });

export const addMemberSchema = z.object({
  params: projectParam,
  body: z.object({
    email: z.string().email(),
    role: z.enum(["admin", "editor", "viewer"]).optional(),
  }),
});

export const updateRoleSchema = z.object({
  params: memberParam,
  body: z.object({
    role: z.enum(["admin", "editor", "viewer"]),
  }),
});

export const removeMemberSchema = z.object({ params: memberParam });

export const getRoleSchema = z.object({ params: projectParam });
