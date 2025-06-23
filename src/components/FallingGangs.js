// src/components/FallingGangs.js
import React, { useEffect, useRef, useState } from "react";

const GANG_IMG =
  "https://www.hushwish.com/wp-content/uploads/2020/10/emo_gang_003.gif";

const NUM_GANGS = 7; // 원하는 만큼 갱 갯수 (적당히)
const MIN_SPEED = 12; // 최저 12초
const MAX_SPEED = 22; // 최고 22초
const MIN_ROTATE = -20;
const MAX_ROTATE = 30;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function getRandomProps() {
  // 가로 위치 (5~80%)
  const left = randomBetween(5, 80);
  // 각도
  const rotate = randomBetween(MIN_ROTATE, MAX_ROTATE);
  // 속도 (초)
  const duration = randomBetween(MIN_SPEED, MAX_SPEED);
  // 사이즈 (80~140px)
  const size = randomBetween(80, 140);

  return { left, rotate, duration, size };
}

const FallingGangs = () => {
  // 배열로 랜덤값 준비 (컴포넌트 mount시 고정)
  const [gangs] = useState(
    Array.from({ length: NUM_GANGS }, () => getRandomProps())
  );

  // 무한루프용 "키" (떨어지고 나면 리랜더)
  const [keys, setKeys] = useState(
    Array.from({ length: NUM_GANGS }, () => Math.random())
  );

  // 각 gang이 끝까지 떨어지면 새로 시작
  useEffect(() => {
    const timers = gangs.map((_, idx) => {
      const loop = () => {
        setKeys((prev) => {
          const newKeys = [...prev];
          newKeys[idx] = Math.random();
          return newKeys;
        });
      };
      // duration 후마다 loop 돌리기
      return setInterval(loop, gangs[idx].duration * 1000);
    });

    return () => timers.forEach((t) => clearInterval(t));
  }, [gangs]);

  return (
    <div
      className="falling-gangs-bg"
      style={{
        pointerEvents: "none",
        zIndex: -2,
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {gangs.map((props, idx) => (
        <img
          key={keys[idx]}
          src={GANG_IMG}
          style={{
            position: "absolute",
            left: `${props.left}%`,
            top: `-180px`,
            width: `${props.size}px`,
            opacity: 0.32,
            filter: "drop-shadow(0 0 12px #3333) blur(0.5px)",
            transform: `rotate(${props.rotate}deg)`,
            animation: `gangfall${idx} ${props.duration}s linear forwards`,
            pointerEvents: "none",
            zIndex: -2,
          }}
          alt="emo_gang"
        />
      ))}

      {/* CSS 키프레임을 동적으로 삽입 */}
      <style>
        {gangs
          .map(
            (p, i) => `
        @keyframes gangfall${i} {
          0% { top: -180px; opacity: 0.15;}
          5% { opacity: 0.36;}
          95% { opacity: 0.32;}
          100% { top: 98vh; opacity: 0.10;}
        }
      `
          )
          .join("\n")}
      </style>
    </div>
  );
};

export default FallingGangs;
