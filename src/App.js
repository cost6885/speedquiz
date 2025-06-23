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
            <button
              className="ranking-btn"
              style={{
                marginLeft: 14,
                fontWeight: 600,
                fontSize: 16,
                border: "1.5px solid #0099ff",
                background: "#eaf6fd",
                color: "#118",
                padding: "7px 17px",
                borderRadius: 16,
                marginTop: 10,
                cursor: "pointer",
              }}
              onClick={() => setShowRanking(true)}
            >
              🏆 랭킹 보드
            </button>
            <button
              className="prize-btn"
              style={{
                fontWeight: 600,
                fontSize: 16,
                border: "1.5px solid #ff8844",
                background: "#fff5e6",
                color: "#d97d15",
                padding: "7px 17px",
                borderRadius: 16,
                cursor: "pointer",
              }}
              onClick={() => setShowPrize(true)}
            >
              🎁 이벤트 상품
            </button>                
            <h1 className="title">
              <span className="title-main">
                디지털 리터러시
                <br />
                스피드퀴즈
              </span>
              <span className="title-glow"></span>
            </h1>
            <div className="intro-desc">
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
