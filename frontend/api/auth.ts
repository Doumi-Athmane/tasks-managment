import { api } from "./client";
import { clearTokens } from "../auth/token";
import { User } from "../types";

type TokenResponse = {
  access: string;
  refresh: string;
};
export async function login(username: string, password: string) {
    const res =  await api.request<TokenResponse>("/auth/login/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });
    if (!res) {
        throw new Error("Invalid credentials");
    }

    return res;
}

export function logoutAndRedirect() {
  clearTokens();
  window.location.href = "/login";
}


export function createUser(first_name: string,last_name : string, password: string, password_confirm: string) {
  return api.request<{ user: User }>("/auth/register/", {
    method: "POST",
    body: JSON.stringify({ first_name, last_name, password, password_confirm }),
  }).then(() => {
    window.location.href = "/login";
  });
}




