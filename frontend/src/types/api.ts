export type ProjectRole = "admin" | "editor" | "viewer";

export type Project = {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: { userId: string; role: ProjectRole }[];
  type: "todo" | "jira" | "health" | "mixed";
  createdAt: string;
  updatedAt: string;
};

export type ProjectMember = {
  userId: string;
  role: ProjectRole;
  name: string;
  email: string;
  avatarUrl: string;
};

export type Todo = {
  id: string;
  title: string;
  description: string;
  projectId?: string | null;
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

type HealthLogBase = {
  id: string;
  userId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type WaterLog = HealthLogBase & {
  type: "water";
  glasses: number;
  milliliters?: number;
};

export type GymLog = HealthLogBase & {
  type: "gym";
  workoutType: string;
  durationMinutes: number;
  caloriesBurned?: number;
  notes?: string;
};

export type SleepQuality = "low" | "good" | "excellent";

export type SleepLog = HealthLogBase & {
  type: "sleep";
  bedtime: string;
  wakeTime: string;
  sleepDurationMinutes: number;
  quality: SleepQuality;
};

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type DietLog = HealthLogBase & {
  type: "diet";
  mealType: MealType;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  description?: string;
};

export type CustomLog = HealthLogBase & {
  type: "custom";
  name: string;
  value: number;
  unit: string;
};

export type HealthLog = WaterLog | GymLog | SleepLog | DietLog | CustomLog;

export type HealthLogType = HealthLog["type"];

export type Streak = {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  updatedAt: string;
};
