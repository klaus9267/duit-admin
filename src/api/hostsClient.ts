import { HostListParams, HostListResponse, HostResponse } from './types';
import { API_BASE } from './eventsClient';

// 토큰이 없으면 로그인 페이지로 리다이렉트하는 함수
function checkAuthAndRedirect() {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    window.location.href = '/';
    throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
  }
  return token;
}

function toQuery(params: HostListParams): string {
  const s = new URLSearchParams();
  if (params.page !== undefined) s.set('page', String(params.page));
  if (params.size !== undefined) s.set('size', String(params.size));
  if (params.sortDirection) s.set('sortDirection', params.sortDirection);
  if (params.field) s.set('field', params.field);
  const q = s.toString();
  return q ? `?${q}` : '';
}

export async function getHosts(params: HostListParams, token?: string): Promise<HostListResponse> {
  const url = `${API_BASE}/api/v1/hosts${toQuery(params)}`;

  // 토큰 체크 및 리다이렉트
  const authToken = token || checkAuthAndRedirect();

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    credentials: 'include',
  });
  if (!res.ok) {
    if (res.status === 401) {
      // 인증 실패 시 로그인 페이지로 리다이렉트
      localStorage.removeItem('admin_token');
      window.location.href = '/';
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    const text = await res.text();
    throw new Error(`Failed to fetch hosts: ${res.status} ${text}`);
  }
  return (await res.json()) as HostListResponse;
}

// 모든 주최기관 목록 조회 (페이지네이션 없이)
export async function getAllHosts(token?: string): Promise<HostResponse[]> {
  const url = `${API_BASE}/api/v1/hosts?size=1000`; // 큰 사이즈로 모든 데이터 가져오기

  // 토큰 체크 및 리다이렉트
  const authToken = token || checkAuthAndRedirect();

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    credentials: 'include',
  });
  if (!res.ok) {
    if (res.status === 401) {
      // 인증 실패 시 로그인 페이지로 리다이렉트
      localStorage.removeItem('admin_token');
      window.location.href = '/';
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    const text = await res.text();
    throw new Error(`Failed to fetch all hosts: ${res.status} ${text}`);
  }
  const response = (await res.json()) as HostListResponse;
  return response.content;
}

// 주최기관 삭제
export async function deleteHost(hostId: number, token?: string): Promise<void> {
  const url = `${API_BASE}/api/v1/hosts/${hostId}`;

  // 토큰 체크 및 리다이렉트
  const authToken = token || checkAuthAndRedirect();

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      // 인증 실패 시 로그인 페이지로 리다이렉트
      localStorage.removeItem('admin_token');
      window.location.href = '/';
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    const text = await res.text();
    throw new Error(`Failed to delete host: ${res.status} ${text}`);
  }
}

// 주최기관 생성 (multipart/form-data)
export async function createHost(formData: FormData, token?: string): Promise<HostResponse> {
  const url = `${API_BASE}/api/v1/hosts`;

  // 토큰 체크 및 리다이렉트
  const authToken = token || checkAuthAndRedirect();

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/';
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    const text = await res.text();
    throw new Error(`Failed to create host: ${res.status} ${text}`);
  }

  return (await res.json()) as HostResponse;
}
