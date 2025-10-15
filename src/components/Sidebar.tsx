import React from "react";

type Props = {
  current: string;
  onNav: (key: "events" | "hosts" | "users") => void;
};

export default function Sidebar({ current, onNav }: Props) {
  const Item = ({
    k,
    label,
  }: {
    k: "events" | "hosts" | "users";
    label: string;
  }) => (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onNav(k);
      }}
      style={{
        color: "#cfcfcf",
        textDecoration: "none",
        padding: "10px 12px",
        borderRadius: 8,
        background: current === k ? "var(--primary)" : "transparent",
      }}
    >
      {label}
    </a>
  );

  return (
    <aside
      style={{
        width: 248,
        background: "#111",
        color: "#fff",
        padding: "20px 16px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 16 }}>Du it! Admin</div>
      <nav style={{ display: "grid", gap: 8 }}>
        <Item k="events" label="행사 관리" />
        <Item k="hosts" label="주최기관" />
        <Item k="users" label="사용자" />
      </nav>
    </aside>
  );
}


