export const serializeTodo = (todo) => ({
  id: todo.id,
  title: todo.title,
  description: todo.description,
  projectId: todo.projectId?.toString(),
  ownerId: todo.ownerId?.toString(),
  status: todo.status,
  dueDate: todo.dueDate,
  priority: todo.priority,
  tags: todo.tags || [],
  completedAt: todo.completedAt,
  createdAt: todo.createdAt,
  updatedAt: todo.updatedAt,
});
