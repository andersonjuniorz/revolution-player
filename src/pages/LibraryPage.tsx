import React from "react";
import { useApp } from "../context/AppContext";
import { FolderOpen } from "lucide-react";
import { TrackTable } from "../components/TrackTable/TrackTable";

export const LibraryPage: React.FC = () => {
  const { tracks, isScanning, scanProgress } = useApp();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header My Library */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0, color: "var(--text-light)", display: "flex", alignItems: "center", gap: "12px" }}>
          <FolderOpen size={28} />
          My Library
        </h1>
      </div>

      {/* Visual da Barra de Progresso de Scan (sem o card desnecessário) */}
      {isScanning && (
        <div className="scan-progress-bar-container">
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
            <span style={{ color: "var(--accent-primary)", fontWeight: 500 }}>
              Lendo arquivos de áudio...
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
        <div className="section-title">Músicas na Pasta Ativa ({tracks.length})</div>


        {tracks.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            Nenhuma música encontrada nesta pasta local.
          </p>
        ) : (
          <TrackTable tracks={tracks} />
        )}
      </div>
    </div>
  );
};
