import { API_BASE, checkAuthAndRedirect } from './eventsClient';
import { UserListParams, UserListResponse, PaginationField, SortDirection } from './types';

function toUserQuery(params: UserListParams): string {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.size !== undefined) search.set('size', String(params.size));
  if (params.sortDirection) search.set('sortDirection', params.sortDirection as SortDirection);
  if (params.field) search.set('field', params.field as PaginationField);
  const s = search.toString();
  return s ? `?${s}` : '';
}

export async function getUsers(params: UserListParams = {}, token?: string): Promise<UserListResponse> {
  const query = toUserQuery(params);
  const url = `${API_BASE}/api/v1/users${query}`;

  // 토큰 체크 및 리다이렉트
  const authToken = token || checkAuthAndRedirect();

  if (import.meta.env.DEV) {
    console.log('[getUsers] params:', params);
    console.log('[getUsers] url:', url);
  }

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/';
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    const text = await res.text();
    throw new Error(`Failed to fetch users: ${res.status} ${text}`);
  }

  return (await res.json()) as UserListResponse;
}


