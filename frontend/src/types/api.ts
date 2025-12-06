export type Project = {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: { userId: string; role: "owner" | "editor" | "viewer" }[];
  type: "todo" | "jira" | "health" | "mixed";
  createdAt: string;
  updatedAt: string;
};

export type Todo = {
  id: string;
  title: string;
  description: string;
  projectId?: string | null; // optional -> supports Inbox (no project)
  ownerId: string;
  status: "todo" | "completed";
  dueDate?: string;
  priority: "low" | "medium" | "high";
  tags: string[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardColumn = {
  id: string;
  projectId: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type BoardTask = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  statusColumnId: string;
  assigneeId?: string;
  priority: "low" | "medium" | "high";
  tags: string[];
  dueDate?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type HealthLog = {
  id: string;
  userId: string;
  type: "water" | "gym" | "sleep" | "diet" | "custom";
  amount: number;
  unit: string;
  metadata: Record<string, any>;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type Streak = {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  updatedAt: string;
};
