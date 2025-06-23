// src/components/EventPrizeBoard.js
import React from "react";

const PRIZES = [
  {
    rank: "🥇 1등",
    title: "육개장 사발면 도자기 세트2",
    img: "https://www.nongshimmall.com/web/product/big/202506/0a3ae33f8d10f7b79873d88ad1bc91bc.jpg",
    desc: "든든+센스 만렙 세트!",
  },
  {
    rank: "🥈 2등",
    title: "둥지메일배홍동세트 17입",
    img: "https://www.nongshimmall.com/web/product/big/202505/0fc6d58c9dfcf5e894142ef86324010c.jpg",
    desc: "화끈하게 쟁여먹기!",
  },
  {
    rank: "🥉 3등",
    title: "먹태+소금+초코+신라면더레드큰사발_8입",
    img: "https://www.nongshimmall.com/web/product/big/202406/da6afce18f7b47ba80b050f20d898326.jpg",
    desc: "스낵 & 라면 퍼펙트 콜라보",
  },
  {
    rank: "4~10등",
    title: "스타벅스 아이스 아메리카노 1잔",
    img: "https://www.biz-con.co.kr/upload/images/202501/400_20250122164028679_2.jpg",
    desc: "아쉽지만 시원한 커피라도 한 잔",
  },
  {
    rank: "참여 추첨",
    title: "스타벅스 아이스 아메리카노 1잔 (추첨 5명)",
    img: "https://www.biz-con.co.kr/upload/images/202501/400_20250122164028679_2.jpg",
    desc: "도전만 해도 행운의 기회!",
  },
];

export default function EventPrizeBoard({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9001,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.37)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          minWidth: 370,
          maxWidth: 460,
          maxHeight: 580,
          borderRadius: 22,
          boxShadow: "0 10px 40px #1117",
          padding: "34px 26px 28px",
          position: "relative",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: 16,
            top: 10,
            background: "none",
            border: "none",
            fontSize: 25,
            color: "#7cb1be",
            cursor: "pointer",
          }}
        >
          ×
        </button>
        <h2
          style={{
            textAlign: "center",
            marginBottom: 12,
            fontWeight: 800,
            fontSize: 23,
            letterSpacing: ".03em",
            color: "#1e7cb9",
          }}
        >
          🎁 <span style={{ color: "#ff8448" }}>이벤트 상품</span> 안내
        </h2>
        <div
          style={{
            fontSize: 15,
            color: "#555",
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          스피드 퀴즈 랭킹에 따라
          <br />
          아래와 같은 선물을 드려요!
        </div>
        {PRIZES.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              margin: "22px 0",
              padding: "16px 7px 16px 9px",
              background: i < 3 ? "#fafdff" : "#fff",
              borderRadius: 14,
              boxShadow: i < 3 ? "0 2px 15px #aed3ff1b" : "none",
              border: i < 3 ? "1.6px solid #bbdaf9" : "1px solid #e8f0ff",
            }}
          >
            <img
              src={item.img}
              alt={item.title}
              style={{
                width: 76,
                height: 76,
                objectFit: "cover",
                borderRadius: 12,
                border: "2.3px solid #f5f9ff",
                boxShadow: "0 2px 8px #bde1fd38",
                background: "#f5f8fa",
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 18,
                  color: "#2266d7",
                  marginBottom: 1,
                  letterSpacing: ".02em",
                }}
              >
                {item.rank}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#333" }}>
                {item.title}
              </div>
              <div style={{ fontSize: 13, color: "#477", marginTop: 3 }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
        <div
          style={{
            margin: "17px 0 0",
            color: "#999",
            textAlign: "left",
            fontSize: 13.5,
          }}
        >
          ※ 게임 프로그램의 취약점 또는 자동입력 프로그램을 이용한 이벤트 응모
          시, <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;당첨에서 취소될 수 있습니다.
          <br />※ 이벤트 상품은 변경될 수 있습니다.
        </div>
      </div>
    </div>
  );
}
