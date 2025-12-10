export const serializeProject = (project) => ({
  id: project.id,
  name: project.name,
  description: project.description,
  ownerId: project.ownerId?.toString(),
  members: (project.members || []).map((member) => ({
    userId: member.userId?.toString(),
    role: member.role,
  })),
  type: project.type,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
});
