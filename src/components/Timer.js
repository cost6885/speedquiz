import React from "react";

const Timer = ({ time = 0, running = false }) => {
  // time: ms단위, running: 필요하면 받아둠(여유)
  const sec = Math.floor((time || 0) / 1000);
  return <div className="timer">⏰ {sec}초</div>;
};

export default Timer;
