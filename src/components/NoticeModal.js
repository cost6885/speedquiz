import React, { useEffect } from "react";

const modalStyle = {
  position: "fixed",
  zIndex: 2000,
  left: 0,
  top: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(45,55,79,0.43)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const contentStyle = {
  background: "#fff",
  borderRadius: 16,
  padding: "32px 30px 18px",
  boxShadow: "0 8px 40px #1b214033",
  fontSize: 24,
  fontWeight: 500,
  lineHeight: 1.6,
  textAlign: "center",
  maxWidth: 440,
  width: "96vw",
};

export default function NoticeModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 100000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <div
          style={{
            fontWeight: 800,
            color: "#165ba7",
            fontSize: 35,
            marginBottom: 6,
          }}
        >
          이벤트 안내
        </div>
        <div>
          본 이벤트는 농심그룹 임직원 여러분이
          <br />
          <b>
            DT용어에 보다 친숙해지기 위한 목적으로 <br />
            진행
          </b>
          되고 있습니다.
          <br />
          <br />
          이벤트 취지에 맞지 않게{" "}
          <b>
            프로그램을 <br />
            이용한 참여는 금지
          </b>
          하여 주시기 바라며,
          <br />
          <b>
            직접 타이핑하여 달성하기 어려울 것으로 <br />
            보여지는 기록
          </b>
          으로 응모하신 분께는
          <br />
          <b>공정한 이벤트 운영을 위해 증빙 요청</b>
          <br />을 드릴 예정이니 협조 부탁드립니다.
          <br />
          <br />
          감사합니다.
        </div>
        <button
          style={{
            marginTop: 24,
            fontSize: 17,
            background: "#165ba7",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 30px",
            cursor: "pointer",
            fontWeight: 700,
            boxShadow: "0 2px 12px #e0e8ff44",
          }}
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  );
}
