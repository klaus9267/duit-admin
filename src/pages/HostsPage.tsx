import React, { useEffect, useState } from "react";
import { getHosts } from "../api/hostsClient";
import { HostResponse, PaginationField, SortDirection } from "../api/types";

export default function HostsPage() {
  const [items, setItems] = useState<HostResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getHosts({
          page: 0,
          size: 20,
          field: PaginationField.ID,
          sortDirection: SortDirection.DESC,
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
  }, []);
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {error ? (
        <div style={{ padding: 12, color: "#b91c1c" }}>오류: {error}</div>
      ) : null}
      <table className="grid-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>기관명</th>
            <th>썸네일</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4}>로딩 중…</td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={4}>데이터가 없습니다</td>
            </tr>
          ) : (
            items.map((h) => (
              <tr key={h.id}>
                <td>{h.id}</td>
                <td>{h.name}</td>
                <td>
                  {h.thumbnail ? (
                    <img
                      src={h.thumbnail}
                      alt=""
                      style={{ width: 40, height: 28, objectFit: "cover" }}
                    />
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <a href="#">편집</a>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
