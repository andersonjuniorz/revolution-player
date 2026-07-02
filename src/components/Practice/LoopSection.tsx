import React from "react";
import { useApp } from "../../context/AppContext";
import { useTranslation } from "react-i18next";

export const LoopSection: React.FC = () => {
  const { currentTime, loopABStart, loopABEnd, isLoopABActive, setABLoop, clearABLoop } = useApp();
  const { t } = useTranslation();

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
      <span className="practice-section-title">{t("practice.loop")}</span>

      <div className="loop-status">
        <span>
          {t("practice.pointA")}{" "}
          {loopABStart !== null ? (
            <span className="loop-val">{formatTime(loopABStart)}</span>
          ) : (
            t("practice.unmarked")
          )}
        </span>
        <span>
          {t("practice.pointB")}{" "}
          {loopABEnd !== null ? (
            <span className="loop-val">{formatTime(loopABEnd)}</span>
          ) : (
            t("practice.unmarked")
          )}
        </span>
      </div>

      <div className="loop-buttons">
        <button
          className={`btn-loop ${loopABStart !== null && !isLoopABActive ? "active" : ""}`}
          onClick={handleSetA}
        >
          A
        </button>
        <button className={`btn-loop ${isLoopABActive ? "active" : ""}`} onClick={handleSetB}>
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
