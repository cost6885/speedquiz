import React, { useState, useRef, useEffect } from "react";
import Timer from "./Timer";

const TypingQuiz = ({ quizList, onFinish, setCurrentIdx }) => {
  const [index, setIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [userAnswers, setUserAnswers] = useState([]);
  const [startTime] = useState(Date.now());
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintMsg, setHintMsg] = useState("");
  const inputRef = useRef(null);
  const [showQuestion, setShowQuestion] = useState(true);

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

  useEffect(() => {
    setShowQuestion(false); // 1. 먼저 숨기기 (fade out)
    const timer = setTimeout(() => {
      setShowQuestion(true); // 2. 그 다음에 새 문제 보이기 (fade in)
      setUserInput("");
      setIsCorrect(false);
      setHintMsg("");
      if (setCurrentIdx) setCurrentIdx(index);
      if (inputRef.current) inputRef.current.focus();
    }, 220); // 200ms 정도 숨긴 뒤 교체
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [index]);

  // 입력 변화시 정답 체크
  const handleInput = (e) => {
    setUserInput(e.target.value);
    setIsCorrect(isAnswerCorrect(e.target.value, quizList[index]));
    setHintMsg(""); // 입력 바뀌면 메시지 리셋
  };

  // 다음/제출 버튼 클릭
  const handleNext = () => {
    setHintMsg(""); // 버튼 누를 때 무조건 힌트 리셋!
    
    if (!userInput) {
      setHintMsg("답을 입력하세요!");
      return;
    }
    if (isAnswerCorrect(userInput, quizList[index])) {
      setUserAnswers([
        ...userAnswers,
        {
          word: quizList[index].word,
          userInput,
          correct: true,
          time: Date.now(),
        },
      ]);      
      if (index + 1 < quizList.length) {
        setIndex(index + 1);
      } else {
        onFinish(
          userAnswers.concat([
            {
              word: quizList[index].word,
              userInput,
              correct: true,
              time: Date.now(),
            },
          ]),
          startTime
        );
      }
    } else {
      setHintMsg("오답입니다! 다시 시도해보세요 😅");
    }
  };

  // 엔터키도 동일하게
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleNext();
  };

  return (
    <div className="quiz-box">
      <div
        className={`desc-area quiz-transition${showQuestion ? " in" : " out"}`}
      >
        <div className="quiz-label">Q{index + 1}.</div>
        <div className="quiz-desc">{quizList[index].desc}</div>
      </div>

      <div className="input-area">
        <input
          ref={inputRef}
          value={userInput}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="정답을 입력하세요"
          className="quiz-input"
        />
        <button className="quiz-btn" onClick={handleNext}>
          {index + 1 === quizList.length ? "제출" : "다음"}
        </button>
      </div>
      {hintMsg && <div className="hint-text">{hintMsg}</div>}

      <Timer />
      <div className="quiz-progress">
        {index + 1} / {quizList.length}
      </div>
    </div>
  );
};

export default TypingQuiz;
