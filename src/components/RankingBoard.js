// src/components/RankingBoard.js
import React, { useEffect, useState } from "react";

const RANKING_API = "/api/ranking"; // 프록시 경로로 변경!

export default function RankingBoard({ open, onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch(RANKING_API)
        .then((res) => res.json())
        .then((data) => {
          setList(data.data || []);
          setLoading(false);
        });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9001,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.33)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          minWidth: 350,
          maxWidth: 400,
          maxHeight: 520,
          borderRadius: 16,
          boxShadow: "0 10px 40px #1232",
          padding: 24,
          position: "relative",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: 18,
            top: 14,
            background: "none",
            border: "none",
            fontSize: 22,
            color: "#89a",
            cursor: "pointer",
          }}
        >
          ×
        </button>
        <h2
          style={{
            textAlign: "center",
            marginBottom: 18,
            fontWeight: 700,
            fontSize: 21,
          }}
        >
          🏆 실시간 랭킹 보드
        </h2>
        {loading ? (
          <div style={{ textAlign: "center", color: "#888", marginTop: 30 }}>
            로딩 중...
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #eee" }}>
                <th style={{ textAlign: "center", fontWeight: 600 }}>순위</th>
                <th style={{ textAlign: "left", fontWeight: 600 }}>이름</th>
                <th style={{ textAlign: "left", fontWeight: 600 }}>회사</th>
                <th style={{ textAlign: "center", fontWeight: 600 }}>
                  시간(초)
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => (
                <tr
                  key={r.timestamp + r.employeeId}
                  style={{ borderBottom: "1px solid #f2f2f2" }}
                >
                  <td
                    style={{
                      textAlign: "center",
                      color: i < 3 ? "#FFD700" : "#222",
                      fontWeight: i < 3 ? 700 : 500,
                      fontSize: i === 0 ? 17 : 15,
                    }}
                  >
                    {i + 1}
                  </td>
                  <td
                    style={{
                      fontWeight: 600,
                      color: "#277",
                      fontSize: 15,
                    }}
                  >
                    {r.name}
                  </td>
                  <td style={{ color: "#488", fontSize: 13 }}>{r.company}</td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>
                    {r.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
