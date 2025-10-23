import { HostListParams, HostListResponse } from "./types";
import { API_BASE } from "./eventsClient";

function toQuery(params: HostListParams): string {
  const s = new URLSearchParams();
  if (params.page !== undefined) s.set("page", String(params.page));
  if (params.size !== undefined) s.set("size", String(params.size));
  if (params.sortDirection) s.set("sortDirection", params.sortDirection);
  if (params.field) s.set("field", params.field);
  const q = s.toString();
  return q ? `?${q}` : "";
}

export async function getHosts(
  params: HostListParams,
  token?: string
): Promise<HostListResponse> {
  const url = `${API_BASE}/api/v1/hosts${toQuery(params)}`;

  // 토큰이 없으면 localStorage에서 가져오기
  const authToken = token || localStorage.getItem("admin_token");

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch hosts: ${res.status} ${text}`);
  }
  return (await res.json()) as HostListResponse;
}
