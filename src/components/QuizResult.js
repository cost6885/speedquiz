import React, { useState } from "react";
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
  color: "#444",
  margin: "14px 0 4px",
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

const QuizResult = ({ results, startTime, onRestart }) => {
  const [submitted, setSubmitted] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [form, setForm] = useState({
    company: "",
    employeeId: "",
    name: "",
  });

  // 여기선 정답수, 시간은 "보여주기용"만 사용, 서버에선 실제로 다시 검증!
  const correctCount = results.filter((r) => r.correct).length;
  const totalTime = ((results[results.length - 1]?.time - startTime) / 1000).toFixed(2);

  const handleSubmit = async () => {
    if (!form.company || !form.employeeId || !form.name) {
      setSubmitMsg("회사/사번/이름을 모두 입력하세요!");
      return;
    }
    try {
      const payload = {
        ...form,
        quizResults: results, // 모든 문제 풀이 로그
        startTime,            // 시작 시간 (client-side)
        endTime: results[results.length - 1]?.time, // 마지막 제출 시간 (client-side)
      };
      const res = await submitRecord(payload); // /api/submit로
      if (res?.status === "success") {
        setSubmitted(true);
        setSubmitMsg("제출 완료! 기록이 저장되었습니다 🎉");
      } else {
        setSubmitMsg("저장 중 오류가 발생했습니다: " + (res?.message || ""));
      }
    } catch (e) {
      setSubmitMsg("제출 실패: " + e.message);
    }
  };

  if (submitted)
    return (
      <div style={boxStyle}>
        <style>{keyframes}</style>
        <div style={celebrate}>🥳 제출 완료!</div>
        <div style={{ fontSize: 18, marginBottom: 12, color: "#2277ee" }}>
          기록이 저장되었습니다.
          <br />
          <span style={{ fontSize: 15, color: "#3f3f7f" }}>
            참여해주셔서 감사합니다!
          </span>
        </div>
        <button style={buttonGhost} onClick={onRestart}>
          다시하기
        </button>
      </div>
    );

  return (
    <div style={boxStyle}>
      <FallingGangs />
      <style>{keyframes}</style>
      <div style={celebrate}>🎉 DIGITAL TYPING CHALLENGE</div>
      <div style={bigScore}>
        {correctCount} / {results.length}
        <span
          style={{
            fontSize: 19,
            fontWeight: 600,
            color: "#5ccfb3",
            marginLeft: 10,
          }}
        >
          정답
        </span>
      </div>
      <div style={infoLabel}>
        ⏱️ <b>총 소요 시간</b>{" "}
        <span style={{ color: "#2277ee" }}>{totalTime}초</span>
      </div>
      <div style={inputWrap}>
        <input
          placeholder="회사"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          style={inputBox}
        />
        <input
          placeholder="사번(ID)"
          value={form.employeeId}
          onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
          style={inputBox}
        />
        <input
          placeholder="이름"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={inputBox}
        />
      </div>
      <div style={buttonWrap}>
        <button style={buttonMain} onClick={handleSubmit}>
          제출하기
        </button>
        <button style={buttonGhost} onClick={onRestart}>
          다시하기
        </button>
      </div>
      {submitMsg && <div style={msgStyle}>{submitMsg}</div>}
    </div>
  );
};

export default QuizResult;
