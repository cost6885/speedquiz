// server.js (Express 예시)
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzRfrffVsLeUdwTqFx38pfv_sOFJzEaDd-LHDCPwCh3BsdufU0sqT_hI9K5HLtJHOQb8g/exec";

app.post('/api/submit', async (req, res) => {
  const { company, employeeId, name, timeTaken } = req.body;
  // 유효성 검사
  if (!company || !employeeId || !name || !timeTaken) {
    return res.status(400).json({ status: "error", message: "누락 필드" });
  }
  // 구글스크립트로 서버사이드에서 POST
  try {
    const gsRes = await axios.post(GOOGLE_SCRIPT_URL, {
      company, employeeId, name, timeTaken,
      // 필요하다면 백엔드에서 sign, token 등 추가 보안
    }, {
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    });
    res.json(gsRes.data); // 그대로 프론트에 반환
  } catch (err) {
    res.status(500).json({ status: "error", message: "구글 스크립트 에러" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server on ${PORT}`));
