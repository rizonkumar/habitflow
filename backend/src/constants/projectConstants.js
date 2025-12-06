export const projectErrors = {
  missingName: { status: 400, message: "Project name is required" },
  notFound: { status: 404, message: "Project not found" },
  forbidden: { status: 403, message: "Not allowed for this project" },
  userNotFound: { status: 404, message: "User not found with this email" },
  alreadyMember: {
    status: 400,
    message: "User is already a member of this project",
  },
  cannotRemoveSelf: {
    status: 400,
    message: "Cannot remove yourself if you are the last admin",
  },
  invalidRole: {
    status: 400,
    message: "Invalid role. Must be admin, editor, or viewer",
  },
  memberNotFound: { status: 404, message: "Member not found in this project" },
  adminRequired: {
    status: 403,
    message: "Only admins can perform this action",
  },
};
