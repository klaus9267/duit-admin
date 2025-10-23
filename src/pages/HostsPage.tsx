import React, { useEffect, useRef, useState } from "react";
import { getHosts } from "../api/hostsClient";
import { HostResponse, PaginationField, SortDirection } from "../api/types";

export default function HostsPage() {
  const [items, setItems] = useState<HostResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalElements, setTotalElements] = useState<number>(0);
  const observerRef = useRef<HTMLDivElement>(null);

  // 무한 스크롤을 위한 데이터 로딩
  const loadMore = async (pageNum: number, reset: boolean = false) => {
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
        setItems((prev) => [...prev, ...data.content]);
      }

      setTotalElements(data.pageInfo.totalElements);
      setHasMore(data.pageInfo.pageNumber < data.pageInfo.totalPages - 1);
    } catch (e: any) {
      setError(e?.message ?? "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadMore(0, true);
  }, []);

  // 무한 스크롤 옵저버
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
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
  }, [page, hasMore, loading]);
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

      {/* 전체 개수 표시 */}
      <div
        style={{
          padding: "8px 12px",
          background: "#f8f9fa",
          borderBottom: "1px solid var(--border)",
          fontSize: "14px",
          color: "#666",
        }}
      >
        총 {totalElements}개 주최기관
      </div>

      <table className="grid-table">
        <thead>
          <tr>
            <th style={{ width: 60 }}>ID</th>
            <th style={{ width: 60 }}>썸네일</th>
            <th style={{ width: 400 }}>기관명</th>
            <th style={{ width: 80 }}></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && !loading ? (
            <tr>
              <td colSpan={4}>데이터가 없습니다</td>
            </tr>
          ) : (
            items.map((h) => (
              <tr key={h.id}>
                <td>{h.id}</td>
                <td>
                  {h.thumbnail ? (
                    <img
                      src={h.thumbnail}
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
                    "—"
                  )}
                </td>
                <td>
                  <span className="truncate" title={h.name}>
                    {h.name}
                  </span>
                </td>
                <td>
                  <a href="#">편집</a>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 무한 스크롤 트리거 */}
      <div ref={observerRef} style={{ height: "20px", margin: "10px 0" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "10px" }}>로딩 중...</div>
        )}
        {!hasMore && items.length > 0 && (
          <div style={{ textAlign: "center", padding: "10px", color: "#666" }}>
            모든 데이터를 불러왔습니다
          </div>
        )}
      </div>
    </div>
  );
}
