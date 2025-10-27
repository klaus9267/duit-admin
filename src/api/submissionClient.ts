import { EventType } from './types';

export interface EventSubmissionRequest {
  // 행사 기본 정보
  title: string;
  startAt: string;
  endAt: string;
  recruitmentStartAt?: string;
  recruitmentEndAt?: string;
  uri: string;
  eventType: EventType;

  // 주최기관 정보 (둘 중 하나)
  hostId?: number; // 기존 주최기관 선택 시
  hostName?: string; // 새 주최기관 생성 시
}

export interface EventSubmissionResponse {
  id: number;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'https://klaus9267.duckdns.org');

export async function submitEvent(formData: FormData): Promise<EventSubmissionResponse> {
  const url = `${API_BASE}/api/v1/events/submission`;

  // FormData 내용 디버깅 (개발 환경에서만)
  if (import.meta.env.DEV) {
    console.log('=== 사용자 제보 FormData 내용 ===');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    console.log('API URL:', url);
    console.log('===============================');
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        // Content-Type을 명시적으로 설정하지 않음 (multipart/form-data 자동 설정)
      },
      credentials: 'include',
    });

    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const text = await res.text();
      console.error('=== 사용자 제보 에러 상세 정보 ===');
      console.error('HTTP Status:', res.status);
      console.error('Status Text:', res.statusText);
      console.error('Response Body:', text);
      console.error('Request URL:', url);
      console.error('Request Method:', 'POST');
      console.error('FormData Keys:', Array.from(formData.keys()));
      console.error('=================================');

      // JSON 파싱 시도
      try {
        const errorJson = JSON.parse(text);
        console.error('Parsed Error JSON:', errorJson);
        throw new Error(`제보 실패 (${res.status}): ${errorJson.message || text}`);
      } catch (parseError) {
        throw new Error(`제보 실패 (${res.status}): ${text}`);
      }
    }

    const responseData = await res.json();
    console.log('사용자 제보 성공:', responseData);
    return responseData as EventSubmissionResponse;
  } catch (error) {
    console.error('=== 네트워크/기타 에러 ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Request URL:', url);
    console.error('=============================');
    throw error;
  }
}
