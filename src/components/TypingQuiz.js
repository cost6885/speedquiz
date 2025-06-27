import React, { useState, useRef, useEffect } from "react";
import Timer from "./Timer";

// 한글 자모 분해 함수
function splitHangul(char) {
  if (!/^[가-힣]$/.test(char)) return [char];
  const BASE = 0xac00;
  const CHOSUNG = [
    "ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ",
    "ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"
  ];
  const JUNGSUNG = [
    "ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ",
    "ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ",
    "ㅡ","ㅢ","ㅣ"
  ];
  const JONGSUNG = [
    "", "ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ",
    "ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ",
    "ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"
  ];

  const code = char.charCodeAt(0) - BASE;
  const cho = Math.floor(code / (21 * 28));
  const jung = Math.floor((code % (21 * 28)) / 28);
  const jong = code % 28;
  const arr = [CHOSUNG[cho], JUNGSUNG[jung]];
  if (JONGSUNG[jong]) arr.push(JONGSUNG[jong]);
  return arr;
}

// 문자열 전체 자모로 분해 (ex: "오디오북" → 9타)
function disassembleHangul(str) {
  const chars = [...str];
  let result = [];
  chars.forEach((c) => {
    if (/^[가-힣]$/.test(c)) {
      result = result.concat(splitHangul(c));
    } else {
      result.push(c);
    }
  });
  return result;
}

// accepts에서 "최소 자모 개수" 추출 (가장 짧은 정답 기준)
function getMinJamoCount(problem) {
  const hangulAnswers = (problem.accepts || []).filter(ans => /[가-힣]/.test(ans));
  if (!hangulAnswers.length) return 0;
  return Math.min(...hangulAnswers.map(ans => disassembleHangul(ans).length));
}

const TypingQuiz = ({ quizList, onFinish, setCurrentIdx }) => {
  const [index, setIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [userAnswers, setUserAnswers] = useState([]);
  const [startTime] = useState(Date.now());
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintMsg, setHintMsg] = useState("");
  const inputRef = useRef(null);
  const [showQuestion, setShowQuestion] = useState(true);
  const [userInputKeyCount, setUserInputKeyCount] = useState(0);
  const lastInputValue = useRef("");

  // 타이핑시 실제 "자모수" 카운트!
  useEffect(() => {
    const minJamoCount = getMinJamoCount(quizList[index]);
    setUserInputKeyCount(disassembleHangul(userInput).length);

    // 문제 바뀌면 카운터 리셋!
    lastInputValue.current = "";
  }, [userInput, index, quizList]);

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
      setUserInputKeyCount(0); // 문제 바뀌면 타수도 리셋
      lastInputValue.current = "";
    }, 220);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [index]);

  // 입력 변화시 정답 체크
  const handleInput = (e) => {
    setUserInput(e.target.value);
    setIsCorrect(isAnswerCorrect(e.target.value, quizList[index]));
    setHintMsg("");
  };

  // 다음/제출 버튼 클릭
  const handleNext = () => {
    const minJamoCount = getMinJamoCount(quizList[index]);
    if (!userInput) {
      setHintMsg("답을 입력하세요!");
      return;
    }
    // 붙여넣기 우회 등 막기: "타수 부족" 안내
    if (minJamoCount > 0 && disassembleHangul(userInput).length < minJamoCount) {
      setHintMsg(`정답을 직접 타이핑해 주세요! (${minJamoCount}타 이상 필요)`);
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
      setHintMsg("");
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
      return;
    }
    setHintMsg("오답입니다! 다시 시도해보세요 😅");
  };

  // 엔터키도 동일하게
  const handleKeyDown = (e) => {
    // 붙여넣기 방지
    if ((e.ctrlKey || e.metaKey) && ['v', 'V', 'c', 'C', 'x', 'X', 'a', 'A'].includes(e.key)) {
      e.preventDefault();
      return;
    }
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
          onPaste={e => {
            e.preventDefault();
            setHintMsg("붙여넣기는 사용할 수 없습니다!");
          }}
          onCopy={e => {
            e.preventDefault();
          }}
          onCut={e => {
            e.preventDefault();
          }}
          placeholder="정답을 입력하세요"
          className="quiz-input"
        />

        <button className="quiz-btn" onClick={handleNext}>
          {index + 1 === quizList.length ? "제출" : "다음"}
        </button>
      </div>
      {hintMsg && showQuestion && (
        <div className="hint-text">{hintMsg}</div>
      )}

      <Timer />
      <div className="quiz-progress">
        {index + 1} / {quizList.length}
      </div>
    </div>
  );
};

export default TypingQuiz;
