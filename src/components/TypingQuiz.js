import React, { useState, useRef, useEffect } from "react";
import Timer from "./Timer";

const TypingQuiz = ({
  quizList,
  onFinish,
  setCurrentIdx,
  onFirstImageLoaded,
  isLoadingOnly,
}) => {
  const [index, setIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [userAnswers, setUserAnswers] = useState([]);
  const [showQuestion, setShowQuestion] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const [hintMsg, setHintMsg] = useState("");
  const inputRef = useRef(null);

  // 타이머
  const [quizStartTime, setQuizStartTime] = useState(null); // null → 시작 시점 기록
  const [currentProblemStartTime, setCurrentProblemStartTime] = useState(null);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // 로딩
  const [imgLoading, setImgLoading] = useState(true);

  // 👇 로딩 시간 누적
  const loadingPausedRef = useRef(0);
  const loadingStartRef = useRef(null);

  // 👇 캡차 관련 상태
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaImageUrl, setCaptchaImageUrl] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaFail, setCaptchaFail] = useState(false);
  const [captchaCount, setCaptchaCount] = useState(0);

  // 👇 1초 이내 연속통과 감지용(마지막 3개 타임스탬프 기록)
  const answerTimes = useRef([]);

  // 타이머 (문제 볼 수 있을 때만 동작)
  useEffect(() => {
    if (!timerActive || quizStartTime === null) return;
    const timer = setInterval(() => {
      setTotalElapsed(
        Math.max(0, Date.now() - quizStartTime - loadingPausedRef.current)
      );
    }, 100);
    return () => clearInterval(timer);
  }, [timerActive, quizStartTime]);

  // 문제 바뀔 때마다 로딩! (맨 처음에도 반드시 imgLoading=true)
  useEffect(() => {
    setImgLoading(true);
    setShowQuestion(false);
    setUserInput("");
    setHintMsg("");
    setCurrentProblemStartTime(null);
    setTimerActive(false);
    if (setCurrentIdx) setCurrentIdx(index);
    loadingStartRef.current = Date.now();
    if (index === 0) {
      loadingPausedRef.current = 0; // ⭐️ 첫 문제에서 반드시 0으로!
    }
  }, [index, setCurrentIdx]);

  // input 자동 포커스 (이미지 로딩 완료 시점)
  useEffect(() => {
    if (!imgLoading && showQuestion && inputRef.current) {
      inputRef.current.focus();
    }
  }, [imgLoading, showQuestion, index]);

  useEffect(() => {
    if (
      !imgLoading &&
      index === 0 &&
      typeof onFirstImageLoaded === "function"
    ) {
      onFirstImageLoaded();
    }
    // 의존성 배열에 onFirstImageLoaded 꼭 포함!
  }, [imgLoading, index, onFirstImageLoaded]);

  // 캡차 이미지 받아오기
  const fetchCaptchaImage = async () => {
    const url = "/api/captcha?" + Date.now(); // cache bust
    const res = await fetch(url);
    const blob = await res.blob();
    setCaptchaImageUrl(URL.createObjectURL(blob));
  };

  // 캡차 입력 감지
  const handleCaptchaInput = (e) => {
    setCaptchaInput(e.target.value);
    setCaptchaFail(false);
  };

  // 입력 변화시 정답 체크
  const handleInput = (e) => {
    setUserInput(e.target.value);
    setIsCorrect(isAnswerCorrect(e.target.value, quizList[index]));
    setHintMsg("");
  };

  // 이미지 로딩 완료시 (첫 문제/이후 모두 포함)
  const handleImgLoaded = () => {
    setImgLoading(false);
    setShowQuestion(true);
    setCurrentProblemStartTime(Date.now());
    setQuizStartTime((prev) => prev || Date.now());
    // 👇 바로 아래 이 한 줄 추가!
    if (index === 0) loadingPausedRef.current = 0;
    // 로딩 시간 누적
    if (loadingStartRef.current) {
      loadingPausedRef.current += Date.now() - loadingStartRef.current;
    }
    setTimerActive(true);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
    console.log(quizStartTime);
  };

  function normalize(str) {
    return (str || "")
      .replace(/\s+/g, "")
      .toLowerCase()
      .replace(/-/g, "")
      .replace(/_/g, "");
  }
  function isAnswerCorrect(userInput, currentQuiz) {
    if (!currentQuiz || !Array.isArray(currentQuiz.accepts)) return false;
    const inputNorm = normalize(userInput);
    return currentQuiz.accepts.some((ans) => normalize(ans) === inputNorm);
  }

  const handleNext = async () => {
    if (showCaptcha) {
      if (!captchaInput) {
        setHintMsg("캡차를 입력하세요!");
        return;
      }
      // 캡차 검증 (API POST)
      const resp = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: captchaInput }),
      }).then((r) => r.json());
      if (!resp.success) {
        setCaptchaFail(true);
        setHintMsg("캡차가 틀렸습니다. 다시 입력해주세요!");
        fetchCaptchaImage();
        setCaptchaInput("");
        return;
      }
      // 캡차 성공시
      setShowCaptcha(false);
      setCaptchaInput("");
      setCaptchaFail(false);
      setHintMsg("");
      // 캡차 성공하면 다시 handleNext의 나머지 동작 실행!
    }
    if (!userInput) {
      setHintMsg("답을 입력하세요!");
      return;
    }
    if (isAnswerCorrect(userInput, quizList[index])) {
      const timeUsed = currentProblemStartTime
        ? Date.now() - currentProblemStartTime
        : 0;
      setUserAnswers([
        ...userAnswers,
        {
          word: quizList[index].word,
          userInput,
          correct: true,
          timeUsed,
        },
      ]);
      setTimerActive(false);
      if (index + 1 < quizList.length) {
        setIndex(index + 1);
      } else {
        onFinish(
          userAnswers.concat([
            {
              word: quizList[index].word,
              userInput,
              correct: true,
              timeUsed,
            },
          ]),
          quizStartTime || Date.now() // ← 이렇게!
        );
      }
      return;
    }
    setHintMsg("오답입니다! 다시 시도해보세요 😅");
  };

  // 엔터키
  const handleKeyDown = (e) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      ["v", "V", "c", "C", "x", "X", "a", "A"].includes(e.key)
    ) {
      e.preventDefault();
      return;
    }
    if (e.key === "Enter") handleNext();
  };

  return (
    <div className="quiz-box">
      <div
        className={`desc-area quiz-transition${showQuestion ? " in" : " out"}`}
        style={{
          minHeight: 250,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="quiz-label">Q{index + 1}.</div>
        {quizList[index].descImg ? (
          <>
            {imgLoading && (
              <div
                style={{
                  minHeight: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  color: "#888",
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                }}
              >
                <div
                  className="img-loading-spin"
                  style={{
                    marginRight: 15,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "5px solid #bfe6ff",
                    borderTop: "5px solid #53c8ff",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                문제 이미지를 불러오는 중...
                <style>
                  {`@keyframes spin {100%{transform: rotate(360deg);}}`}
                </style>
              </div>
            )}
            <img
              src={quizList[index].descImg}
              alt="문제 이미지"
              style={{
                maxWidth: "96%",
                maxHeight: 220,
                borderRadius: 14,
                boxShadow: "0 4px 20px #aac3e955",
                background: "#fff",
                objectFit: "contain",
                display: imgLoading ? "none" : "block",
              }}
              onLoad={handleImgLoaded}
              draggable={false}
            />
          </>
        ) : (
          <div style={{ minHeight: 120 }} />
        )}
      </div>
      <div className="input-area">
        <input
          ref={inputRef}
          value={userInput}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={(e) => {
            e.preventDefault();
            setHintMsg("붙여넣기는 사용할 수 없습니다!");
          }}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          placeholder="정답을 입력하세요"
          className="quiz-input"
          disabled={imgLoading}
        />

        <button className="quiz-btn" onClick={handleNext} disabled={imgLoading}>
          {index + 1 === quizList.length ? "제출" : "다음"}
        </button>
      </div>
      {showCaptcha && (
        <div className="captcha-area" style={{ marginTop: 20 }}>
          <img
            src={captchaImageUrl}
            alt="캡차"
            style={{ height: 40, verticalAlign: "middle" }}
          />
          <input
            value={captchaInput}
            onChange={handleCaptchaInput}
            placeholder="위 문자를 입력"
            style={{ marginLeft: 8, width: 100 }}
          />
          {captchaFail && <div style={{ color: "red" }}>다시 입력!</div>}
        </div>
      )}

      {hintMsg && showQuestion && <div className="hint-text">{hintMsg}</div>}
      <Timer time={totalElapsed} running={timerActive} />
      <div className="quiz-progress">
        {index + 1} / {quizList.length}
      </div>
    </div>
  );
};

export default TypingQuiz;
