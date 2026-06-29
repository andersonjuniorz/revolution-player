import React from "react";
import { useApp } from "../../context/AppContext";

export const PitchSection: React.FC = () => {
  const { pitch, setPitch } = useApp();
  const pitchPresets = [-2, -1, 0, 1, 2];

  return (
    <div className="practice-section">
      <div className="control-slider-group">
        <div className="slider-header">
          <span className="practice-section-title">Ajuste de Tom (Pitch)</span>
          <span className="slider-value">
            {pitch > 0 ? `+${pitch}` : pitch} {Math.abs(pitch) === 1 ? "semitom" : "semitons"}
          </span>
        </div>

        <input
          type="range"
          min="-12"
          max="12"
          step="1"
          value={pitch}
          onChange={(e) => setPitch(parseInt(e.target.value))}
          className="premium-slider"
        />

        <div className="pitch-presets" style={{ flexWrap: "wrap" }}>
          {pitchPresets.map((semitone) => (
            <button
              key={semitone}
              onClick={() => setPitch(semitone)}
              className="btn-preset"
              style={{
                borderColor: pitch === semitone ? "var(--accent-primary)" : "",
                color: pitch === semitone ? "var(--text-light)" : "",
                flex: "1 0 calc(33% - 6px)"
              }}
            >
              {semitone > 0 ? `+${semitone}` : semitone}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
