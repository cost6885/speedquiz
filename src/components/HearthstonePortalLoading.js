// src/components/HearthstonePortalLoading.js
import React, { useEffect, useRef } from "react";

const portalStyles = {
  position: "fixed",
  top: "0", left: "0", width: "100vw", height: "100vh",
  background: "radial-gradient(circle at 50% 50%, #181b2b 0%, #0b0d17 100%)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 9999,
  transition: "opacity 0.3s"
};

export default function HearthstonePortalLoading({ onEnd }) {
  const portalRef = useRef();

  useEffect(() => {
    // 1.5초 후 자동 onEnd 콜백 (로딩 종료)
    const timer = setTimeout(onEnd, 1500);
    return () => clearTimeout(timer);
  }, [onEnd]);

  return (
    <div style={portalStyles}>
      <style>{`
        @keyframes vortex {
          0% { transform: scale(1) rotate(0deg); opacity: 1;}
          70% { transform: scale(0.5) rotate(420deg); opacity: 1;}
          100% { transform: scale(0) rotate(900deg); opacity: 0;}
        }
        .vortex-card {
          width: 230px; height: 320px;
          background: linear-gradient(135deg, #218fff 40%, #6fe7c1 100%);
          border-radius: 24px 24px 18px 18px / 30px 30px 20px 20px;
          box-shadow: 0 12px 40px #1e90ff70, 0 1px 2px #3333a933;
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; color: #fff; font-family: 'Orbitron', sans-serif;
          font-weight: 900; letter-spacing: 0.07em;
          filter: drop-shadow(0 0 40px #57e7d7);
          animation: vortex 1.5s cubic-bezier(.2,.7,.58,1.23) forwards;
          position: relative;
          overflow: hidden;
        }
        .portal-glow {
          position: absolute;
          top: 60%; left: 50%; transform: translate(-50%,-50%);
          width: 260px; height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, #3bf2e699 0%, #218fff33 60%, #0b0d1700 100%);
          box-shadow: 0 0 80px 18px #3bf2e6aa;
          z-index: -1;
          filter: blur(3px);
        }
        .loading-text {
          position: absolute;
          bottom: 32px; left: 0; right: 0;
          text-align: center;
          color: #8fdcff;
          font-size: 25px;
          letter-spacing: 0.12em;
          text-shadow: 0 2px 16px #0098ff88, 0 1px 2px #0006;
          font-weight: 800;
          animation: blink 1.1s infinite alternate;
        }
        @keyframes blink {
          0% { opacity: 1;}
          100% { opacity: 0.7;}
        }
      `}</style>
      <div className="vortex-card" ref={portalRef}>
        <span>게임<br/>시작!</span>
        <div className="portal-glow" />
        <div className="loading-text">로딩중...</div>
      </div>
    </div>
  );
}
