import { EventListParams, EventListResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch events: ${res.status} ${text}`);
  }
  return (await res.json()) as EventListResponse;
}
