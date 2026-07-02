import React from "react";
import { Disc } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Track } from "../../models/track";

interface CurrentTrackInfoProps {
  currentTrack: Track | null;
  isPlaying: boolean;
}

export const CurrentTrackInfo: React.FC<CurrentTrackInfoProps> = ({ currentTrack, isPlaying }) => {
  const { t } = useTranslation();

  return (
    <div className="current-track-container">
      {currentTrack ? (
        <>
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className={`current-track-cover ${isPlaying ? "playing" : ""}`}
          />
          <div className="current-track-info">
            <span className="current-track-title">{currentTrack.title}</span>
            <span className="current-track-artist">{currentTrack.artist}</span>
          </div>
        </>
      ) : (
        <>
          <div
            className="current-track-cover"
            style={{
              background: "var(--bg-active)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)"
            }}
          >
            <Disc size={28} />
          </div>
          <div className="current-track-info">
            <span className="current-track-title" style={{ color: "var(--text-muted)" }}>
              {t("ui.noTrackPlaying")}
            </span>
            <span className="current-track-artist">-</span>
          </div>
        </>
      )}
    </div>
  );
};
