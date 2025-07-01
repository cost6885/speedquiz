import React, { useEffect, useRef } from "react";

const portalSound = process.env.PUBLIC_URL + "/data/Portal.mp3";
const swooshSound = process.env.PUBLIC_URL + "/data/swoosh.mp3";
const CARD_IMAGE =
  "https://www.hushwish.com/wp-content/uploads/2020/10/emo_gang_001.gif";

const keyframes = `
@keyframes swirl-rotate {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
@keyframes card-float {
  0%   { transform: translateY(-40px) scale(1.08) rotate(-9deg);}
  100% { transform: translateY(-70px) scale(1.17) rotate(-13deg);}
}
@keyframes card-suck {
  0%   { opacity:1; transform: translateY(-70px) scale(1.17) rotate(-13deg);}
  70%  { opacity:.98; filter: brightness(1.2);}
  100% { opacity: 0; transform: translateY(-30px) scale(0.09) rotate(460deg) skewX(38deg); filter: blur(11px) brightness(2);}
}
`;

function FractalAura({ size = 520 }) {
  // SVG: fractalNoise를 이용한 irregular smoke aura!
  return (
    <svg
      width={size}
      height={size}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <defs>
        {/* 불규칙한 오로라(연기) 필터 */}
        <filter id="cloudyAura" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.022 0.06"
            numOctaves="3"
            seed="10"
            result="noise"
          />
          <feDisplacementMap
            in2="noise"
            in="SourceGraphic"
            scale="40"
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 1.7 0"
          />
        </filter>
      </defs>
      {/* 불규칙 연기 원 */}
      <ellipse
        cx={size / 2}
        cy={size / 2}
        rx={size * 0.47}
        ry={size * 0.47}
        fill="#fff"
        opacity={0.39}
        filter="url(#cloudyAura)"
      />
      {/* 중앙 Glow 좀 더 */}
      <ellipse
        cx={size / 2}
        cy={size / 2}
        rx={size * 0.35}
        ry={size * 0.35}
        fill="#fff"
        opacity={0.11}
        style={{ filter: "blur(37px)" }}
      />
    </svg>
  );
}

const HearthstonePortalLoading = ({ onEnd }) => {
  const [cardAnim, setCardAnim] = React.useState("float");
  const playedSuck = useRef(false);

  useEffect(() => {
    const portal = new Audio(portalSound);
    portal.volume = 0.9;
    portal.play();
    const t1 = setTimeout(() => {
      setCardAnim("suck");
      if (!playedSuck.current) {
        playedSuck.current = true;
        const swoosh = new Audio(swooshSound);
        swoosh.volume = 1;
        swoosh.play();
      }
    }, 1200);
    const t2 = setTimeout(() => {
      onEnd && onEnd();
    }, 1700);
    return () => {
      portal.pause();
      portal.currentTime = 0;
      playedSuck.current = true;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onEnd]);

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background:
          "radial-gradient(ellipse at 53% 51%, #06070b 50%, #191a22 100%)",
        zIndex: 10020,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <style>{keyframes}</style>
      {/* ======= 비정형 연기 오라 ======= */}
      <div
        style={{
          width: 520,
          height: 520,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "swirl-rotate 3.9s linear infinite",
        }}
      >
        <FractalAura size={520} />
        {/* 중앙 블랙홀 */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 400,
            height: 400,
            background: "#070707",
            borderRadius: "50%",
            boxShadow:
              "0 0 95px 35px #fff8, 0 0 300px 120px #222b, 0 0 220px 56px #eee3",
            transform: "translate(-50%,-50%)",
            zIndex: 8,
          }}
        />
        {/* 카드 빨려들기 */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 120,
            height: 170,
            zIndex: 10,
            transform: "translate(-50%,-90%)",
            background: "#18181c",
            borderRadius: 18,
            boxShadow: "0 7px 38px #000a, 0 0 32px #fff2",
            overflow: "hidden",
            animation:
              cardAnim === "float"
                ? "card-float 1.3s cubic-bezier(.8,1.4,.45,1) forwards"
                : "card-suck 0.62s cubic-bezier(.22,1.1,.77,1.0) forwards",
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
              filter:
                "brightness(0.98) grayscale(0.03) drop-shadow(0 0 15px #fff8)",
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
          fontSize: 38,
          fontWeight: 900,
          textShadow: "0 2px 18px #000, 0 0 12px #fff, 0 0 10px #000a",
          letterSpacing: "0.09em",
          pointerEvents: "none",
          userSelect: "none",
          animation: "fade-in 1s",
          zIndex: 99999,
        }}
      >
        <span
          style={{
            background: "linear-gradient(90deg, #fff 0%, #aaa 80%, #fff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 2px 10px #2229)",
          }}
        >
          곧 시작됩니다
        </span>
      </div>
    </div>
  );
};

export default HearthstonePortalLoading;
