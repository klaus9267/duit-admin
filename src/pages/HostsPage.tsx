import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getHosts, deleteHost } from '../api/hostsClient';
import { HostResponse, PaginationField, SortDirection } from '../api/types';

// 이미지 URL을 절대 경로로 변환하는 함수
function getImageUrl(thumbnail: string | null): string | null {
  if (!thumbnail) return null;

  // 이미 절대 URL인 경우 그대로 반환
  if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
    return thumbnail;
  }

  // 상대 경로인 경우 API_BASE와 결합
  const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'https://klaus9267.duckdns.org');

  // 상대 경로가 /로 시작하지 않으면 / 추가
  const normalizedPath = thumbnail.startsWith('/') ? thumbnail : `/${thumbnail}`;

  return `${API_BASE}${normalizedPath}`;
}

export default function HostsPage() {
  const [items, setItems] = useState<HostResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalElements, setTotalElements] = useState<number>(0);
  const observerRef = useRef<HTMLDivElement>(null);

  // 무한 스크롤을 위한 데이터 로딩
  const loadMore = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      if (loading) return;

      setLoading(true);
      setError(null);
      try {
        const data = await getHosts({
          page: pageNum,
          size: 20,
          field: PaginationField.ID,
          sortDirection: SortDirection.DESC,
        });

        if (reset) {
          setItems(data.content);
        } else {
          // 중복 제거를 위해 ID 기준으로 필터링
          setItems(prev => {
            const existingIds = new Set(prev.map(item => item.id));
            const newItems = data.content.filter(item => !existingIds.has(item.id));
            return [...prev, ...newItems];
          });
        }

        setTotalElements(data.pageInfo.totalElements);
        setHasMore(data.pageInfo.pageNumber < data.pageInfo.totalPages - 1);
      } catch (e: any) {
        setError(e?.message ?? '오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  // 초기 로드
  useEffect(() => {
    loadMore(0, true);
  }, []);

  // 무한 스크롤 옵저버
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadMore(nextPage, false);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, page, loadMore]);

  // 체크박스 토글
  const toggleSelect = (hostId: number) => {
    setSelected(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hostId)) {
        newSet.delete(hostId);
      } else {
        newSet.add(hostId);
      }
      return newSet;
    });
  };

  // 선택된 주최기관들 삭제
  const onDeleteSelected = async () => {
    if (selected.size === 0) return;

    if (!confirm(`선택된 ${selected.size}개의 주최기관을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      // 선택된 각 주최기관을 서버에서 삭제
      const deletePromises = Array.from(selected).map(hostId => deleteHost(hostId));

      await Promise.all(deletePromises);

      // 성공 시 로컬 상태에서도 제거
      setItems(prev => prev.filter(h => !selected.has(h.id)));
      setSelected(new Set());

      alert('선택된 주최기관이 성공적으로 삭제되었습니다.');
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`);
    }
  };

  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'auto',
        maxHeight: 'calc(100vh - 120px)', // 더 많은 공간 활용
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        padding: 0,
      }}
    >
      {error ? <div style={{ padding: 12, color: '#b91c1c' }}>오류: {error}</div> : null}

      {/* 전체 개수 표시 */}
      <div
        style={{
          padding: '8px 12px',
          background: '#f8f9fa',
          borderBottom: '1px solid var(--border)',
          fontSize: '14px',
          color: '#666',
        }}
      >
        총 {totalElements}개 주최기관
      </div>

      <div style={{ overflow: 'auto', flex: 1, position: 'relative' }}>
        <table className="grid-table">
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f6f8fb' }}>
            <tr>
              <th style={{ width: 32, textAlign: 'center' }}>
                <button className={selected.size > 0 ? 'btn primary' : 'btn'} onClick={onDeleteSelected} disabled={selected.size === 0}>
                  삭제
                </button>
              </th>
              <th style={{ width: 20 }}>ID</th>
              <th style={{ width: 40 }}>썸네일</th>
              <th style={{ width: 300 }}>기관명</th>
              <th style={{ width: 60 }}>편집</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                  데이터가 없습니다
                </td>
              </tr>
            ) : (
              items.map(h => (
                <tr key={h.id}>
                  <td style={{ width: 32, textAlign: 'center' }}>
                    <input type="checkbox" checked={selected.has(h.id)} onChange={() => toggleSelect(h.id)} />
                  </td>
                  <td>{h.id}</td>
                  <td>
                    {h.thumbnail ? (
                      <img
                        src={getImageUrl(h.thumbnail) || h.thumbnail}
                        alt=""
                        style={{
                          width: 32,
                          height: 24,
                          objectFit: 'cover',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                        }}
                        onError={e => {
                          console.error('주최기관 이미지 로딩 실패:', h.thumbnail);
                          console.error('이미지 URL:', h.thumbnail);
                          console.error('현재 도메인:', window.location.origin);
                          try {
                            console.error('이미지 도메인:', new URL(h.thumbnail).origin);
                          } catch (urlError) {
                            console.error('URL 파싱 실패:', urlError);
                          }

                          // 이미지 로딩 실패 시 빈 div로 대체
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallbackDiv = document.createElement('div');
                            fallbackDiv.style.cssText = `
                            width: 32px;
                            height: 24px;
                            background: #f0f0f0;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 10px;
                            color: #999;
                          `;
                            fallbackDiv.textContent = 'X';
                            parent.appendChild(fallbackDiv);
                          }
                        }}
                        onLoad={() => {
                          console.log('주최기관 이미지 로딩 성공:', h.thumbnail);
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 32,
                          height: 24,
                          background: '#eee',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                        }}
                      />
                    )}
                  </td>
                  <td>
                    <span className="truncate" title={h.name}>
                      {h.name}
                    </span>
                  </td>
                  <td>
                    <button className="btn small">편집</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 무한 스크롤 트리거 - 보이지 않는 트리거 */}
      <div ref={observerRef} style={{ height: '1px', margin: 0, flexShrink: 0 }} />
    </div>
  );
}
