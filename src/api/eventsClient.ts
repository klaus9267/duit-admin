import { EventListParams, EventListResponse } from "./types";

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function toQuery(params: EventListParams): string {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.size !== undefined) search.set("size", String(params.size));
  if (params.sortDirection) search.set("sortDirection", params.sortDirection);
  if (params.field) search.set("field", params.field);
  if (params.isApproved !== undefined)
    search.set("isApproved", String(params.isApproved));
  if (params.includeFinished !== undefined)
    search.set("includeFinished", String(params.includeFinished));
  if (params.isBookmarked !== undefined)
    search.set("isBookmarked", String(params.isBookmarked));
  if (params.type && params.type.length > 0) {
    for (const t of params.type) search.append("type", t);
  }
  if (params.hostId !== undefined) search.set("hostId", String(params.hostId));
  if (params.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  const s = search.toString();
  return s ? `?${s}` : "";
}

export async function getEvents(
  params: EventListParams,
  token?: string
): Promise<EventListResponse> {
  const query = toQuery(params);
  const url = `${API_BASE}/api/v1/events${query}`;

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
    throw new Error(`Failed to fetch events: ${res.status} ${text}`);
  }
  return (await res.json()) as EventListResponse;
}

export async function createEvent(
  formData: FormData,
  token?: string
): Promise<{ id: number; message: string }> {
  const url = `${API_BASE}/api/v1/events/admin`;

  // 토큰이 없으면 localStorage에서 가져오기
  const authToken = token || localStorage.getItem("admin_token");

  const res = await fetch(url, {
    method: "POST",
    body: formData,
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create event: ${res.status} ${text}`);
  }

  return (await res.json()) as { id: number; message: string };
}

export async function deleteEvent(
  eventId: number,
  token?: string
): Promise<void> {
  const url = `${API_BASE}/api/v1/events/${eventId}`;

  // 토큰이 없으면 localStorage에서 가져오기
  const authToken = token || localStorage.getItem("admin_token");

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete event: ${res.status} ${text}`);
  }
}
