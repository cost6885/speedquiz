import React, { useEffect, useRef, useState } from "react";

// 효과음: 공개 무료
const portalSound = process.env.PUBLIC_URL + "/data/Portal.mp3";
const swooshSound = process.env.PUBLIC_URL + "/data/swoosh.mp3";


// 카드에 쓸 이미지 or 텍스트
const CARD_IMAGE =
  "https://www.hushwish.com/wp-content/uploads/2020/10/emo_gang_001.gif";

const keyframes = `
@keyframes portal-spin {
  0% { transform: rotate(0deg) scale(1.01);}
  100% { transform: rotate(360deg) scale(1.01);}
}
@keyframes portal-zoom {
  0% { transform: scale(1); opacity: 0.05;}
  70% { transform: scale(1.18); opacity: 1;}
  100% { transform: scale(1.04); opacity: 1;}
}
@keyframes portal-glow {
  0% { box-shadow: 0 0 100px 35px #fff8; }
  100% { box-shadow: 0 0 120px 70px #96fcffc9; }
}
@keyframes swirl-pulse {
  0%, 100% { opacity: 1;}
  35% { opacity: 0.7;}
  65% { opacity: 0.18;}
}
@keyframes card-float {
  0%   { transform: translateY(0) scale(1); }
  80%  { transform: translateY(-30px) scale(1.07);}
  100% { transform: translateY(-30px) scale(1.07);}
}
@keyframes card-suck {
  0% { opacity:1; transform: translateY(-30px) scale(1.07) rotate(0deg);}
  60% { opacity:1; }
  85% { opacity:.95; }
  100% { opacity: 0; transform: translateY(-10px) scale(0.05) rotate(540deg);}
}
`;

function swirlParticle(i, mainColor, secondaryColor) {
  // 입자 수 더 많고 위치 랜덤+회전
  const theta = (i / 20) * 2 * Math.PI;
  const r = 88 + 32 * Math.sin(i * 2.13);
  return {
    left: `${120 + r * Math.cos(theta)}px`,
    top: `${120 + r * Math.sin(theta)}px`,
    width: 18 + (i % 5) * 7,
    height: 14 + (i % 4) * 5,
    background: `radial-gradient(ellipse at 40% 60%, ${mainColor} 70%, ${secondaryColor} 90%, transparent 100%)`,
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(2.5px) brightness(1.6)",
    animation: `swirl-pulse 1.5s cubic-bezier(.7,0,.7,1) infinite both`,
    animationDelay: `${i * 0.07}s`,
    zIndex: 3 + (i % 2),
    opacity: 0.7 + Math.random() * 0.25,
  };
}

const HearthstonePortalLoading = ({ onEnd }) => {
  const [cardAnim, setCardAnim] = useState("float"); // float→suck
  const playedSuck = useRef(false);

  useEffect(() => {
    // 사운드: 포탈 효과
    const portal = new Audio(portalSound);
    portal.volume = 0.85;
    portal.play();
    // 1.1초 후 카드 빨려들기(swoosh)
    const t1 = setTimeout(() => {
      setCardAnim("suck");
      if (!playedSuck.current) {
        playedSuck.current = true;
        const swoosh = new Audio(swooshSound);
        swoosh.volume = 0.9;
        swoosh.play();
      }
    }, 1100);
    // 1.65초 후 onEnd 콜백 (퀴즈 시작)
    const t2 = setTimeout(() => {
      onEnd && onEnd();
    }, 1650);
    return () => {
      portal.pause();
      portal.currentTime = 0;
      playedSuck.current = true;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onEnd]);

  // 색상 커스텀!
  const mainGlow = "#fff2b6";
  const portalColor = "#38e5ff";
  const portalShadow = "#57fffe";
  const swirlMain = "#34f7ff";
  const swirlSecond = "#bb9fff";

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background:
          "radial-gradient(ellipse at 52% 54%, #27144a 40%, #092031 100%)",
        zIndex: 10020,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <style>{keyframes}</style>
      {/* 소용돌이+빛+입자 */}
      <div
        style={{
          width: 270,
          height: 270,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at 60% 48%, ${portalColor} 29%, #b0ecff 60%, transparent 100%)`,
          boxShadow: `0 0 120px 40px ${portalShadow}, 0 0 180px 90px #eaffff66, 0 0 140px 38px #85e8ffaa`,
          border: `8px solid ${mainGlow}`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "portal-zoom 1.7s cubic-bezier(.95,1.7,.61,1) forwards",
        }}
      >
        {/* 소용돌이 테두리 */}
        <div
          style={{
            position: "absolute",
            width: 250,
            height: 250,
            left: 10,
            top: 10,
            borderRadius: "50%",
            border: `6px solid #fff4`,
            opacity: 0.8,
            boxShadow: `0 0 66px 11px ${swirlMain}55`,
            filter: "blur(1.3px)",
            animation: "portal-spin 1.1s linear infinite",
            zIndex: 2,
          }}
        />
        {/* 휘몰아치는 입자 (20개!) */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={swirlParticle(i, swirlMain, swirlSecond)} />
        ))}
        {/* 포탈 중심 Glow */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 55% 50%, #fff 60%, #edffffbb 100%, transparent 120%)",
            boxShadow: "0 0 110px 38px #f7fbffd5, 0 0 180px 40px #b0ecffaa",
            border: "6px solid #f3fdff",
            animation:
              "portal-glow 1.7s cubic-bezier(.65,0,.85,1) infinite alternate",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            left: 65,
            top: 65,
            zIndex: 3,
          }}
        >
          {/* 중앙 빛 */}
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 45% 52%, #fff, #effcff 77%, transparent 100%)",
              opacity: 0.96,
              boxShadow: "0 0 48px 12px #fff9",
              zIndex: 4,
            }}
          />
        </div>
        {/* 💳 카드! (빨려들기) */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 98,
            height: 136,
            zIndex: 6,
            transform: "translate(-50%,-68%)",
            background: "#222",
            borderRadius: 14,
            boxShadow: "0 6px 20px #0339, 0 0 24px #00d6ff99",
            overflow: "hidden",
            animation:
              cardAnim === "float"
                ? "card-float 1.1s cubic-bezier(.7,1.5,.45,.98) forwards"
                : "card-suck 0.5s cubic-bezier(.1,1.2,.6,1) forwards",
          }}
        >
          <img
            src={CARD_IMAGE}
            alt="카드"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "cover",
              borderRadius: 0,
            }}
          />
        </div>
      </div>
      {/* 문구 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "17vh",
          textAlign: "center",
          color: "#fff",
          fontSize: 36,
          fontWeight: 900,
          textShadow: "0 2px 28px #00e7ff, 0 0 18px #fff, 0 0 16px #ffd80077",
          letterSpacing: "0.09em",
          pointerEvents: "none",
          userSelect: "none",
          animation: "fade-in 1s",
        }}
      >
        <span
          style={{
            background:
              "linear-gradient(90deg, #fffabf 0%, #45f6ff 60%, #f9ddff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 2px 10px #d3f2ff77)",
          }}
        >
          곧 시작됩니다
        </span>
      </div>
    </div>
  );
};

export default HearthstonePortalLoading;
