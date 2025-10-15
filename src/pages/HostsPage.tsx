import React from "react";

export default function HostsPage() {
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
            <th>ID</th>
            <th>기관명</th>
            <th>썸네일</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>가나다 대학병원</td>
            <td>—</td>
            <td>
              <a href="#">편집</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}


