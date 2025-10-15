import React, { useMemo, useState } from "react";
import {
  EventResponse,
  PaginationField,
  SortDirection,
  EventType,
} from "../api/types";

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
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const formatDate = (iso: string | null): string => {
    if (!iso) return "—";
    return iso.slice(0, 10);
  };

  const sortedItems = useMemo(() => {
    const toTime = (v: string | null): number =>
      v ? new Date(v).getTime() : 0;
    const now = Date.now();
    const filtered = items.filter((ev) => {
      if (filterApproved && !ev.isApproved) return false;
      if (!includeFinished) {
        const end = ev.endAt ? new Date(ev.endAt).getTime() : undefined;
        if (end && end < now) return false;
      }
      return true;
    });
    const keyOf = (ev: EventResponse): number => {
      switch (sortField) {
        case PaginationField.ID:
          return ev.id;
        case PaginationField.START_DATE:
          return toTime(ev.startAt);
        case PaginationField.RECRUITMENT_DEADLINE:
          return toTime(ev.recruitmentEndAt);
        case PaginationField.VIEW_COUNT:
          return ev.viewCount;
        case PaginationField.CREATED_AT:
        default:
          return ev.id;
      }
    };
    const dir = sortDirection === SortDirection.DESC ? -1 : 1;
    return [...filtered].sort((a, b) => (keyOf(a) - keyOf(b)) * dir);
  }, [items, sortField, sortDirection, filterApproved, includeFinished]);

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
        overflow: "hidden",
      }}
    >
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
            <th>ID</th>
            <th>썸네일</th>
            <th style={{ width: "40%" }}>제목</th>
            <th>주최ID</th>
            <th>유형</th>
            <th style={{ width: 60, textAlign: "center" }}>승인</th>
            <th>모집 시작</th>
            <th>모집 종료</th>
            <th>시작</th>
            <th>종료</th>
            <th>조회수</th>
            <th>링크</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={13}>데이터가 없습니다</td>
            </tr>
          ) : (
            sortedItems.map((ev) => (
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
                <td>{ev.title}</td>
                <td>{ev.host.id}</td>
                <td>{ev.eventType}</td>
                <td style={{ width: 60, textAlign: "center" }}>
                  {ev.isApproved ? "O" : "X"}
                </td>
                <td>{formatDate(ev.recruitmentStartAt)}</td>
                <td>{formatDate(ev.recruitmentEndAt)}</td>
                <td>{formatDate(ev.startAt)}</td>
                <td>{formatDate(ev.endAt)}</td>
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
