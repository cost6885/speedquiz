// src/api/submitRecord.js (프론트)
const API_URL = "/api/submit";

export default async function submitRecord(data) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    return { status: "error", message: "기록 제출에 실패했어요 😢" };
  }
}
