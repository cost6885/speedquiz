import React, { useEffect, useState } from "react";

const Timer = () => {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <div className="timer">⏰ {sec}초</div>;
};

export default Timer;
