import React, { useState, useEffect } from "react";
import { PaginationField, SortDirection } from "./api/types";
import EventsPage from "./pages/EventsPage";
import HostsPage from "./pages/HostsPage";
import CreateEventModal from "./components/CreateEventModal";
import LoginPage from "./components/LoginPage";
import { createEvent } from "./api/eventsClient";
import {
  login,
  logout,
  getStoredToken,
  setStoredToken,
  validateToken,
} from "./api/authClient";

export default function AppFrame() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<"events" | "hosts">("events");
  const [sortField, setSortField] = useState<PaginationField>(
    PaginationField.ID
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirection.DESC
  );
  const [filterApproved, setFilterApproved] = useState<boolean>(true);
  const [includeFinished, setIncludeFinished] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // 로그인 상태 확인 및 토큰 검증
  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // 토큰이 있으면 서버에서 유효성 검증
      try {
        const isValid = await validateToken();
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error("토큰 검증 중 오류:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 페이지 이동 시 토큰 검증
  const handlePageChange = async (newPage: "events" | "hosts") => {
    if (isAuthenticated) {
      // 인증된 상태에서 페이지 이동 시 토큰 재검증
      try {
        const isValid = await validateToken();
        if (!isValid) {
          setIsAuthenticated(false);
          return;
        }
      } catch (error) {
        console.error("페이지 이동 시 토큰 검증 실패:", error);
        setIsAuthenticated(false);
        return;
      }
    }
    setPage(newPage);
  };

  // 로그인 처리
  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await login({
        adminId: username,
        password: password,
      });

      setStoredToken(response.accessToken);
      setIsAuthenticated(true);
    } catch (error: any) {
      throw new Error(error.message || "로그인에 실패했습니다.");
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
  };

  // 로딩 중이면 로딩 화면 표시
  if (isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid var(--primary)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <div style={{ color: "#666", fontSize: "14px" }}>로딩 중...</div>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우 로그인 페이지 표시
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

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
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
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
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "18px" }}>
                Du it! Admin
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handlePageChange("events")}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    background: page === "events" ? "var(--primary)" : "white",
                    color: page === "events" ? "white" : "var(--text)",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  행사 관리
                </button>
                <button
                  onClick={() => handlePageChange("hosts")}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    background: page === "hosts" ? "var(--primary)" : "white",
                    color: page === "hosts" ? "white" : "var(--text)",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  주최기관
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {page === "events" && (
                <>
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
                    onChange={(e) =>
                      setFilterApproved(e.target.value === "true")
                    }
                    style={{ width: 120 }}
                  >
                    <option value="true">승인</option>
                    <option value="false">미승인</option>
                  </select>
                  <select
                    className="select"
                    value={includeFinished ? "true" : "false"}
                    onChange={(e) =>
                      setIncludeFinished(e.target.value === "true")
                    }
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
                  <button
                    className="btn primary"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    추가
                  </button>
                </>
              )}
              <button
                className="btn"
                onClick={handleLogout}
                style={{
                  background: "#dc2626",
                  borderColor: "#dc2626",
                  color: "white",
                }}
              >
                로그아웃
              </button>
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

      {/* 행사 생성 모달 */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (eventFormData) => {
          try {
            console.log("=== 행사 생성 시작 ===");
            console.log("FormData 전송 시작...");

            const result = await createEvent(eventFormData);
            console.log("행사 생성 성공:", result);

            alert("행사가 성공적으로 생성되었습니다!");
            setIsCreateModalOpen(false);
            // 페이지 새로고침 또는 데이터 다시 로드
            window.location.reload();
          } catch (error: any) {
            console.error("=== 행사 생성 실패 ===");
            console.error("Error type:", error.constructor.name);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
            console.error("========================");

            alert(`행사 생성 실패: ${error.message}`);
          }
        }}
      />
    </div>
  );
}
