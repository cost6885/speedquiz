import React, { useState } from "react";
import TypingQuiz from "./components/TypingQuiz";
import QuizResult from "./components/QuizResult";
import FallingBgLayer from "./components/FallingBgLayer"; // 추가!
import WORDS from "./data/words";
import "./styles.css";
import RankingBoard from "./components/RankingBoard";
import EventPrizeBoard from "./components/EventPrizeBoard"; // 추가

function shuffle(array) {
  return array.slice().sort(() => Math.random() - 0.5);
}

const App = () => {
  const [step, setStep] = useState("intro"); // intro | quiz | result
  const [quizList] = useState(shuffle(WORDS));
  const [result, setResult] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0); // 현재 문제 번호
  const [showRanking, setShowRanking] = useState(false);
  const [showPrize, setShowPrize] = useState(false); // 상품 보드 오픈 여부

  const handleStart = () => setStep("quiz");

  // TypingQuiz에서 index 바뀔 때마다 currentIdx 세팅
  const handleFinish = (userAnswers, start, lastIdx) => {
    setResult(userAnswers);
    setStartTime(start);
    setStep("result");
  };

  const handleRestart = () => {
    setStep("intro");
    setResult(null);
    setStartTime(null);
    // 필요하다면 quizList 재셋팅 등 추가!
  };

  return (
    <>
      {step === "quiz" && (
        <FallingBgLayer answerWord={quizList[currentIdx]?.word} />
      )}
      <div className="app">
        {step === "intro" && (
          <div className="intro">
            <h1 className="title" style={{ marginBottom: 18 }}>
              <span className="title-main">
                디지털 리터러시
                <br />
                스피드퀴즈
              </span>
              <span className="title-glow"></span>
            </h1>
            <div className="intro-desc" style={{ marginTop: 0 }}>
              <p>
                <b>TBON</b>에 나온 10가지 용어들이 문제로 등장합니다.
              </p>
              <p>얼마나 빠르게 10가지 문제를 맞출 수 있을까요?</p>
              <p>
                <b style={{ color: "#08f" }}>
                  빠르게 타이핑해서 풀어보시고
                  <br />
                  상품을 받아가보세요!
                </b>
              </p>
            </div>
            <button className="start-btn" onClick={handleStart}>
              게임 시작
            </button>
            {/* ===== 디바이더 추가!! ===== */}
            <div
              style={{
                margin: "36px auto 20px",
                width: "60%",
                height: 1,
                background:
                  "linear-gradient(90deg, #e6e9f3 0%, #b3dbfd 50%, #e6e9f3 100%)",
                opacity: 0.66,
                borderRadius: 2,
                boxShadow: "0 1.5px 8px #b7d6e433",
              }}
            />
            {/* ======================== */}

            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                margin: "0px 0 0", // 설명카드 아래로 좀 띄워줌 (위치 맘대로 조절)
              }}
            >
              <button
                className="ranking-btn"
                style={{
                  fontWeight: 700,
                  fontSize: 20, // ← 더 큼
                  minWidth: 160,
                  height: 50,
                  border: "2px solid #0099ff",
                  background: "#eaf6fd",
                  color: "#118",
                  borderRadius: 18,
                  cursor: "pointer",
                }}
                onClick={() => setShowRanking(true)}
              >
                🏆 랭킹 보드
              </button>
              <button
                className="prize-btn"
                style={{
                  fontWeight: 700,
                  fontSize: 20, // ← 더 큼
                  minWidth: 160,
                  height: 50,
                  border: "2px solid #ff8844",
                  background: "#fff5e6",
                  color: "#d97d15",
                  borderRadius: 18,
                  cursor: "pointer",
                }}
                onClick={() => setShowPrize(true)}
              >
                🎁 이벤트 상품
              </button>
            </div>
          </div>
        )}

        {step === "quiz" && (
          <TypingQuiz
            quizList={quizList}
            onFinish={handleFinish}
            setCurrentIdx={setCurrentIdx}
          />
        )}

        {step === "result" && (
          <QuizResult
            results={result}
            startTime={startTime}
            onRestart={handleRestart}
          />
        )}
      </div>
      <RankingBoard open={showRanking} onClose={() => setShowRanking(false)} />;
      <EventPrizeBoard open={showPrize} onClose={() => setShowPrize(false)} />
    </>
  );
};

export default App;
