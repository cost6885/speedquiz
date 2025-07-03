// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const svgCaptcha = require('svg-captcha');
const cookieParser = require('cookie-parser');
const app = express();
const path = require("path");

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// ------ [임시 IP/UA 추적용] ------
const ipMap = new Map();      // key: ip, value: [timestamp,...]
const recordSet = new Map();  // key: "회사/사번"  value: {time, ...}

// ------ [1] 퀴즈 데이터 ------
const QUIZ_PROBLEMS = [
  { word: "보코더", accepts: ["보코더", "vocoder"] },
  { word: "오디오북", accepts: ["오디오북", "audiobook"] },
  { word: "초분광", accepts: ["초분광", "hyperspectral"] },
  { word: "QR코드", accepts: ["qr코드", "qr code", "QRCode", "큐알코드"] },
  { word: "iot", accepts: ["iot", "아이오티", "IOT"] },
  { word: "tts", accepts: ["tts", "티티에스", "TTS"] },
  { word: "라이다", accepts: ["라이다", "lidar"] },
  { word: "멀티모달", accepts: ["멀티모달", "multimodal"] },
  { word: "로보택시", accepts: ["로보택시", "robotaxi"] },
  { word: "디지털트윈", accepts: ["디지털트윈", "digitaltwin", "digital twin"] },
];

// [추가]
const QUIZ_IMG_FILES = [
  "보코더.png",
  "오디오북.png",
  "초분광.png",
  "큐알.png",
  "아이오티.png",
  "티티에스.png",
  "라이다.png",
  "멀티모달.png",
  "로보택시.png",
  "디지털트윈.png",
];


// 기존 /api/quizimg 삭제하고 아래 추가
app.get('/data/이미지.png', (req, res) => {
  const idx = parseInt(req.query.idx, 10);
  if (isNaN(idx) || idx < 0 || idx >= QUIZ_IMG_FILES.length) {
    return res.status(404).send("이미지 없음");
  }
  const imgPath = path.join(__dirname, "public", "data", QUIZ_IMG_FILES[idx]);
  res.sendFile(imgPath);
});




// ------ [캡차 이미지 발급 API] ------
app.get('/api/captcha', (req, res) => {
  const captcha = svgCaptcha.create({
    noise: 3,
    color: true,
    width: 130,
    height: 44,
    fontSize: 48,
    ignoreChars: '0o1ilI'
  });
  res.cookie('captcha_code', captcha.text, { httpOnly: true, maxAge: 3 * 60 * 1000 });
  res.type('svg');
  res.send(captcha.data);
});

// ------ [캡차 검증 API] ------
app.post('/api/verify-captcha', (req, res) => {
  const userInput = (req.body.value || '').trim().toLowerCase();
  const code = (req.cookies.captcha_code || '').trim().toLowerCase();
  if (userInput && code && userInput === code) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});


// ------ [캡차 쿠키 리셋 API] ------
app.get('/api/captcha/reset', (req, res) => {
  // 쿠키 삭제(만료시킴)
  res.clearCookie('captcha_code');
  res.json({ success: true, message: "캡차 쿠키 리셋됨" });
});


// ------ [정답 비교] ------
function checkCorrect(userInput, accepts) {
  const norm = (s) => (s || "").replace(/\s+/g, "").toLowerCase();
  return accepts.some(ans => norm(ans) === norm(userInput));
}

function getClientIp(req) {
  let ip = req.headers['x-forwarded-for'];
  if (ip) ip = ip.split(',')[0].trim();
  else ip = req.socket.remoteAddress;
  return ip;
}


app.post('/api/count', async (req, res) => {
  // 유저 IP 추적
  const userIp = getClientIp(req);
  try {
    const gsRes = await axios.post(
      "https://script.google.com/macros/s/AKfycbxugcaDUvUwjLShfWLMbsNnwj5_0kW_qGj__y4Exu7gQXunZXxHaMXCYYXRzxMGBx4jTA/exec",
      { ip: userIp }, // ← 반드시 ip를 담아서 보냄!
      { headers: { "Content-Type": "application/json" } }
    );
    res.json(gsRes.data);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "구글 스크립트 에러: " + (err.response?.data?.message || err.message),
    });
  }
});




// ------ [제출 API] ------
app.post('/api/submit', async (req, res) => {
  console.log("[submit] 받은 페이로드:", req.body);
  const { company, employeeId, name, quizResults, startTime, endTime, captchaValue, requireCaptcha } = req.body;

  // 1. 필드체크
  if (!company || !employeeId || !name || !Array.isArray(quizResults) || !startTime || !endTime) {
    return res.status(400).json({ status: "error", message: "누락 필드" });
  }

  // ----- [캡차 검증, 프론트에서 requireCaptcha: true로 보내는 경우만 적용] -----
  if (requireCaptcha) {
    const userInput = (captchaValue || '').trim().toLowerCase();
    const code = (req.cookies.captcha_code || '').trim().toLowerCase();
    if (!userInput || !code || userInput !== code) {
      return res.status(400).json({
        status: "error",
        message: "캡차 인증이 실패했습니다. 다시 시도하세요."
      });
    }
  }

  // 2. 정답 채점
  let correctCount = 0;
  for (let i = 0; i < QUIZ_PROBLEMS.length; i++) {
    const prob = QUIZ_PROBLEMS[i];
    const userAns = quizResults[i]?.userInput;
    if (checkCorrect(userAns, prob.accepts)) correctCount++;
  }

  // 3. 소요시간 산출
  const totalTime = ((endTime - startTime) / 1000);
  const totalTimeStr = totalTime.toFixed(2);

  // 4-1. 비정상적으로 빠른 기록 차단
  const MIN_TIME_SEC = 5;
  if (totalTime < MIN_TIME_SEC) {
    return res.status(400).json({
      status: "error",
      message: "비정상적으로 빠른 기록입니다. 사람이 입력한 기록만 인정됩니다. 직접 타이핑 하신 기록이면 02-820-8269로 연락주세요.",
    });
  } 

  // 4-3. User-Agent 자동화 탐지
  const ua = req.headers['user-agent'] || "";
  if (/selenium|headless|webdriver|python|phantomjs|puppeteer/i.test(ua)) {
    return res.status(400).json({
      status: "error",
      message: "자동화 브라우저로 의심됩니다.",
    });
  }

  // 4-4. 데이터 무결성 체크
  if (quizResults.length !== QUIZ_PROBLEMS.length) {
    return res.status(400).json({ status: "error", message: "정상적인 응답이 아닙니다." });
  }
  for (const a of quizResults) {
    if ((a.userInput || "").length < 2) {
      return res.status(400).json({ status: "error", message: "비정상 응답(답이 너무 짧음)" });
    }
  }

  // 5. 최고기록만 인정 (동일 회사/사번)
  const key = company + "/" + employeeId;
  const prev = recordSet.get(key);
  if (!prev || Number(prev.time) > Number(totalTimeStr)) {
    recordSet.set(key, { company, employeeId, name, time: totalTimeStr, correct: correctCount });
  }

  // 6. 구글 시트 저장
  try {
    const gsRes = await axios.post(
      "https://script.google.com/macros/s/AKfycbygHe7k2HhSo9Exl-a7whiBmvBlk6eSmlMKgVkxOHct3xPvA1eoXszSyvZNRcEU9DAzcQ/exec",
      { company, employeeId, name, timeTaken: totalTimeStr, correctCount, ip: userIp, quizResults },
      { headers: { "Content-Type": "text/plain;charset=utf-8" } }
    );
    res.json({
      status: "success",
      message: "기록 저장 성공!",
      correctCount,
      totalTime: totalTimeStr,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "구글 스크립트 에러: " + (err.response?.data?.message || err.message),
    });
  }
});

// ------ [5] 랭킹 API ------
app.get('/api/ranking', async (req, res) => {
  try {
    const url = "https://script.google.com/macros/s/AKfycbygHe7k2HhSo9Exl-a7whiBmvBlk6eSmlMKgVkxOHct3xPvA1eoXszSyvZNRcEU9DAzcQ/exec?type=ranking";
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
