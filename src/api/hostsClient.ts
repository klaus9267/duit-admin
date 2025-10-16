import { HostListParams, HostListResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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
  params: HostListParams
): Promise<HostListResponse> {
  const url = `${API_BASE}/api/v1/hosts${toQuery(params)}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch hosts: ${res.status} ${text}`);
  }
  return (await res.json()) as HostListResponse;
}
