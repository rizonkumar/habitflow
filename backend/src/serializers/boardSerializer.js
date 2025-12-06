export const serializeColumn = (column) => ({
  id: column.id,
  projectId: column.projectId?.toString(),
  name: column.name,
  order: column.order,
  createdAt: column.createdAt,
  updatedAt: column.updatedAt,
});

export const serializeTask = (task) => ({
  id: task.id,
  projectId: task.projectId?.toString(),
  title: task.title,
  description: task.description,
  statusColumnId: task.statusColumnId?.toString(),
  assigneeId: task.assigneeId ? task.assigneeId.toString() : undefined,
  priority: task.priority,
  tags: task.tags || [],
  dueDate: task.dueDate,
  order: task.order,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

