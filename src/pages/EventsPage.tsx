import React, { useEffect, useMemo, useState } from "react";
import {
  EventResponse,
  PaginationField,
  SortDirection,
  EventType,
} from "../api/types";
import { getEvents } from "../api/eventsClient";

const MOCK_EVENTS: EventResponse[] = [
  {
    id: 1,
    title: "행사 제목 예시",
    startAt: "2025-05-01T00:00:00",
    endAt: "2025-05-03T00:00:00",
    recruitmentStartAt: "2025-04-10T00:00:00",
    recruitmentEndAt: "2025-04-25T00:00:00",
    uri: "#",
    thumbnail: null,
    isApproved: true,
    eventType: EventType.CONFERENCE,
    host: { id: 1, name: "가나다 대학병원", thumbnail: null },
    viewCount: 123,
    isBookmarked: false,
  },
  {
    id: 2,
    title: "간호 세미나 A",
    startAt: "2025-06-25T00:00:00",
    endAt: "2025-06-26T00:00:00",
    recruitmentStartAt: "2025-06-12T00:00:00",
    recruitmentEndAt: "2025-06-20T00:00:00",
    uri: "#",
    thumbnail: null,
    isApproved: true,
    eventType: EventType.SEMINAR,
    host: { id: 2, name: "초록 병원", thumbnail: null },
    viewCount: 87,
    isBookmarked: false,
  },
  {
    id: 3,
    title: "워크숍 B",
    startAt: "2025-07-10T00:00:00",
    endAt: "2025-07-11T00:00:00",
    recruitmentStartAt: "2025-07-01T00:00:00",
    recruitmentEndAt: "2025-07-05T00:00:00",
    uri: "#",
    thumbnail: null,
    isApproved: true,
    eventType: EventType.WORKSHOP,
    host: { id: 3, name: "파란 연구소", thumbnail: null },
    viewCount: 45,
    isBookmarked: false,
  },
  {
    id: 4,
    title: "웨비나 C",
    startAt: "2025-08-15T00:00:00",
    endAt: "2025-08-15T00:00:00",
    recruitmentStartAt: "2025-08-03T00:00:00",
    recruitmentEndAt: "2025-08-08T00:00:00",
    uri: "#",
    thumbnail: null,
    isApproved: true,
    eventType: EventType.WEBINAR,
    host: { id: 4, name: "단국대학교 IT 대학", thumbnail: null },
    viewCount: 210,
    isBookmarked: false,
  },
];

type Props = {
  sortField: PaginationField;
  sortDirection: SortDirection;
  filterApproved: boolean;
  includeFinished: boolean;
};

export default function EventsPage({
  sortField,
  sortDirection,
  filterApproved,
  includeFinished,
}: Props) {
  const [items, setItems] = useState<EventResponse[]>(MOCK_EVENTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const formatDateTime = (iso: string | null): string => {
    if (!iso) return "—";
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mm}`;
  };

  // 서버에서 받아온 데이터를 그대로 출력 (정렬/필터링 제거)

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getEvents({
          page: 0,
          size: 20,
          field: sortField,
          sortDirection,
          isApproved: filterApproved,
          includeFinished,
        });
        if (!cancelled) setItems(data.content);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "오류가 발생했습니다");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [sortField, sortDirection, filterApproved, includeFinished]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onDeleteSelected = () => {
    if (selected.size === 0) return;
    setItems((prev) => prev.filter((ev) => !selected.has(ev.id)));
    setSelected(new Set());
  };

  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        overflow: "auto",
      }}
    >
      {error ? (
        <div style={{ padding: 12, color: "#b91c1c" }}>오류: {error}</div>
      ) : null}
      <table className="grid-table">
        <thead>
          <tr>
            <th style={{ width: 44, textAlign: "center" }}>
              <button
                className={selected.size > 0 ? "btn primary" : "btn"}
                onClick={onDeleteSelected}
                disabled={selected.size === 0}
              >
                삭제
              </button>
            </th>
            <th style={{ width: 28 }}>ID</th>
            <th style={{ width: 60 }}>썸네일</th>
            <th style={{ width: 360 }}>제목</th>
            <th style={{ width: 36 }}>주최ID</th>
            <th style={{ width: 120 }}>유형</th>
            <th style={{ width: 60, textAlign: "center" }}>승인</th>
            <th style={{ width: 140 }}>모집 시작</th>
            <th style={{ width: 140 }}>모집 종료</th>
            <th style={{ width: 140 }}>시작</th>
            <th style={{ width: 140 }}>종료</th>
            <th style={{ width: 80 }}>조회수</th>
            <th style={{ width: 72 }}>링크</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={13}>로딩 중…</td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={13}>데이터가 없습니다</td>
            </tr>
          ) : (
            items.map((ev) => (
              <tr key={ev.id}>
                <td style={{ width: 44, textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={selected.has(ev.id)}
                    onChange={() => toggleSelect(ev.id)}
                  />
                </td>
                <td>{ev.id}</td>
                <td>
                  {ev.thumbnail ? (
                    <img
                      src={ev.thumbnail}
                      alt=""
                      style={{
                        width: 40,
                        height: 28,
                        objectFit: "cover",
                        border: "1px solid #ddd",
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 40,
                        height: 28,
                        background: "#eee",
                        border: "1px solid #ddd",
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
                        return "컨퍼런스/학술대회";
                      case EventType.SEMINAR:
                        return "세미나";
                      case EventType.WEBINAR:
                        return "웨비나";
                      case EventType.WORKSHOP:
                        return "워크숍";
                      case EventType.CONTEST:
                        return "공모전";
                      case EventType.CONTINUING_EDUCATION:
                        return "보수교육";
                      case EventType.EDUCATION:
                        return "교육";
                      default:
                        return "기타";
                    }
                  })()}
                </td>
                <td style={{ width: 60, textAlign: "center" }}>
                  {ev.isApproved ? "O" : "X"}
                </td>
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
