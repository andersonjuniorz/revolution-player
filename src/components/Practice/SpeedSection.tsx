import React from "react";
import { useApp } from "../../context/AppContext";
import { useTranslation } from "react-i18next";

export const SpeedSection: React.FC = () => {
  const { playbackRate, setPlaybackRate } = useApp();
  const { t } = useTranslation();
  const speedPresets = [0.75, 0.9, 1.0, 1.1, 1.25];

  return (
    <div className="practice-section">
      <div className="control-slider-group">
        <div className="slider-header">
          <span className="practice-section-title">{t("practice.speed")}</span>
          <span className="slider-value">{playbackRate.toFixed(2)}x</span>
        </div>

        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.05"
          value={playbackRate}
          onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
          className="premium-slider"
        />

        <div className="pitch-presets" style={{ flexWrap: "wrap" }}>
          {speedPresets.map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackRate(speed)}
              className="btn-preset"
              style={{
                borderColor: playbackRate === speed ? "var(--accent-primary)" : "",
                color: playbackRate === speed ? "var(--text-light)" : "",
                flex: "1 0 calc(33% - 6px)" // Allow it to wrap and take roughly a third
              }}
            >
              {speed.toFixed(2)}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
