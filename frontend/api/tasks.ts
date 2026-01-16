import { api } from "./client";
import { Task } from "../types";

export function getTasks() {
  return api.request<Task[]>("/tasks/");
}

export function createTask(payload: Omit<Task, "id" | "createdAt">) {
  return api.request<Task>("/tasks/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTask(id: number, payload: Partial<Omit<Task, "id" | "createdAt">>) {
  return api.request<Task>(`/tasks/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteTask(id: number) {
  return api.request<Task>(`/tasks/${id}/delete_task/`, {
    method: "PATCH",
  });
}

export function assignTask(taskId: number, userId: number | null) {
  return api.request<Task>(`/tasks/${taskId}/assign/`, {
    method: "PATCH",
    body: JSON.stringify({ assigned_to: userId }),
  });
}

export function unAssignTask(taskId: number) {
  return api.request<Task>(`/tasks/${taskId}/unassign/`, {
    method: "PATCH",
  });
}

export function closeTask(taskId: number) {
  return api.request<Task>(`/tasks/${taskId}/close/`, {
    method: "PATCH",
  });
}

export function historyTask(taskId: number) {
  return api.request<Task>(`/tasks/${taskId}/history/`, {
    method: "GET",
  });
}

export function commentTask(taskId: number, comment: string) {
  return api.request<Task>(`/tasks/${taskId}/comment/`, {
    method: "POST",
    body: JSON.stringify({ comment: comment }),
  });
}

export function commentsTask(taskId: number) {
  return api.request<Task>(`/tasks/${taskId}/comments/`, {
    method: "GET",
  });
}
