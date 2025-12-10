import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from "../services/projectService.js";
import { serializeProject } from "../serializers/projectSerializer.js";

export const createProjectController = async (req, res, next) => {
  try {
    const project = await createProject({
      ...req.validated.body,
      userId: req.userId,
    });
    res.status(201).json({ project: serializeProject(project) });
  } catch (error) {
    next(error);
  }
};

export const listProjectsController = async (req, res, next) => {
  try {
    const projects = await listProjects(req.userId, req.validated.query);
    res.json({ projects: projects.map(serializeProject) });
  } catch (error) {
    next(error);
  }
};

export const updateProjectController = async (req, res, next) => {
  try {
    const project = await updateProject({
      projectId: req.validated.params.projectId,
      userId: req.userId,
      ...req.validated.body,
    });
    res.json({ project: serializeProject(project) });
  } catch (error) {
    next(error);
  }
};

export const deleteProjectController = async (req, res, next) => {
  try {
    await deleteProject({
      projectId: req.validated.params.projectId,
      userId: req.userId,
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
