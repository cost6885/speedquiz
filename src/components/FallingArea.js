// src/components/FallingArea.js
import React, { useEffect, useRef, useState } from "react";

// 도형목록: 네모, 동그라미, 세모(색상도 랜덤)
const SHAPES = [
  { type: "block", shape: "■", color: "#0af" },
  { type: "block", shape: "▲", color: "#e44" },
  { type: "block", shape: "●", color: "#3c6" },
  { type: "block", shape: "◆", color: "#ffb800" },
];

// 2~3개 생성, 이 중 반드시 1개는 type: "word"
function getInitialObjects(word) {
  const count = Math.floor(Math.random() * 2) + 2; // 2~3개
  const objArr = [];
  // 도형 랜덤추가
  for (let i = 0; i < count - 1; i++) {
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    objArr.push({
      id: "block" + Math.random(),
      type: "block",
      content: s.shape,
      color: s.color,
      x: Math.random() * 78 + 4, // x 4~82%
      y: -12,
      fadeOut: false,
    });
  }
  // 정답 단어 1개 랜덤 위치에 삽입
  objArr.splice(Math.floor(Math.random() * count), 0, {
    id: "word" + Math.random(),
    type: "word",
    content: word,
    color: "#444",
    x: Math.random() * 68 + 12, // 더 넓게 분포
    y: -12,
    fadeOut: false,
  });
  return objArr;
}

export default function FallingArea({ word, roundKey }) {
  const [objects, setObjects] = useState([]);

  // 라운드 바뀔 때마다 객체 초기화
  useEffect(() => {
    setObjects(getInitialObjects(word));
  }, [roundKey, word]);

  // 애니메이션(아래로)
  useEffect(() => {
    let raf;
    function step() {
      setObjects((prev) =>
        prev.map((obj) =>
          obj.fadeOut ? obj : { ...obj, y: obj.y + 3.3 + Math.random() * 1.1 }
        )
      );
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // 바닥 닿으면 페이드아웃
  useEffect(() => {
    setObjects((prev) =>
      prev.map((obj) =>
        !obj.fadeOut && obj.y > 80 ? { ...obj, fadeOut: true } : obj
      )
    );
    // 0.7초 후에 fadeout 제거
    const t = setTimeout(() => {
      setObjects((prev) => prev.filter((obj) => !obj.fadeOut));
    }, 800);
    return () => clearTimeout(t);
  }, [objects]);

  // 랜더링
  return (
    <div className="falling-area">
      {objects.map((obj) => (
        <div
          key={obj.id}
          className={`falling-obj ${obj.type} ${obj.fadeOut ? "fadeout" : ""}`}
          style={{
            left: `${obj.x}%`,
            top: `${obj.y}%`,
            color: obj.type === "word" ? "#123" : obj.color,
            opacity: obj.type === "word" ? 0.72 : 0.45,
            fontSize: obj.type === "word" ? "2.1rem" : "2.2rem",
            fontWeight: obj.type === "word" ? 800 : 700,
            transition: obj.fadeOut ? "opacity 0.7s" : "none",
            position: "absolute",
            pointerEvents: "none",
            filter: obj.type === "word" ? "blur(0.3px)" : undefined,
            textShadow: obj.type === "word" ? "0 2px 10px #0af3" : undefined,
            fontFamily: "'Pretendard','SUIT',sans-serif",
          }}
        >
          {obj.content}
        </div>
      ))}
    </div>
  );
}
