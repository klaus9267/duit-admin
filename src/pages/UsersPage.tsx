import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PaginationField, SortDirection, UserResponse } from '../api/types';
import { getUsers } from '../api/usersClient';

export default function UsersPage() {
  const [items, setItems] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState<number>(20);
  const [sortField, setSortField] = useState<PaginationField>(PaginationField.ID);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.DESC);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [nextPage, setNextPage] = useState<number | null>(1); // 백엔드 예시(pageNumber 1 기준)
  const loadingRef = useRef(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(
    async (reset: boolean = false) => {
      if (loadingRef.current) return;

      // reset 로드가 아니고 더 로드할 페이지가 없다면 중단
      if (!reset && (!hasMore || nextPage == null)) return;

      const pageToLoad = reset ? 1 : nextPage ?? 1;

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const data = await getUsers({
          page: pageToLoad,
          size,
          sortDirection,
          field: sortField,
        });

        setTotalElements(data.pageInfo.totalElements);
        setItems(prev => (reset ? data.content : [...prev, ...data.content]));

        const { pageNumber, totalPages } = data.pageInfo;
        const more = pageNumber < totalPages;
        setHasMore(more);
        setNextPage(more ? pageNumber + 1 : null);
      } catch (e: any) {
        setError(e?.message ?? '사용자 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [size, sortDirection, sortField, hasMore, nextPage]
  );

  // 정렬 / 페이지 크기 변경 시 목록 초기화
  useEffect(() => {
    setItems([]);
    setHasMore(true);
    setNextPage(1);
  }, [size, sortField, sortDirection]);

  // 초기 및 리셋 이후 첫 페이지 로드
  useEffect(() => {
    if (nextPage === 1 && items.length === 0 && hasMore && !loadingRef.current) {
      loadMore(true);
    }
  }, [nextPage, items.length, hasMore, loadMore]);

  // 무한 스크롤 옵저버
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadMore(false);
        }
      },
      {
        // 스크롤 컨테이너의 맨 아래까지 내려왔을 때만 트리거
        root: scrollContainerRef.current,
        threshold: 1.0,
        rootMargin: '0px',
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const formatBool = (value: boolean) => (value ? 'ON' : 'OFF');

  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'auto',
        maxHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
          background: '#f8f9fa',
          fontSize: 14,
          color: '#555',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <span>
          총 {totalElements}명 / 로드된 {items.length}명
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13, color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}>
            정렬
            <select
              className="select"
              value={sortField}
              onChange={e => {
                setSortField(e.target.value as PaginationField);
              }}
            >
              <option value={PaginationField.ID}>ID</option>
              <option value={PaginationField.NAME}>닉네임</option>
              <option value={PaginationField.CREATED_AT}>가입일</option>
            </select>
          </label>
          <label style={{ fontSize: 13, color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}>
            방향
            <select
              className="select"
              value={sortDirection}
              onChange={e => {
                setSortDirection(e.target.value as SortDirection);
              }}
            >
              <option value={SortDirection.DESC}>내림차순</option>
              <option value={SortDirection.ASC}>오름차순</option>
            </select>
          </label>
          <label style={{ fontSize: 13, color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}>
            페이지 크기
            <select
              className="select"
              value={size}
              onChange={e => {
                setSize(Number(e.target.value));
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, color: '#b91c1c', borderBottom: '1px solid var(--border)', fontSize: 13 }}>{error}</div>
      )}

      <div
        ref={scrollContainerRef}
        style={{ overflow: 'auto', flex: 1 }}
      >
        <table className="grid-table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>ID</th>
              <th style={{ width: 160 }}>이메일</th>
              <th style={{ width: 140 }}>닉네임</th>
              <th style={{ width: 140 }}>Provider ID</th>
              <th style={{ width: 80 }}>캘린더 자동추가</th>
              <th style={{ width: 60 }}>푸시</th>
              <th style={{ width: 80 }}>북마크 알림</th>
              <th style={{ width: 80 }}>캘린더 알림</th>
              <th style={{ width: 80 }}>마케팅</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading ? (
              <tr>
                <td colSpan={9}>사용자가 없습니다.</td>
              </tr>
            ) : (
              items.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td style={{ maxWidth: 220 }}>
                    <span className="truncate" title={user.email}>
                      {user.email}
                    </span>
                  </td>
                  <td style={{ maxWidth: 160 }}>
                    <span className="truncate" title={user.nickname}>
                      {user.nickname}
                    </span>
                  </td>
                  <td style={{ maxWidth: 200 }}>
                    <span className="truncate" title={user.providerId}>
                      {user.providerId}
                    </span>
                  </td>
                  <td>{formatBool(user.autoAddBookmarkToCalendar)}</td>
                  <td>{formatBool(user.alarmSettings.push)}</td>
                  <td>{formatBool(user.alarmSettings.bookmark)}</td>
                  <td>{formatBool(user.alarmSettings.calendar)}</td>
                  <td>{formatBool(user.alarmSettings.marketing)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* 무한 스크롤 트리거 */}
        <div ref={observerRef} style={{ height: 1 }} />
      </div>

      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              border: '2px solid #f3f3f3',
              borderTop: '2px solid var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}
    </div>
  );
}

