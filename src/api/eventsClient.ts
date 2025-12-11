import { CursorEventListParams, CursorEventListResponse } from "./types";

// 토큰이 없으면 로그인 페이지로 리다이렉트하는 함수
function checkAuthAndRedirect() {
  const token = localStorage.getItem("admin_token");
  if (!token) {
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    window.location.href = "/";
    throw new Error("인증이 필요합니다. 로그인 페이지로 이동합니다.");
  }
  return token;
}

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "" : "https://klaus9267.duckdns.org");

function toQuery(params: CursorEventListParams): string {
  const search = new URLSearchParams();
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.size !== undefined) search.set("size", String(params.size));
  if (params.field) search.set("field", params.field);
  if (params.bookmarked !== undefined)
    search.set("bookmarked", String(params.bookmarked));
  if (params.types && params.types.length > 0) {
    for (const t of params.types) search.append("types", t);
  }
  if (params.status) search.set("status", params.status);
  if (params.statusGroup) search.set("statusGroup", params.statusGroup);
  if (params.hostId !== undefined) search.set("hostId", String(params.hostId));
  if (params.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  const s = search.toString();
  return s ? `?${s}` : "";
}

export async function getEvents(
  params: CursorEventListParams,
  token?: string
): Promise<CursorEventListResponse> {
  const query = toQuery(params);
  const url = `${API_BASE}/api/v2/events${query}`;

  if (import.meta.env.DEV) {
    console.log("[getEvents v2] params:", params);
    console.log("[getEvents v2] url:", url);
  }

  // 토큰 체크 및 리다이렉트
  const authToken = token || checkAuthAndRedirect();

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    if (res.status === 401) {
      // 인증 실패 시 로그인 페이지로 리다이렉트
      localStorage.removeItem("admin_token");
      window.location.href = "/";
      throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
    }
    const text = await res.text();
    throw new Error(`Failed to fetch events: ${res.status} ${text}`);
  }
  return (await res.json()) as CursorEventListResponse;
}

export async function createEvent(
  formData: FormData,
  token?: string
): Promise<{ id: number; message: string }> {
  const url = `${API_BASE}/api/v1/events/admin`;

  // 토큰 체크 및 리다이렉트
  const authToken = token || checkAuthAndRedirect();

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
      if (res.status === 401) {
        // 인증 실패 시 로그인 페이지로 리다이렉트
        localStorage.removeItem("admin_token");
        window.location.href = "/";
        throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
      }

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

export async function updateEvent(
  eventId: number,
  formData: FormData,
  token?: string
): Promise<{ id: number; message: string }> {
  const url = `${API_BASE}/api/v1/events/${eventId}`;

  // 토큰 체크 및 리다이렉트
  const authToken = token || checkAuthAndRedirect();

  // FormData 내용 디버깅 (개발 환경에서만)
  if (import.meta.env.DEV) {
    console.log("=== 행사 수정 FormData 내용 ===");
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
    console.log("===============================");
  }

  try {
    const res = await fetch(url, {
      method: "PUT",
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
      if (res.status === 401) {
        // 인증 실패 시 로그인 페이지로 리다이렉트
        localStorage.removeItem("admin_token");
        window.location.href = "/";
        throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
      }

      const text = await res.text();
      console.error("=== 행사 수정 에러 상세 정보 ===");
      console.error("HTTP Status:", res.status);
      console.error("Status Text:", res.statusText);
      console.error("Response Body:", text);
      console.error("Request URL:", url);
      console.error("Request Method:", "PUT");
      console.error("Auth Token Present:", !!authToken);
      console.error("FormData Keys:", Array.from(formData.keys()));
      console.error("=================================");

      // JSON 파싱 시도
      try {
        const errorJson = JSON.parse(text);
        console.error("Parsed Error JSON:", errorJson);
        throw new Error(
          `행사 수정 실패 (${res.status}): ${errorJson.message || text}`
        );
      } catch (parseError) {
        throw new Error(`행사 수정 실패 (${res.status}): ${text}`);
      }
    }

    const responseData = await res.json();
    console.log("행사 수정 성공:", responseData);
    return responseData as { id: number; message: string };
  } catch (error: any) {
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

  // 토큰 체크 및 리다이렉트
  const authToken = token || checkAuthAndRedirect();

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 401) {
      // 인증 실패 시 로그인 페이지로 리다이렉트
      localStorage.removeItem("admin_token");
      window.location.href = "/";
      throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
    }
    const text = await res.text();
    throw new Error(`Failed to delete event: ${res.status} ${text}`);
  }
}

// 행사 승인
export async function approveEvent(
  eventId: number,
  token?: string
): Promise<{ id: number; message: string }> {
  const url = `${API_BASE}/api/v1/events/${eventId}/approve`;

  // 토큰 체크 및 리다이렉트
  const authToken = token || checkAuthAndRedirect();

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/";
      throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
    }
    const text = await res.text();
    throw new Error(`승인 실패 (${res.status}): ${text}`);
  }

  try {
    return (await res.json()) as { id: number; message: string };
  } catch {
    return { id: eventId, message: "approved" };
  }
}
