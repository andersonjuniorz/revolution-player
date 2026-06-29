import React from "react";
import { Play, Pause, SkipForward, SkipBack, Repeat, Shuffle } from "lucide-react";

interface TransportControlsProps {
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: "none" | "one" | "all";
  currentTime: number;
  duration: number;
  loopABStart: number | null;
  loopABEnd: number | null;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  toggleShuffle: () => void;
  toggleRepeatMode: () => void;
  next: () => void;
  previous: () => void;
}

export const TransportControls: React.FC<TransportControlsProps> = ({
  isPlaying,
  isShuffle,
  repeatMode,
  currentTime,
  duration,
  loopABStart,
  loopABEnd,
  pause,
  resume,
  seek,
  toggleShuffle,
  toggleRepeatMode,
  next,
  previous,
}) => {
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    seek(percentage * duration);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const renderLoopRegion = () => {
    if (loopABStart === null || duration === 0) return null;
    const startPct = (loopABStart / duration) * 100;
    const endPct = loopABEnd !== null ? (loopABEnd / duration) * 100 : 100;
    const widthPct = endPct - startPct;

    return (
      <>
        <div
          className="loop-region"
          style={{ left: `${startPct}%`, width: `${widthPct}%` }}
        />
        <div
          className="loop-marker start"
          style={{ left: `${startPct}%` }}
          title={`Ponto A: ${formatTime(loopABStart)}`}
        />
        {loopABEnd !== null && (
          <div
            className="loop-marker end"
            style={{ left: `${endPct}%` }}
            title={`Ponto B: ${formatTime(loopABEnd)}`}
          />
        )}
      </>
    );
  };

  return (
    <div className="transport-controls-container">
      <div className="control-buttons">
        <button
          className={`btn-transport ${isShuffle ? "active" : ""}`}
          onClick={toggleShuffle}
          title="Aleatório"
        >
          <Shuffle size={16} />
        </button>

        <button className="btn-transport" onClick={previous} title="Anterior">
          <SkipBack size={20} />
        </button>

        <button
          className="btn-transport play-pause"
          onClick={isPlaying ? pause : resume}
          title={isPlaying ? "Pausar" : "Tocar"}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </button>

        <button className="btn-transport" onClick={next} title="Próxima">
          <SkipForward size={20} />
        </button>

        <button
          className={`btn-transport ${repeatMode !== "none" ? "active" : ""}`}
          onClick={toggleRepeatMode}
          title={`Repetir: ${repeatMode === "none" ? "Não" : repeatMode === "one" ? "Música" : "Playlist"}`}
        >
          <Repeat size={16} />
          {repeatMode === "one" && (
            <span
              style={{
                position: "absolute",
                fontSize: "9px",
                fontWeight: "bold",
                bottom: "-4px",
                right: "-2px",
                background: "var(--accent-primary)",
                color: "black",
                borderRadius: "50%",
                width: "12px",
                height: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              1
            </span>
          )}
        </button>
      </div>

      <div className="progress-container">
        <span className="progress-time">{formatTime(currentTime)}</span>
        <div className="progress-bar-wrapper" onClick={handleProgressClick}>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercentage}%` }}
            />
            {renderLoopRegion()}
          </div>
        </div>
        <span className="progress-time end">{formatTime(duration)}</span>
      </div>
    </div>
  );
};
