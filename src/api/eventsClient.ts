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

  // FormData 내용 디버깅 (개발 환경에서만)
  if (import.meta.env.DEV) {
    console.log("FormData contents:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(
          `${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
        );
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    console.log("API URL:", url);
    console.log("Auth token:", authToken ? "Present" : "Missing");
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        // Content-Type을 명시적으로 설정하지 않음 (multipart/form-data 자동 설정)
      },
      credentials: "include",
    });

    console.log("Response status:", res.status);
    console.log("Response headers:", Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const text = await res.text();
      console.error("=== 행사 생성 에러 상세 정보 ===");
      console.error("HTTP Status:", res.status);
      console.error("Status Text:", res.statusText);
      console.error("Response Body:", text);
      console.error("Request URL:", url);
      console.error("Request Method:", "POST");
      console.error("Auth Token Present:", !!authToken);
      console.error("FormData Keys:", Array.from(formData.keys()));
      console.error("=================================");

      // JSON 파싱 시도
      try {
        const errorJson = JSON.parse(text);
        console.error("Parsed Error JSON:", errorJson);
        throw new Error(
          `행사 생성 실패 (${res.status}): ${errorJson.message || text}`
        );
      } catch (parseError) {
        throw new Error(`행사 생성 실패 (${res.status}): ${text}`);
      }
    }

    const responseData = await res.json();
    console.log("행사 생성 성공:", responseData);
    return responseData as { id: number; message: string };
  } catch (error) {
    console.error("=== 네트워크/기타 에러 ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Request URL:", url);
    console.error("=============================");
    throw error;
  }
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
