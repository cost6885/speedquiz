// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// ------ [1] 퀴즈 데이터 (실제 출제와 동일하게! 바꿔서 사용) ------
const QUIZ_PROBLEMS = [
  {
    word: "보코더",
    accepts: ["보코더", "vocoder"],
  },
  {
    word: "오디오북",
    accepts: ["오디오북", "audiobook"],
  },
  {
    word: "초분광",
    accepts: ["초분광", "hyperspectral"],
  },
  {
    word: "QR코드",
    accepts: ["qr코드", "qr", "qr code", "QRCode", "큐알", "큐알코드"],
  },
  {
    word: "iot",
    accepts: ["iot", "아이오티", "IOT"],
  },
  {
    word: "tts",
    accepts: ["tts", "티티에스", "TTS"],
  },
  {
    word: "라이다",
    accepts: ["라이다", "lidar"],
  },
  {
    word: "멀티모달",
    accepts: ["멀티모달", "multimodal"],
  },
  {
    word: "로보택시",
    accepts: ["로보택시", "robotaxi"],
  },
  {
    word: "디지털트윈",
    accepts: ["디지털트윈", "digitaltwin", "digital twin"],
  },
];


// ------ [2] 중복 제출 체크용 (실서비스는 DB 사용) ------
const recordSet = new Map(); // key: "회사/사번"  value: {time, ...}

// ------ [3] 유틸: 정답 비교 ------
function checkCorrect(userInput, accepts) {
  const norm = (s) => (s || "").replace(/\s+/g, "").toLowerCase();
  return accepts.some(ans => norm(ans) === norm(userInput));
}

// ------ [4] 제출 API ------
app.post('/api/submit', async (req, res) => {
  const { company, employeeId, name, quizResults, startTime, endTime } = req.body;

  // --- 1. 필드체크 ---
  if (!company || !employeeId || !name || !Array.isArray(quizResults) || !startTime || !endTime) {
    return res.status(400).json({ status: "error", message: "누락 필드" });
  }

  // --- 2. 실제 정답 채점 ---
  let correctCount = 0;
  for (let i = 0; i < QUIZ_PROBLEMS.length; i++) {
    const prob = QUIZ_PROBLEMS[i];
    const userAns = quizResults[i]?.userInput;
    if (checkCorrect(userAns, prob.accepts)) correctCount++;
  }

  // --- 3. 소요시간 산출(백엔드에서만 신뢰) ---
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);

  // --- 4. 최고기록만 인정 (동일 회사/사번) ---
  const key = company + "/" + employeeId;
  const prev = recordSet.get(key);
  if (!prev || Number(prev.time) > Number(totalTime)) {
    recordSet.set(key, { company, employeeId, name, time: totalTime, correct: correctCount });
  }

  // --- 5. 구글 스프레드시트에 저장 (실제 점수/시간만!) ---
  try {
    const gsRes = await axios.post(
      "https://script.google.com/macros/s/AKfycbzRfrffVsLeUdwTqFx38pfv_sOFJzEaDd-LHDCPwCh3BsdufU0sqT_hI9K5HLtJHOQb8g/exec",
      { company, employeeId, name, timeTaken: totalTime, correctCount },
      { headers: { "Content-Type": "text/plain;charset=utf-8" } }
    );
    res.json({
      status: "success",
      message: "기록 저장 성공!",
      correctCount,
      totalTime,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "구글 스크립트 에러: " + (err.response?.data?.message || err.message),
    });
  }
});

// ------ [5] 랭킹 API (구글 Apps Script와 연동) ------
app.get('/api/ranking', async (req, res) => {
  try {
    const url = "https://script.google.com/macros/s/AKfycbzRfrffVsLeUdwTqFx38pfv_sOFJzEaDd-LHDCPwCh3BsdufU0sqT_hI9K5HLtJHOQb8g/exec?type=ranking";
    const gsRes = await axios.get(url);
    res.json(gsRes.data);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "구글 스크립트 에러: " + (err.response?.data?.message || err.message),
    });
  }
});

// ------ [6] 서버 시작 ------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ API server on http://localhost:${PORT}`));

