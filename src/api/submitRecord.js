// src/api/submitRecord.js

// Google Apps Script 웹앱 배포 후 url 복사해서 아래에 붙여넣기
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzRfrffVsLeUdwTqFx38pfv_sOFJzEaDd-LHDCPwCh3BsdufU0sqT_hI9K5HLtJHOQb8g/exec";

export default async function submitRecord(data) {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      //   headers: { "Content-Type": "application/json" }, // ← 여기!
      mode: "cors",
      body: JSON.stringify(data),
    });
    // 결과를 json으로 받아서 반환 (Apps Script 응답이 json)
    return await res.json();
  } catch (err) {
    return { status: "error", message: "기록 제출에 실패했어요 😢" };
  }
}
