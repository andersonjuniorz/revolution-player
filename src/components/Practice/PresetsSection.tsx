import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Save, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PracticePreset {
  id: string;
  name: string;
  speed: number;
  pitch: number;
  loopStart: number | null;
  loopEnd: number | null;
}

export const PresetsSection: React.FC = () => {
  const { playbackRate, pitch, loopABStart, loopABEnd, setPlaybackRate, setPitch, setABLoop } =
    useApp();
  const { t } = useTranslation();

  const [presets, setPresets] = useState<PracticePreset[]>([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("practice_presets");
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing practice presets:", e);
      }
    }
  }, []);

  const savePresets = (newPresets: PracticePreset[]) => {
    setPresets(newPresets);
    localStorage.setItem("practice_presets", JSON.stringify(newPresets));
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const preset: PracticePreset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.trim(),
      speed: playbackRate,
      pitch: pitch,
      loopStart: loopABStart,
      loopEnd: loopABEnd
    };

    savePresets([...presets, preset]);
    setNewPresetName("");
    setShowSaveForm(false);
  };

  const handleLoadPreset = (preset: PracticePreset) => {
    setPlaybackRate(preset.speed);
    setPitch(preset.pitch);
    setABLoop(preset.loopStart, preset.loopEnd);
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    savePresets(presets.filter((p) => p.id !== id));
  };

  return (
    <div className="practice-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="practice-section-title">{t("practice.presets")}</span>
        {!showSaveForm && (
          <button
            onClick={() => setShowSaveForm(true)}
            className="btn-preset"
            style={{ width: "auto", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <Save size={12} /> {t("practice.save")}
          </button>
        )}
      </div>

      {showSaveForm && (
        <form
          onSubmit={handleSavePreset}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        >
          <input
            type="text"
            className="scanner-input"
            style={{ fontSize: "0.85rem", padding: "6px" }}
            placeholder={t("practice.presetNamePlaceholder")}
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            autoFocus
          />
          <div style={{ display: "flex", gap: "6px" }}>
            <button type="button" className="btn-preset" onClick={() => setShowSaveForm(false)}>
              {t("ui.cancel")}
            </button>
            <button
              type="submit"
              className="btn-preset"
              style={{ borderColor: "var(--accent-primary)" }}
            >
              {t("practice.saveBtn")}
            </button>
          </div>
        </form>
      )}

      <div className="preset-list">
        {presets.length === 0 ? (
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>
            {t("practice.noPresets")}
          </span>
        ) : (
          presets.map((preset) => (
            <div key={preset.id} className="preset-card" onClick={() => handleLoadPreset(preset)}>
              <div>
                <div style={{ fontWeight: 500 }}>{preset.name}</div>
                <div className="preset-meta">
                  {preset.speed.toFixed(2)}x |{" "}
                  {preset.pitch > 0 ? `+${preset.pitch}` : preset.pitch}st
                  {preset.loopStart !== null && ` | ${t("practice.loopActive")}`}
                </div>
              </div>
              <button
                className="btn-remove-folder"
                onClick={(e) => handleDeletePreset(preset.id, e)}
                title={t("practice.deletePreset")}
              >
                <Trash size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
