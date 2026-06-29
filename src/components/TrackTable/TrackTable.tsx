import React from "react";
import { Track } from "../../models/track";
import { Clock } from "lucide-react";
import { useApp } from "../../context/AppContext";
import "./TrackTable.css";

interface TrackTableProps {
  tracks: Track[];
  onTrackDoubleClick?: (track: Track, queue: Track[]) => void;
  renderExtraActions?: (track: Track) => React.ReactNode;
}

export const TrackTable: React.FC<TrackTableProps> = ({ 
  tracks, 
  onTrackDoubleClick,
  renderExtraActions
}) => {
  const { currentTrack, isPlaying, play, pause, resume } = useApp();

  const formatDuration = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleTrackRowClick = (track: Track) => {
    if (onTrackDoubleClick) {
      onTrackDoubleClick(track, tracks);
      return;
    }
    
    // Comportamento Padrão
    if (currentTrack?.id === track.id) {
      if (isPlaying) pause();
      else resume();
    } else {
      play(track, tracks);
    }
  };

  return (
    <table className="tracks-table">
      <thead>
        <tr>
          <th className="track-index-col">#</th>
          <th>Título</th>
          <th>Álbum</th>
          <th>BPM</th>
          <th>Tom</th>
          <th style={{ textAlign: "right" }}><Clock size={16} /></th>
          {renderExtraActions && <th></th>}
        </tr>
      </thead>
      <tbody>
        {tracks.map((track, index) => (
          <tr
            key={track.id}
            className={`track-row ${currentTrack?.id === track.id ? "active" : ""}`}
            onDoubleClick={() => handleTrackRowClick(track)}
          >
            <td className="track-index-col">
              {currentTrack?.id === track.id && isPlaying ? (
                <div style={{ color: "var(--accent-primary)", fontWeight: "bold" }}>▶</div>
              ) : (
                index + 1
              )}
            </td>
            <td>
              <div className="track-info-cell">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="track-cover-mini"
                />
                <div className="track-meta-detail">
                  <span className="track-title-cell">{track.title}</span>
                  <span className="track-artist-cell">{track.artist}</span>
                </div>
              </div>
            </td>
            <td>{track.album}</td>
            <td>
              {track.bpm ? (
                <span className="musician-badge bpm">{track.bpm} BPM</span>
              ) : (
                "-"
              )}
            </td>
            <td>
              {track.key ? (
                <span className="musician-badge key">{track.key}</span>
              ) : (
                "-"
              )}
            </td>
            <td style={{ textAlign: "right", color: "var(--text-muted)" }}>
              {formatDuration(track.duration)}
            </td>
            {renderExtraActions && (
              <td style={{ position: "relative" }}>
                {renderExtraActions(track)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
