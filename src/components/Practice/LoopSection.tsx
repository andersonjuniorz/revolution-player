import React from "react";
import { useApp } from "../../context/AppContext";

export const LoopSection: React.FC = () => {
  const { currentTime, loopABStart, loopABEnd, isLoopABActive, setABLoop, clearABLoop } = useApp();

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSetA = () => {
    setABLoop(currentTime, loopABEnd);
  };

  const handleSetB = () => {
    if (loopABStart !== null && currentTime > loopABStart) {
      setABLoop(loopABStart, currentTime);
    } else {
      setABLoop(loopABStart, currentTime);
    }
  };

  return (
    <div className="practice-section">
      <span className="practice-section-title">Loop A/B</span>
      
      <div className="loop-status">
        <span>Ponto A: {loopABStart !== null ? <span className="loop-val">{formatTime(loopABStart)}</span> : "não marcado"}</span>
        <span>Ponto B: {loopABEnd !== null ? <span className="loop-val">{formatTime(loopABEnd)}</span> : "não marcado"}</span>
      </div>

      <div className="loop-buttons">
        <button
          className={`btn-loop ${loopABStart !== null && !isLoopABActive ? "active" : ""}`}
          onClick={handleSetA}
        >
          A
        </button>
        <button
          className={`btn-loop ${isLoopABActive ? "active" : ""}`}
          onClick={handleSetB}
        >
          B
        </button>
        
        {loopABStart !== null && (
          <button className="btn-loop btn-loop-clear" onClick={clearABLoop}>
            Limpar Loop
          </button>
        )}
      </div>
    </div>
  );
};
