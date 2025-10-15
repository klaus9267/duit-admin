import React from "react";

export default function UsersPage() {
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
            <th>닉네임</th>
            <th>이메일</th>
            <th>푸시</th>
            <th>마케팅</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>수묵은 복숭아</td>
            <td>abcd1234@naver.com</td>
            <td>ON</td>
            <td>OFF</td>
            <td>
              <a href="#">보기</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}


