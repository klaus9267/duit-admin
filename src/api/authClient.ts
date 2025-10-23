import { API_BASE } from "./eventsClient";

export interface LoginRequest {
  adminId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const url = `${API_BASE}/api/v1/admin/auth/login`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`로그인 실패: ${response.status} ${errorText}`);
  }

  return await response.json();
}

export async function logout(): Promise<void> {
  // 토큰을 localStorage에서 제거
  localStorage.removeItem("admin_token");
}

export function getStoredToken(): string | null {
  return localStorage.getItem("admin_token");
}

export function setStoredToken(token: string): void {
  localStorage.setItem("admin_token", token);
}
