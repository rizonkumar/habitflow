import bcrypt from "bcrypt";
import { connectDatabase } from "../src/config/database.js";
import { User } from "../src/models/userModel.js";
import { Project } from "../src/models/projectModel.js";
import { Todo } from "../src/models/todoModel.js";
import { HealthLog } from "../src/models/healthLogModel.js";
import { initBoard } from "../src/services/boardService.js";
import { createTodo } from "../src/services/todoService.js";
import { createLog } from "../src/services/healthService.js";
import { updateStreakOnActivity } from "../src/services/streakService.js";

const seed = async () => {
  await connectDatabase();

  const email = "demo@habitflow.test";
  const password = "password123";

  let user = await User.findOne({ email });
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10);
    user = await User.create({
      name: "Demo User",
      email,
      passwordHash,
      preferences: { defaultTheme: "light", defaultSection: "todo" },
    });
    console.log("Created user:", email);
  } else {
    console.log("User already exists:", email);
  }

  let project = await Project.findOne({
    ownerId: user.id,
    name: "Demo Project",
  });
  if (!project) {
    project = await Project.create({
      name: "Demo Project",
      description: "Sample project for HabitFlow",
      ownerId: user.id,
      members: [{ userId: user.id, role: "owner" }],
      type: "mixed",
    });
    console.log("Created project:", project.name);
  } else {
    console.log("Project already exists:", project.name);
  }

  await initBoard({ projectId: project.id, userId: user.id });

  const todoExists = await Todo.findOne({
    projectId: project.id,
    title: "Welcome to HabitFlow",
  });
  if (!todoExists) {
    await createTodo({
      title: "Welcome to HabitFlow",
      description: "Try completing this todo to start your streak.",
      projectId: project.id,
      ownerId: user.id,
      priority: "medium",
    });
    console.log("Created sample todo");
  } else {
    console.log("Sample todo already exists");
  }

  const healthExists = await HealthLog.findOne({
    userId: user.id,
    type: "water",
  });
  if (!healthExists) {
    await createLog({
      userId: user.id,
      type: "water",
      amount: 500,
      unit: "ml",
      date: new Date(),
    });
    console.log("Created sample health log");
  } else {
    console.log("Sample health log already exists");
  }

  await updateStreakOnActivity(user.id);
  console.log("Seeded streak for demo user");

  console.log("Seed complete. Demo user password:", password);
};

seed()
  .then(() => {
    console.log("Seed finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
