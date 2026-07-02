import React from "react";
import { useApp } from "../context/AppContext";
import { FolderOpen, RefreshCw } from "lucide-react";
import { TrackTable } from "../components/TrackTable/TrackTable";
import { useTranslation } from "react-i18next";

export const LibraryPage: React.FC = () => {
  const { tracks, isScanning, scanProgress, refreshLocalDirectory } = useApp();
  const { t } = useTranslation();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header My Library */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            margin: 0,
            color: "var(--text-light)",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}
        >
          <FolderOpen size={28} />
          {t("myLibrary")}
        </h1>

        <button
          onClick={() => refreshLocalDirectory()}
          disabled={isScanning}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-divider)",
            borderRadius: "8px",
            color: "var(--text-primary)",
            cursor: isScanning ? "not-allowed" : "pointer",
            opacity: isScanning ? 0.5 : 1,
            transition: "all 0.2s ease"
          }}
        >
          <RefreshCw size={18} className={isScanning ? "spin-animation" : ""} />
          {isScanning ? t("checking") : t("refresh")}
        </button>
      </div>

      {/* Visual da Barra de Progresso de Scan (sem o card desnecessário) */}
      {isScanning && (
        <div className="scan-progress-bar-container">
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
            <span style={{ color: "var(--accent-primary)", fontWeight: 500 }}>
              {t("ui.readingAudioFiles")}
            </span>
            <span>{scanProgress}%</span>
          </div>
          <div className="scan-progress-bar-bg">
            <div className="scan-progress-bar-fill" style={{ width: `${scanProgress}%` }} />
          </div>
        </div>
      )}

      {/* Listagem das Músicas da Biblioteca Local Ativa */}
      <div>
        <div className="section-title">
          {t("ui.activeFolderSongs")} ({tracks.length})
        </div>

        {tracks.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>{t("ui.noSongsFound")}</p>
        ) : (
          <TrackTable tracks={tracks} />
        )}
      </div>
    </div>
  );
};
