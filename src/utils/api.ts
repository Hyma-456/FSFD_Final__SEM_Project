/**
 * Centralized API service for connecting the React frontend
 * to the Spring Boot backend (http://localhost:8080).
 */

const API_BASE = "/api";

// ── Generic fetch helper ─────────────────────────────────────
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ── Projects ─────────────────────────────────────────────────
export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  progress: number;
  members: number;
  lead: string;
}

export const projectsApi = {
  getAll: () => apiFetch<Project[]>("/projects"),
  getById: (id: number) => apiFetch<Project>(`/projects/${id}`),
  create: (project: Omit<Project, "id">) =>
    apiFetch<Project>("/projects", { method: "POST", body: JSON.stringify(project) }),
  update: (id: number, project: Partial<Project>) =>
    apiFetch<Project>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(project) }),
  delete: (id: number) =>
    apiFetch<void>(`/projects/${id}`, { method: "DELETE" }),
};

// ── Milestones ───────────────────────────────────────────────
export interface Milestone {
  id: number;
  name: string;
  done: boolean;
  projectId: number;
}

export const milestonesApi = {
  getByProject: (projectId: number) => apiFetch<Milestone[]>(`/milestones/project/${projectId}`),
  toggle: (id: number, done: boolean) =>
    apiFetch<Milestone>(`/milestones/${id}`, { method: "PUT", body: JSON.stringify({ done }) }),
};

// ── Documents ────────────────────────────────────────────────
export interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  date: string;
  project: string;
  content: string;
}

export const documentsApi = {
  getAll: () => apiFetch<Document[]>("/documents"),
  create: (doc: Omit<Document, "id">) =>
    apiFetch<Document>("/documents", { method: "POST", body: JSON.stringify(doc) }),
  delete: (id: number) =>
    apiFetch<void>(`/documents/${id}`, { method: "DELETE" }),
};

// ── Messages ─────────────────────────────────────────────────
export interface Message {
  id: number;
  sender: string;
  message: string;
  time: string;
  project: string;
  type: string;
  status: string;
}

export const messagesApi = {
  getAll: () => apiFetch<Message[]>("/messages"),
  create: (msg: Omit<Message, "id">) =>
    apiFetch<Message>("/messages", { method: "POST", body: JSON.stringify(msg) }),
};

// ── Users / Team ─────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  password?: string;
}

export const usersApi = {
  getAll: () => apiFetch<User[]>("/users"),
  getById: (id: number) => apiFetch<User>(`/users/${id}`),
  create: (user: Omit<User, "id">) =>
    apiFetch<User>("/users", { method: "POST", body: JSON.stringify(user) }),
  delete: (id: number) =>
    apiFetch<void>(`/users/${id}`, { method: "DELETE" }),
};

// ── Courses ──────────────────────────────────────────────────
export interface Course {
  id: number;
  name: string;
  description: string;
  credits: number;
  instructor: string;
}

export const coursesApi = {
  getAll: () => apiFetch<Course[]>("/courses"),
};

// ── Enrollments ──────────────────────────────────────────────
export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  enrolledDate: string;
}

export const enrollmentsApi = {
  getAll: () => apiFetch<Enrollment[]>("/enrollments"),
};

// ── Project Members ──────────────────────────────────────────
export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  role: string;
}

export const projectMembersApi = {
  getAll: () => apiFetch<ProjectMember[]>("/project-members"),
};
