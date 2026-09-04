"use client";

const TOKEN_KEY = "employee_mgmt_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const t = localStorage.getItem(TOKEN_KEY);
  try {
    console.debug("auth:getToken ->", Boolean(t));
  } catch {}
  return t;
}

export function saveToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
    console.debug("auth:saveToken -> saved", token ? true : false);
  } catch (e) {
    console.error("auth:saveToken error", e);
  }
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
