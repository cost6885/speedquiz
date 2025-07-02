import React, { useEffect, useState } from "react";

// 도형 + 컬러
const SHAPES = [
  { shape: "■", color: "#0af" },
  { shape: "▲", color: "#e44" },
  { shape: "●", color: "#3c6" },
  { shape: "◆", color: "#ffb800" },
];

// id, type, content, x, y, speed, angle, fadeOut, fadeStartTime
function makeDrop(answerWord, allowAnswer) {
  const isAnswer = allowAnswer && !!answerWord && Math.random() < 0.4; // 40%확률
  if (isAnswer) {
    return {
      id: "w" + Math.random(),
      type: "word",
      content: answerWord,
      color: "#222",
      x: Math.random() * 90 + 2,
      y: -12,
      angle: (Math.random() - 0.5) * 60,
      speed: Math.random() * 1.8 + 1.1,
      fadeOut: false,
      fadeStartTime: null,
    };
  } else {
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
      id: "b" + Math.random(),
      type: "block",
      content: s.shape,
      color: s.color,
      x: Math.random() * 92 + 2,
      y: -10,
      angle: (Math.random() - 0.5) * 80,
      speed: Math.random() * 2.1 + 1.1,
      fadeOut: false,
      fadeStartTime: null,
    };
  }
}

export default function FallingBgLayer({ answerWord, round }) {
  const [drops, setDrops] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());

  // 문제(라운드) 바뀔 때마다 리셋
  useEffect(() => {
    setStartTime(Date.now());
    setDrops([]);
  }, [round, answerWord]);

  // 1초마다 도형/정답 무작위 추가
  useEffect(() => {
    const intv = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const allowAnswer = elapsed >= 10000;
      setDrops((prev) => [...prev, makeDrop(answerWord, allowAnswer)]);
    }, 1000);
    return () => clearInterval(intv);
  }, [answerWord, startTime]);

  // 애니메이션: y값 증가, fadeOut처리, 삭제까지 한 번에!
  useEffect(() => {
    let raf;
    function step() {
      setDrops((prev) => {
        const now = Date.now();
        // 1. 이동
        let next = prev.map((obj) => {
          if (!obj.fadeOut) {
            const newY = obj.y + obj.speed;
            // 2. fadeOut 처리
            if (newY > 92 && !obj.fadeOut) {
              return { ...obj, y: newY, fadeOut: true, fadeStartTime: now };
            }
            return { ...obj, y: newY };
          }
          return obj;
        });
        // 3. fadeOut 후 1.2초 지나면 삭제
        next = next.filter(
          (obj) =>
            !obj.fadeOut ||
            (obj.fadeStartTime && now - obj.fadeStartTime < 1200)
        );
        return next;
      });
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="falling-bg-layer">
      {drops.map((obj) => (
        <div
          key={obj.id}
          className={`falling-bg-obj ${obj.type} ${
            obj.fadeOut ? "fadeout" : ""
          }`}
          style={{
            left: `${obj.x}%`,
            top: `${obj.y}vh`,
            color: obj.type === "word" ? "#222" : obj.color,
            opacity: obj.type === "word" ? 0.18 : 0.09,
            fontSize: obj.type === "word" ? "3.3rem" : "3.5rem",
            fontWeight: obj.type === "word" ? 900 : 800,
            transform: `rotate(${obj.angle}deg)`,
            transition: obj.fadeOut ? "opacity 0.8s" : "none",
            position: "absolute",
            pointerEvents: "none",
            filter: obj.type === "word" ? "blur(0.7px)" : undefined,
            textShadow:
              obj.type === "word"
                ? "0 2px 16px #0af1,0 8px 22px #fff6"
                : undefined,
            fontFamily: "'Pretendard','SUIT',sans-serif",
          }}
        >
          {obj.content}
        </div>
      ))}
    </div>
  );
}
