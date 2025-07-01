// TextToImage.js
import React, { useRef, useEffect } from "react";

function TextToImage({ text, width = 400, height = 120 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fffc";
    ctx.fillRect(0, 0, width, height);
    ctx.font = "bold 20px Pretendard, sans-serif";
    ctx.fillStyle = "#223";
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      ctx.fillText(line, 16, 36 + 28 * i);
    });
  }, [text, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}

export default TextToImage;
