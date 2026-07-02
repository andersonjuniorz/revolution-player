import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Plus, Home } from "lucide-react";
import { TrackTable } from "../components/TrackTable/TrackTable";
import { useTranslation } from "react-i18next";

export const HomePage: React.FC = () => {
  const { tracks, playlists, addTrackToPlaylist } = useApp();
  const { t } = useTranslation();
  const [activeDropdownTrackId, setActiveDropdownTrackId] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Início */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            margin: 0,
            color: "var(--text-main)",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}
        >
          <Home size={28} />
          {t("ui.homeTitle")}
        </h1>
      </div>

      {/* Tabela de Faixas */}
      <div>
        <div
          className="section-title"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span>
            {t("ui.allSongs")} ({tracks.length})
          </span>
        </div>

        {tracks.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>{t("ui.noSongsFound")}</p>
        ) : (
          <TrackTable
            tracks={tracks}
            renderExtraActions={(track) => (
              <>
                <button
                  className="btn-transport"
                  onClick={() =>
                    setActiveDropdownTrackId(activeDropdownTrackId === track.id ? null : track.id)
                  }
                  title="Adicionar à Playlist"
                >
                  <Plus size={16} />
                </button>

                {/* Menu de Dropdown de Playlists */}
                {activeDropdownTrackId === track.id && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "30px",
                      backgroundColor: "#27272a",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      zIndex: 150,
                      width: "180px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
                    }}
                  >
                    <div style={{ padding: "8px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {t("ui.addToPlaylist")}
                    </div>
                    {playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        style={{
                          padding: "8px 12px",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          transition: "background 0.2s"
                        }}
                        onClick={() => {
                          addTrackToPlaylist(playlist.id, track);
                          setActiveDropdownTrackId(null);
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3f3f46")}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        {playlist.name}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          />
        )}
      </div>
    </div>
  );
};
