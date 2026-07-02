import React from "react";
import { Volume2, VolumeX } from "lucide-react";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  setVolume: (v: number) => void;
  toggleMute: () => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted,
  setVolume,
  toggleMute
}) => {
  return (
    <div className="volume-control">
      <button className="btn-transport" onClick={toggleMute} title={isMuted ? "Desmutar" : "Mutar"}>
        {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={isMuted ? 0 : volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="premium-slider"
        style={{ width: "80px" }}
      />
    </div>
  );
};
