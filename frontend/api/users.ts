import { api } from "./client";
import { User } from "../types";

export function getUsers() {
  return api.request<User[]>("/auth/users/");
}

