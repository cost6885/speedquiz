// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// 미들웨어
app.use(express.json());
app.use(cors());

// 구글 앱스크립트 웹앱 URL (엔드포인트는 exec)
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzRfrffVsLeUdwTqFx38pfv_sOFJzEaDd-LHDCPwCh3BsdufU0sqT_hI9K5HLtJHOQb8g/exec";

// [제출] POST /api/submit
app.post('/api/submit', async (req, res) => {
  const { company, employeeId, name, timeTaken } = req.body;
  // 1. 유효성 검사
  if (!company || !employeeId || !name || !timeTaken) {
    return res.status(400).json({ status: "error", message: "누락 필드" });
  }
  // 2. 서버사이드에서 Google Apps Script 호출
  try {
    const gsRes = await axios.post(
      GOOGLE_SCRIPT_URL,
      { company, employeeId, name, timeTaken },
      { headers: { "Content-Type": "text/plain;charset=utf-8" } }
    );
    res.json(gsRes.data); // 구글스크립트 결과 프론트로 그대로
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "구글 스크립트 에러: " + (err.response?.data?.message || err.message),
    });
  }
});

// [랭킹] GET /api/ranking
app.get('/api/ranking', async (req, res) => {
  try {
    const url = GOOGLE_SCRIPT_URL + "?type=ranking";
    const gsRes = await axios.get(url);
    res.json(gsRes.data); // 구글스크립트 결과 프론트로 그대로
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "구글 스크립트 에러: " + (err.response?.data?.message || err.message),
    });
  }
});

// 서버 실행
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ API server on http://localhost:${PORT}`));
