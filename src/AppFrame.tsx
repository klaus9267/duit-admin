import React, { useState } from "react";
import { PaginationField, SortDirection } from "./api/types";
import Sidebar from "./components/Sidebar";
import EventsPage from "./pages/EventsPage";
import HostsPage from "./pages/HostsPage";
import UsersPage from "./pages/UsersPage";

export default function AppFrame() {
  const [page, setPage] = useState<"events" | "hosts" | "users">("events");
  const [sortField, setSortField] = useState<PaginationField>(
    PaginationField.ID
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirection.ASC
  );

  const content = (() => {
    if (page === "hosts") return <HostsPage />;
    if (page === "users") return <UsersPage />;
    return <EventsPage sortField={sortField} sortDirection={sortDirection} />;
  })();

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <Sidebar current={page} onNav={setPage} />
      <section
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg)",
          }}
        >
          <div
            style={{ display: "flex", gap: 8, justifyContent: "space-between" }}
          >
            <div style={{ fontWeight: 700 }}>
              {page === "events"
                ? "행사 관리"
                : page === "hosts"
                ? "주최기관"
                : "사용자"}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                className="select"
                value={sortField}
                onChange={(e) =>
                  setSortField(e.target.value as PaginationField)
                }
              >
                <option value={PaginationField.ID}>기본</option>
                <option value={PaginationField.START_DATE}>시작일</option>
                <option value={PaginationField.RECRUITMENT_DEADLINE}>
                  모집 마감
                </option>
                <option value={PaginationField.VIEW_COUNT}>조회수</option>
                <option value={PaginationField.CREATED_AT}>등록일</option>
              </select>
              <select
                className="select"
                value={sortDirection}
                onChange={(e) =>
                  setSortDirection(e.target.value as SortDirection)
                }
              >
                <option value={SortDirection.ASC}>오름차순</option>
                <option value={SortDirection.DESC}>내림차순</option>
              </select>
              <input
                className="input"
                placeholder="검색"
                style={{ width: 280 }}
              />
              <button className="btn primary">추가</button>
            </div>
          </div>
        </header>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            padding: "8px 10px",
          }}
        >
          {content}
        </div>
      </section>
    </div>
  );
}
