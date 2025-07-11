import React, { useState, useEffect } from "react";
import TypingQuiz from "./components/TypingQuiz";
import QuizResult from "./components/QuizResult";
import FallingBgLayer from "./components/FallingBgLayer";
import "./styles.css";
import RankingBoard from "./components/RankingBoard";
import EventPrizeBoard from "./components/EventPrizeBoard";
import HearthstonePortalLoading from "./components/HearthstonePortalLoading";
import NoticeModal from "./components/NoticeModal";
import UserInfoModal from "./components/UserInfoModal"; 

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
  const [sessionId, setSessionId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);  
  const [showUserInfo, setShowUserInfo] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false);



  // 게임 시작(처음/다시하기)시 문제 셔플 호출 함수
  const fetchProblems = async () => {
    const res = await fetch("/api/problems");
    const { problems, sessionId } = await res.json();
    setQuizList(problems);
    setSessionId(sessionId);
  };


  
  const startGame = () => setShowUserInfo(true);

  // 정보 입력 후 -> 실제 게임 시작
  const handleUserInfoSubmit = (info) => {
    setUserInfo(info);
    setShowUserInfo(false); // 정보입력창 닫고
    setTimeout(() => setShowNotice(true), 150); // 안내모달 띄움 (약간의 딜레이는 자연스러운 UX)
  };

  const handleNoticeClose = () => {
    setShowNotice(false);
    setIsStarting(true);
    setStartError("");
    fetch("/api/count", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then(() => {
        setTimeout(() => {
          setStep("quiz");
          setIsStarting(false);
        }, 1500);
      })
      .catch(() => {
        setStartError("네트워크 오류! 잠시 후 다시 시도해주세요.");
        setIsStarting(false);
      });
  };

  
  const handleFinish = async (userAnswers, start, elapsed) => {
  setFinalElapsed(elapsed);
  setIsSubmitting(true); // ✅ 기록 제출 시작!

  const endTime = start + elapsed;
  const payload = {
    ...userInfo,
    quizResults: userAnswers,
    startTime: start,
    endTime,
    timeTaken: (elapsed / 1000).toFixed(2),
    status: "정상",
  };
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(r => r.json());
    setResult({
      userAnswers,
      startTime: start,
      elapsed,
      userInfo,
      submitMsg:
        res.status === "success"
          ? "제출 완료! 기록이 저장되었습니다 🎉"
          : "저장 중 오류가 발생했습니다: " + (res?.message || ""),
    });
    setStep("result");
  } catch (e) {
    setResult({
      userAnswers,
      startTime: start,
      elapsed,
      submitMsg: "기록 제출 실패 ㅠㅠ",
    });
    setStep("result");
  } finally {
    setIsSubmitting(false); // ✅ 제출 끝!
  }
};


  // 다시하기
  const handleRestart = async () => {
    await fetchProblems();
    setResult(null);
    setUserInfo(null);
    setStartTime(null);
    setStep("intro");
  };

  const handleLoadingEnd = async () => {
    try {
      await fetchProblems();          // 셔플!
      setStep("quiz");                // 퀴즈 시작!
    } finally {
      setIsStarting(false);
    }
  };
  

  
  return (
    <>
      <UserInfoModal
        open={showUserInfo}
        onSubmit={handleUserInfoSubmit}
        onCancel={() => setShowUserInfo(false)}
      />
      <NoticeModal open={showNotice} onClose={handleNoticeClose} />
      
      {isSubmitting && (
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.76)",
          fontSize: 32,
          fontWeight: 700,
        }}
      >
        기록 저장 중...
        {/* 
          로딩 스피너를 하나 더 추가하려면 아래처럼 써도 됨! 
          <div className="spinner" />
        */}
      </div>
    )}
    {isStarting && (
      <HearthstonePortalLoading onEnd={handleLoadingEnd} />
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
            startTime={result.startTime}
            finalElapsed={result.elapsed}
            userInfo={userInfo}
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
