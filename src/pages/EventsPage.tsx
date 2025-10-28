import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EventResponse, PaginationField, SortDirection, EventType } from '../api/types';
import { getEvents, deleteEvent } from '../api/eventsClient';

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

const MOCK_EVENTS: EventResponse[] = [
  {
    id: 1,
    title: '행사 제목 예시',
    startAt: '2025-05-01T00:00:00',
    endAt: '2025-05-03T00:00:00',
    recruitmentStartAt: '2025-04-10T00:00:00',
    recruitmentEndAt: '2025-04-25T00:00:00',
    uri: '#',
    thumbnail: null,
    isApproved: true,
    eventType: EventType.CONFERENCE,
    host: { id: 1, name: '가나다 대학병원', thumbnail: null },
    viewCount: 123,
    isBookmarked: false,
  },
  {
    id: 2,
    title: '간호 세미나 A',
    startAt: '2025-06-25T00:00:00',
    endAt: '2025-06-26T00:00:00',
    recruitmentStartAt: '2025-06-12T00:00:00',
    recruitmentEndAt: '2025-06-20T00:00:00',
    uri: '#',
    thumbnail: null,
    isApproved: true,
    eventType: EventType.SEMINAR,
    host: { id: 2, name: '초록 병원', thumbnail: null },
    viewCount: 87,
    isBookmarked: false,
  },
  {
    id: 3,
    title: '워크숍 B',
    startAt: '2025-07-10T00:00:00',
    endAt: '2025-07-11T00:00:00',
    recruitmentStartAt: '2025-07-01T00:00:00',
    recruitmentEndAt: '2025-07-05T00:00:00',
    uri: '#',
    thumbnail: null,
    isApproved: true,
    eventType: EventType.WORKSHOP,
    host: { id: 3, name: '파란 연구소', thumbnail: null },
    viewCount: 45,
    isBookmarked: false,
  },
  {
    id: 4,
    title: '웨비나 C',
    startAt: '2025-08-15T00:00:00',
    endAt: '2025-08-15T00:00:00',
    recruitmentStartAt: '2025-08-03T00:00:00',
    recruitmentEndAt: '2025-08-08T00:00:00',
    uri: '#',
    thumbnail: null,
    isApproved: true,
    eventType: EventType.WEBINAR,
    host: { id: 4, name: '단국대학교 IT 대학', thumbnail: null },
    viewCount: 210,
    isBookmarked: false,
  },
];

type Props = {
  sortField: PaginationField;
  sortDirection: SortDirection;
  filterApproved: boolean;
  includeFinished: boolean;
  onEditEvent?: (event: EventResponse) => void;
};

export default function EventsPage({ sortField, sortDirection, filterApproved, includeFinished, onEditEvent }: Props) {
  const [items, setItems] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set()); // 로드된 페이지 추적
  const observerRef = useRef<HTMLDivElement>(null);
  const formatDateTime = (iso: string | null): string => {
    if (!iso) return '—';
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day} ${hh}:${mm}`;
  };

  // 무한 스크롤을 위한 데이터 로딩
  const loadMore = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      if (loading || loadedPages.has(pageNum)) return; // 이미 로드된 페이지는 건너뛰기

      setLoading(true);
      setError(null);
      try {
        const data = await getEvents({
          page: pageNum,
          size: 20,
          field: sortField,
          sortDirection,
          isApproved: filterApproved,
          includeFinished,
        });

        if (reset) {
          setItems(data.content);
          setLoadedPages(new Set([pageNum]));
        } else {
          // 중복 제거를 위해 ID 기준으로 필터링
          setItems(prev => {
            const existingIds = new Set(prev.map(item => item.id));
            const newItems = data.content.filter(item => !existingIds.has(item.id));
            return [...prev, ...newItems];
          });
          setLoadedPages(prev => new Set([...prev, pageNum]));
        }

        setTotalElements(data.pageInfo.totalElements);
        setHasMore(data.pageInfo.pageNumber < data.pageInfo.totalPages - 1);
      } catch (e: any) {
        setError(e?.message ?? '오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    },
    [loading, sortField, sortDirection, filterApproved, includeFinished] // loadedPages 제거
  );

  // 필터 변경 시 초기화
  useEffect(() => {
    setPage(0);
    setItems([]);
    setHasMore(true);
    setLoadedPages(new Set()); // 로드된 페이지 초기화
    loadMore(0, true);
  }, [sortField, sortDirection, filterApproved, includeFinished]);

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
      { threshold: 1.0, rootMargin: '0px 0px 100px 0px' } // 스크롤 끝에서 100px 전에 트리거
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]); // page와 loadMore 제거

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onDeleteSelected = async () => {
    if (selected.size === 0) return;

    if (!confirm(`선택된 ${selected.size}개의 행사를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      // 선택된 각 행사를 서버에서 삭제
      const deletePromises = Array.from(selected).map(eventId => deleteEvent(eventId));

      await Promise.all(deletePromises);

      // 성공 시 로컬 상태에서도 제거
      setItems(prev => prev.filter(ev => !selected.has(ev.id)));
      setSelected(new Set());

      alert('선택된 행사가 성공적으로 삭제되었습니다.');
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
        총 {totalElements}개 행사
      </div>

      <div style={{ overflow: 'auto', flex: 1, position: 'relative' }}>
        <table className="grid-table">
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f6f8fb' }}>
            <tr>
              <th style={{ width: 44, textAlign: 'center' }}>
                <button className={selected.size > 0 ? 'btn primary' : 'btn'} onClick={onDeleteSelected} disabled={selected.size === 0}>
                  삭제
                </button>
              </th>
              <th style={{ width: 28 }}>ID</th>
              <th style={{ width: 60 }}>썸네일</th>
              <th style={{ width: 360 }}>제목</th>
              <th style={{ width: 36 }}>주최ID</th>
              <th style={{ width: 120 }}>유형</th>
              <th style={{ width: 60, textAlign: 'center' }}>승인</th>
              <th style={{ width: 140 }}>모집 시작</th>
              <th style={{ width: 140 }}>모집 종료</th>
              <th style={{ width: 140 }}>시작</th>
              <th style={{ width: 140 }}>종료</th>
              <th style={{ width: 80 }}>조회수</th>
              <th style={{ width: 72 }}>링크</th>
              <th style={{ width: 60, textAlign: 'center' }}>수정</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading ? (
              <tr>
                <td colSpan={13}>데이터가 없습니다</td>
              </tr>
            ) : (
              items.map(ev => (
                <tr key={ev.id}>
                  <td style={{ width: 44, textAlign: 'center' }}>
                    <input type="checkbox" checked={selected.has(ev.id)} onChange={() => toggleSelect(ev.id)} />
                  </td>
                  <td>{ev.id}</td>
                  <td>
                    {ev.thumbnail ? (
                      <img
                        src={getImageUrl(ev.thumbnail) || ev.thumbnail}
                        alt=""
                        style={{
                          width: 40,
                          height: 28,
                          objectFit: 'cover',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                        }}
                        onError={e => {
                          console.error('이미지 로딩 실패:', ev.thumbnail);
                          console.error('이미지 URL:', ev.thumbnail);
                          console.error('현재 도메인:', window.location.origin);
                          try {
                            console.error('이미지 도메인:', new URL(ev.thumbnail).origin);
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
                            width: 40px;
                            height: 28px;
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
                          console.log('이미지 로딩 성공:', ev.thumbnail);
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 28,
                          background: '#eee',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                        }}
                      />
                    )}
                  </td>
                  <td>
                    <span className="truncate" title={ev.title}>
                      {ev.title}
                    </span>
                  </td>
                  <td>{ev.host.id}</td>
                  <td>
                    {((): string => {
                      switch (ev.eventType) {
                        case EventType.CONFERENCE:
                          return '컨퍼런스/학술대회';
                        case EventType.SEMINAR:
                          return '세미나';
                        case EventType.WEBINAR:
                          return '웨비나';
                        case EventType.WORKSHOP:
                          return '워크숍';
                        case EventType.CONTEST:
                          return '공모전';
                        case EventType.CONTINUING_EDUCATION:
                          return '보수교육';
                        case EventType.EDUCATION:
                          return '교육';
                        default:
                          return '기타';
                      }
                    })()}
                  </td>
                  <td style={{ width: 60, textAlign: 'center' }}>{ev.isApproved ? 'O' : 'X'}</td>
                  <td>{formatDateTime(ev.recruitmentStartAt)}</td>
                  <td>{formatDateTime(ev.recruitmentEndAt)}</td>
                  <td>{formatDateTime(ev.startAt)}</td>
                  <td>{formatDateTime(ev.endAt)}</td>
                  <td>{ev.viewCount}</td>
                  <td>
                    <a href={ev.uri} target="_blank" rel="noreferrer">
                      열기
                    </a>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => onEditEvent?.(ev)}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid var(--primary)',
                        borderRadius: 4,
                        background: 'white',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      수정
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 무한 스크롤 트리거 - 테이블 맨 아래에 위치 */}
        <div ref={observerRef} style={{ height: '1px', margin: 0 }} />
      </div>

      {/* 로딩 스피너 */}
      {loading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
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
