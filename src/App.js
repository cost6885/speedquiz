import React, { useState } from "react";
import TypingQuiz from "./components/TypingQuiz";
import QuizResult from "./components/QuizResult";
import FallingBgLayer from "./components/FallingBgLayer";
import "./styles.css";
import RankingBoard from "./components/RankingBoard";
import EventPrizeBoard from "./components/EventPrizeBoard";
import HearthstonePortalLoading from "./components/HearthstonePortalLoading";
import NoticeModal from "./components/NoticeModal"; // << 새로 import

function shuffle(array) {
  return array.slice().sort(() => Math.random() - 0.5);
}

const App = () => {
  const [step, setStep] = useState("intro"); // intro | quiz | result
  const [quizList, setQuizList] = useState([]); // 초기값은 빈 배열!
  const [result, setResult] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showRanking, setShowRanking] = useState(false);
  const [showPrize, setShowPrize] = useState(false);
  

  // 로딩, 에러 상태
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const [endTime, setEndTime] = useState(null);
  const [finalElapsed, setFinalElapsed] = useState(null);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    fetch('/api/problems')
      .then(res => res.json())
      .then(setQuizList); // useState로 quizList 관리
  }, []);
  
  // 게임 시작 버튼 → 안내팝업 먼저!
  const startGame = async () => {
    setShowNotice(true);
  };

  // 팝업 닫히면 진짜 게임 스타트
  const handleNoticeClose = async () => {
    setShowNotice(false);
    setIsStarting(true);
    setStartError("");
    try {
      await fetch("/api/count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setTimeout(() => {
        setStep("quiz");
        setIsStarting(false);
      }, 1500);
    } catch (e) {
      setStartError("네트워크 오류! 잠시 후 다시 시도해주세요.");
      setIsStarting(false);
    }
  };

  // 퀴즈 끝나면 result로
  const handleFinish = (userAnswers, start, elapsed) => {
    setResult(userAnswers);
    setStartTime(start);
    setFinalElapsed(elapsed); // << 여기!!
    setStep("result");
  };

  // 다시하기
  const handleRestart = () => {
    setStep("intro");
    setResult(null);
    setStartTime(null);
    // 필요하다면 quizList 재셋팅 등 추가!
  };



  
  return (
    <>
      <NoticeModal open={showNotice} onClose={handleNoticeClose} />
      {isStarting && (
        <HearthstonePortalLoading
          onEnd={() => {
            setStep("quiz");
            setIsStarting(false);
          }}
        />
      )}
      {step === "quiz" && (
        <FallingBgLayer answerWord={quizList[currentIdx]?.word} />
      )}
      <div
        className="app"
        style={
          isStarting ? { filter: "blur(1.2px)", pointerEvents: "none" } : {}
        }
      >
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

            <button
              className="start-btn"
              onClick={startGame}
              disabled={isStarting}
              style={{
                opacity: isStarting ? 0.7 : 1,
                cursor: isStarting ? "wait" : "pointer",
              }}
            >
              {isStarting ? "로딩중입니다..." : "게임 시작"}
            </button>
            {startError && (
              <div style={{ color: "#d00", marginTop: 12, fontWeight: 600 }}>
                {startError}
              </div>
            )}
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
                margin: "0px 0 0",
              }}
            >
              <button
                className="ranking-btn"
                style={{
                  fontWeight: 700,
                  fontSize: 20,
                  minWidth: 160,
                  height: 50,
                  border: "2px solid #0099ff",
                  background: "#eaf6fd",
                  color: "#118",
                  borderRadius: 18,
                  cursor: "pointer",
                }}
                onClick={() => setShowRanking(true)}
                disabled={isStarting}
              >
                🏆 랭킹 보드
              </button>
              <button
                className="prize-btn"
                style={{
                  fontWeight: 700,
                  fontSize: 20,
                  minWidth: 160,
                  height: 50,
                  border: "2px solid #ff8844",
                  background: "#fff5e6",
                  color: "#d97d15",
                  borderRadius: 18,
                  cursor: "pointer",
                }}
                onClick={() => setShowPrize(true)}
                disabled={isStarting}
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
            finalElapsed={finalElapsed} // << 요렇게
            onRestart={handleRestart}
          />
        )}
      </div>
      <RankingBoard open={showRanking} onClose={() => setShowRanking(false)} />
      <EventPrizeBoard open={showPrize} onClose={() => setShowPrize(false)} />
    </>
  );
};

export default App;
