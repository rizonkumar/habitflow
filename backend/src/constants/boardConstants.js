export const boardErrors = {
  missingTitle: { status: 400, message: "Task title is required" },
  columnNotFound: { status: 404, message: "Board column not found" },
  taskNotFound: { status: 404, message: "Board task not found" },
  forbidden: { status: 403, message: "Not allowed for this board" },
};
