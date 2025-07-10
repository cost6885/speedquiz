// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const svgCaptcha = require('svg-captcha');
const cookieParser = require('cookie-parser');
const app = express();
const path = require("path");
const crypto = require('crypto');

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

// ------ [세션별 토큰-이미지 매핑 저장소] ------
const sessionImgTokenMap = {}; // { sessionId: { token: imgFilename, ... } }
const SESSION_EXPIRE_MS = 20 * 60 * 1000; // 20분, 만료청소는 미구현(필요시 setInterval로)

// ------ [셔플 함수] ------
function shuffle(array) {
  return array
    .map((v) => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ v }) => v);
}

// ------ [문제+이미지+토큰+세션ID 발급 API] ------
app.get('/api/problems', (req, res) => {
  // [1] 문제-이미지 쌍 배열
  const problemPairs = QUIZ_PROBLEMS.map((prob, idx) => ({
    ...prob,
    imgFile: QUIZ_IMG_FILES[idx],
  }));

  // [2] 쌍 배열을 셔플
  const shuffledPairs = shuffle(problemPairs);

  // [3] 이미지별 토큰 생성 (셔플 순서대로)
  const imgTokenMap = {};
  const imgTokenReverseMap = {};
  shuffledPairs.forEach((pair) => {
    const token = crypto.randomBytes(8).toString('hex');
    imgTokenMap[token] = pair.imgFile;
    imgTokenReverseMap[pair.imgFile] = token;
  });

  // [4] 세션ID 생성, 매핑 저장
  const sessionId = crypto.randomBytes(10).toString('hex');
  sessionImgTokenMap[sessionId] = imgTokenMap;

  // [5] 문제+이미지+토큰 매칭
  const problemsWithImg = shuffledPairs.map((pair) => ({
    word: pair.word,
    accepts: pair.accepts,
    descImg: `/quizimg/${imgTokenReverseMap[pair.imgFile]}?session=${sessionId}`,
  }));

  res.json({ problems: problemsWithImg, sessionId });
});


// ------ [이미지 서빙 API (토큰 + 세션)] ------
app.get('/quizimg/:token', (req, res) => {
  const sessionId = req.query.session;
  const imgTokenMap = sessionImgTokenMap[sessionId];
  if (!imgTokenMap) return res.status(404).send("세션 만료 또는 잘못된 세션ID");
  const fname = imgTokenMap[req.params.token];
  if (!fname) return res.status(404).send("이미지 없음");
  const imgPath = path.join(__dirname, "public", "data", fname);
  res.sendFile(imgPath);
});

// ------ [정적파일 serve] ------
app.use('/data', express.static(path.join(__dirname, 'public', 'data')));

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
  const userIp = getClientIp(req);
  try {
    const gsRes = await axios.post(
      "https://script.google.com/macros/s/AKfycbxugcaDUvUwjLShfWLMbsNnwj5_0kW_qGj__y4Exu7gQXunZXxHaMXCYYXRzxMGBx4jTA/exec",
      { ip: userIp },
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
  const userIp = getClientIp(req);
  console.log("[submit] 받은 페이로드:", req.body);
  const { company, employeeId, name, quizResults, startTime, endTime, captchaValue, requireCaptcha } = req.body;

  if (!company || !employeeId || !name || !Array.isArray(quizResults) || !startTime || !endTime) {
    return res.status(400).json({ status: "error", message: "누락 필드" });
  }
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
  let correctCount = 0;
  for (let i = 0; i < QUIZ_PROBLEMS.length; i++) {
    const prob = QUIZ_PROBLEMS[i];
    const userAns = quizResults[i]?.userInput;
    if (checkCorrect(userAns, prob.accepts)) correctCount++;
  }
  const totalTime = ((endTime - startTime) / 1000);
  const totalTimeStr = totalTime.toFixed(2);
  const MIN_TIME_SEC = 5;
  if (totalTime < MIN_TIME_SEC) {
  // 👇 부정행위자 이름으로 앱스크립트에 저장
  try {
    await axios.post(
      "https://script.google.com/macros/s/AKfycbygHe7k2HhSo9Exl-a7whiBmvBlk6eSmlMKgVkxOHct3xPvA1eoXszSyvZNRcEU9DAzcQ/exec",
      {
        company: "부정행위자",
        employeeId,
        name,
        timeTaken: totalTimeStr,
        correctCount: quizResults.filter((a, idx) =>
          checkCorrect(a?.userInput, QUIZ_PROBLEMS[idx].accepts)
        ).length,
        ip: userIp,
        quizResults
      },
      { headers: { "Content-Type": "text/plain;charset=utf-8" } }
    );
  } catch (err) {
    console.error("부정행위 기록 발송 실패", err.message);
  }
  // 사용자에겐 경고만 전달
  return res.status(400).json({
    status: "error",
    message: "비정상적으로 빠른 기록입니다. 사람이 입력한 기록만 인정됩니다. 직접 타이핑 하신 기록이면 02-820-8269로 연락주세요.",
  });
}
  const ua = req.headers['user-agent'] || "";
  if (/selenium|headless|webdriver|python|phantomjs|puppeteer/i.test(ua)) {
    return res.status(400).json({
      status: "error",
      message: "자동화 브라우저로 의심됩니다.",
    });
  }
  if (quizResults.length !== QUIZ_PROBLEMS.length) {
    return res.status(400).json({ status: "error", message: "정상적인 응답이 아닙니다." });
  }
  for (const a of quizResults) {
    if ((a.userInput || "").length < 2) {
      return res.status(400).json({ status: "error", message: "비정상 응답(답이 너무 짧음)" });
    }
  }
  const key = company + "/" + employeeId;
  const prev = recordSet.get(key);
  if (!prev || Number(prev.time) > Number(totalTimeStr)) {
    recordSet.set(key, { company, employeeId, name, time: totalTimeStr, correct: correctCount });
  }
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
