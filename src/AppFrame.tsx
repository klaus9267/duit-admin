import React, { useState } from "react";
import { PaginationField, SortDirection } from "./api/types";
import Sidebar from "./components/Sidebar";
import EventsPage from "./pages/EventsPage";
import HostsPage from "./pages/HostsPage";

export default function AppFrame() {
  const [page, setPage] = useState<"events" | "hosts">("events");
  const [sortField, setSortField] = useState<PaginationField>(
    PaginationField.ID
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirection.ASC
  );
  const [filterApproved, setFilterApproved] = useState<boolean>(true);
  const [includeFinished, setIncludeFinished] = useState<boolean>(true);

  const content = (() => {
    if (page === "hosts") return <HostsPage />;
    return (
      <EventsPage
        sortField={sortField}
        sortDirection={sortDirection}
        filterApproved={filterApproved}
        includeFinished={includeFinished}
      />
    );
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
              {page === "events" ? "행사 관리" : "주최기관"}
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
                value={filterApproved ? "true" : "false"}
                onChange={(e) => setFilterApproved(e.target.value === "true")}
                style={{ width: 120 }}
              >
                <option value="true">승인만</option>
                <option value="false">전체</option>
              </select>
              <select
                className="select"
                value={includeFinished ? "true" : "false"}
                onChange={(e) => setIncludeFinished(e.target.value === "true")}
                style={{ width: 140 }}
              >
                <option value="true">종료 포함</option>
                <option value="false">종료 제외</option>
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
