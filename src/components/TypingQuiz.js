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

function getMinKeyCount(problem) {
  return Math.min(
    ...(problem.accepts || []).map(ans =>
      /[가-힣]/.test(ans)
        ? disassembleHangul(ans).length
        : ans.length
    )
  );
}

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
  const [keyLog, setKeyLog] = useState([]);


  // 👇 캡차 관련 상태
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaImageUrl, setCaptchaImageUrl] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaFail, setCaptchaFail] = useState(false);
  const [captchaCount, setCaptchaCount] = useState(0);

  // 👇 1초 이내 연속통과 감지용(마지막 3개 타임스탬프 기록)
  const answerTimes = useRef([]);


  const handleInputKeyDown = (e) => {
    // 실제 타이핑(한 글자 이상)
    if (e.key.length === 1) {
      setKeyLog((prev) => [...prev, e.key]);
    } else if (
      ["Backspace", "Delete", "Enter", "Tab"].includes(e.key)
    ) {
      setKeyLog((prev) => [...prev, `[${e.key}]`]);
    }
    // 붙여넣기/복사/잘라내기/전체선택 막기
    if (
      (e.ctrlKey || e.metaKey) &&
      ["v", "V", "c", "C", "x", "X", "a", "A"].includes(e.key)
    ) {
      e.preventDefault();
      setHintMsg("붙여넣기는 사용할 수 없습니다!");
      return;
    }
    // 기존 엔터 처리
    if (e.key === "Enter") handleNext();
  };


  
  // 타이핑시 실제 "자모수" 카운트!
  useEffect(() => {
    setUserInputKeyCount(
      /[가-힣]/.test(userInput)
        ? disassembleHangul(userInput).length
        : userInput.length
    );
  }, [userInput, index, quizList]);

  // 문제 넘어갈 때 리셋
  useEffect(() => {
    setShowQuestion(false);
    const timer = setTimeout(() => {
      setShowQuestion(true);
      setUserInput("");
      setIsCorrect(false);
      setHintMsg("");
      if (setCurrentIdx) setCurrentIdx(index);
      if (inputRef.current) inputRef.current.focus();
      setUserInputKeyCount(0);
    }, 220);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [index]);

  // 캡차 이미지 받아오기
  const fetchCaptchaImage = async () => {
    const url = "/api/captcha?" + Date.now(); // cache bust
    const res = await fetch(url);
    const blob = await res.blob();
    setCaptchaImageUrl(URL.createObjectURL(blob));
  };

  // 정답 입력 감지
  const handleInput = (e) => {
    setUserInput(e.target.value);
    setIsCorrect(isAnswerCorrect(e.target.value, quizList[index]));
    setHintMsg("");
  };

  // 캡차 입력 감지
  const handleCaptchaInput = (e) => {
    setCaptchaInput(e.target.value);
    setCaptchaFail(false);
  };

  // 다음/제출 버튼 클릭
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
      }).then(r => r.json());
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

    const minKeyCount = getMinKeyCount(quizList[index]);
    const userKeyCount = /[가-힣]/.test(userInput)
      ? disassembleHangul(userInput).length
      : userInput.length;

    if (!userInput) {
      setHintMsg("답을 입력하세요!");
      return;
    }
    if (minKeyCount > 0 && userKeyCount < minKeyCount) {
      setHintMsg(`정답을 직접 타이핑해 주세요! (최소 ${minKeyCount}타 입력 필요)`);
      return;
    }
    if (isAnswerCorrect(userInput, quizList[index])) {
      // --- [1초 이내 연속통과 로직] ---
      const now = Date.now();
      answerTimes.current.push(now);
      if (answerTimes.current.length > 5)
        answerTimes.current.shift();
      if (answerTimes.current.length === 5) {
        const dt = answerTimes.current[4] - answerTimes.current[0];
        if (dt <= 3000) {  
          setShowCaptcha(true);
          fetchCaptchaImage();
          setHintMsg("자동입력 방지 확인! 캡차를 입력해주세요.");
          setCaptchaInput("");
          return;
        }
      }
      // ---------------------------
      setUserAnswers([
        ...userAnswers,
        {
          word: quizList[index].word,
          userInput,
          correct: true,
          time: now,
          keyLog: [...keyLog],  // 여기!
        },
      ]);
      setHintMsg("");
      // 타임스탬프 갱신은 위에서 이미 됨

      if (index + 1 < quizList.length) {
        setIndex(index + 1);
      } else {
        onFinish(
          userAnswers.concat([
            {
              word: quizList[index].word,
              userInput,
              correct: true,
              time: now,
            },
          ]),
          startTime
        );
      }
      return;
    }
    setHintMsg("오답입니다! 다시 시도해보세요 😅");
  };


  return (
    <div className="quiz-box">
      <div className={`desc-area quiz-transition${showQuestion ? " in" : " out"}`}>
        <div className="quiz-label">Q{index + 1}.</div>
        <div className="quiz-desc">{quizList[index].desc}</div>
      </div>

      <div className="input-area">
        <input
          ref={inputRef}
          value={userInput}
          onChange={handleInput}
          onKeyDown={handleInputKeyDown} // 여기만 수정!
          onPaste={e => {
            e.preventDefault();
            setHintMsg("붙여넣기는 사용할 수 없습니다!");
          }}
          onCopy={e => e.preventDefault()}
          onCut={e => e.preventDefault()}
          placeholder="정답을 입력하세요"
          className="quiz-input"
          disabled={showCaptcha}
        />
        <button className="quiz-btn" onClick={handleNext}>
          {index + 1 === quizList.length ? "제출" : "다음"}
        </button>
      </div>

      {showCaptcha && (
        <div className="captcha-area" style={{ marginTop: 20 }}>
          <img src={captchaImageUrl} alt="캡차" style={{ height: 40, verticalAlign: "middle" }} />
          <input
            value={captchaInput}
            onChange={handleCaptchaInput}
            placeholder="위 문자를 입력"
            style={{ marginLeft: 8, width: 100 }}
          />
          {captchaFail && <div style={{ color: "red" }}>다시 입력!</div>}
        </div>
      )}

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
