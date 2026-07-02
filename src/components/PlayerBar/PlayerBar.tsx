import React from "react";
import { useApp } from "../../context/AppContext";
import { Sliders } from "lucide-react";
import "./PlayerBar.css";

import { CurrentTrackInfo } from "./CurrentTrackInfo";
import { TransportControls } from "./TransportControls";
import { VolumeControl } from "./VolumeControl";

interface PlayerBarProps {
  showPractice: boolean;
  setShowPractice: (show: boolean) => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({ showPractice, setShowPractice }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    loopABStart,
    loopABEnd,
    pause,
    resume,
    seek,
    setVolume,
    toggleMute,
    toggleRepeatMode,
    toggleShuffle,
    next,
    previous
  } = useApp();

  return (
    <footer className="player-bar">
      {/* Esquerda: Informações da Faixa */}
      <CurrentTrackInfo currentTrack={currentTrack} isPlaying={isPlaying} />

      {/* Centro: Controles de Transporte e Progresso */}
      <TransportControls
        isPlaying={isPlaying}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        currentTime={currentTime}
        duration={duration}
        loopABStart={loopABStart}
        loopABEnd={loopABEnd}
        pause={pause}
        resume={resume}
        seek={seek}
        toggleShuffle={toggleShuffle}
        toggleRepeatMode={toggleRepeatMode}
        next={next}
        previous={previous}
      />

      {/* Direita: Volume e Painel de Prática */}
      <div className="extra-controls-container">
        {/* Botão de Toggle do Painel de Músicos */}
        <button
          className={`btn-transport ${showPractice ? "active active-pulse" : ""}`}
          onClick={() => setShowPractice(!showPractice)}
          title="Ferramentas de Prática (Músico)"
          style={{ padding: "8px" }}
        >
          <Sliders size={18} />
        </button>

        {/* Controle de Volume */}
        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          setVolume={setVolume}
          toggleMute={toggleMute}
        />
      </div>
    </footer>
  );
};
