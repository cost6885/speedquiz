import React, { useState, useEffect } from "react";
import submitRecord from "../api/submitRecord";
import FallingGangs from "./FallingGangs";

// 아주 가볍게 인라인 스타일만 사용 (추가 CSS도 가능)
const buttonWrap = {
  display: "flex",
  gap: 12,
  marginTop: 16,
  justifyContent: "center",
  width: "100%",
};

const buttonBase = {
  minWidth: 122,
  height: 44,
  fontWeight: 700,
  fontSize: 17,
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  transition: "background 0.15s, color 0.13s, border 0.15s",
  letterSpacing: "0.05em",
  outline: "none",
  boxShadow: "0 2px 8px #bde1fd28",
};

const buttonMain = {
  ...buttonBase,
  background: "linear-gradient(90deg, #218fff 65%, #6fe7c1 100%)",
  color: "#fff",
  border: "none",
};

const buttonGhost = {
  ...buttonBase,
  background: "#f8fbff",
  color: "#2277ee",
  border: "1.5px solid #2277ee",
};

const boxStyle = {
  maxWidth: 400,
  margin: "50px auto 0",
  background: "rgba(247,250,255,0.92)",
  borderRadius: 18,
  boxShadow: "0 6px 36px #b6c9e566",
  padding: "36px 32px 30px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontFamily: "Pretendard, Noto Sans KR, sans-serif",
};

const bigScore = {
  fontSize: 48,
  fontWeight: 900,
  color: "#2277ee",
  margin: "6px 0 0",
  letterSpacing: "1.6px",
  textShadow: "0 4px 18px #bde1fd66",
  fontFamily: "Orbitron, Pretendard, sans-serif",
  animation: "pop-in 0.7s cubic-bezier(.77,1.68,.55,.89)",
};

const celebrate = {
  fontSize: 22,
  fontWeight: 700,
  color: "#30b48a",
  margin: "0 0 18px",
  letterSpacing: "0.1em",
  animation: "fade-in 1.2s",
};

const infoLabel = {
  fontSize: 16,
  marginBottom: "18px",
  color: "#444",
  margin: "0px 0 18px",
};

const inputWrap = {
  display: "flex",
  gap: 10,
  margin: "18px 0 6px",
  width: "100%",
  justifyContent: "center",
};

const inputBox = {
  fontSize: 15,
  padding: "7px 10px",
  border: "1.2px solid #c1d3ee",
  borderRadius: 7,
  width: 92,
  outline: "none",
  transition: "border 0.2s",
  fontFamily: "inherit",
};

const msgStyle = {
  marginTop: 18,
  color: "#c33",
  fontWeight: 600,
  textAlign: "center",
  minHeight: 32,
};

const keyframes = `
@keyframes pop-in {
  0% {transform: scale(0.7); opacity: 0;}
  80% {transform: scale(1.1);}
  100% {transform: scale(1); opacity: 1;}
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-18px);}
  to { opacity: 1; transform: translateY(0);}
}
`;

const QuizResult = ({
  results,
  startTime,
  finalElapsed,
  userInfo,
  onRestart,
}) => {
  // submitted, submitMsg 상태 및 관련 UI 모두 제거
  // results.submitMsg를 그대로 사용
  return (
    <div style={boxStyle}>
      <FallingGangs />
      <style>{keyframes}</style>
      <div style={celebrate}>
        <p>DIGITAL Literacy</p>
        <p>🚦Speed Quiz🏁</p>
      </div>
      <div style={bigScore}>성공!!</div>
      <div style={infoLabel}>
        ⏱️ <b>총 소요 시간</b>{" "}
        <span style={{ color: "#2277ee" }}>{(results.elapsed / 1000).toFixed(2)}초</span>
      </div>
      <div style={msgStyle}>{results.submitMsg || "기록 제출 중..."}</div>
      <button style={buttonGhost} onClick={onRestart}>
        다시하기
      </button>
    </div>
  );
};


export default QuizResult;
