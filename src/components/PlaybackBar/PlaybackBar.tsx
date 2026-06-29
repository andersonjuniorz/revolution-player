import React from 'react';
import { Play, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Mic2, MonitorSpeaker, AudioLines } from 'lucide-react';
import './PlaybackBar.css';

const PlaybackBar: React.FC = () => {
  return (
    <footer className="playback-bar">
      
      {/* Left Section - Track Info */}
      <div className="pb-track-info">
        <div className="pb-cover-mock">
          <AudioLines size={24} />
        </div>
        <div className="pb-track-details">
          <span className="pb-track-title">Bohemian Rhapsody (Local)</span>
          <span className="pb-track-artist">Queen</span>
        </div>
      </div>

      {/* Center Section - Controls */}
      <div className="pb-controls-container">
        <div className="pb-transport-buttons">
          <button className="pb-btn" title="Aleatório">
            <Shuffle size={16} />
          </button>
          <button className="pb-btn" title="Anterior">
            <SkipBack size={20} />
          </button>
          <button className="pb-btn pb-play-btn" title="Tocar/Pausar">
            <Play size={16} fill="currentColor" />
          </button>
          <button className="pb-btn" title="Próximo">
            <SkipForward size={20} />
          </button>
          <button className="pb-btn" title="Repetir">
            <Repeat size={16} />
          </button>
        </div>
        
        <div className="pb-progress-container">
          <span className="pb-time">2:14</span>
          <div className="pb-progress-bar">
            <div className="pb-progress-fill"></div>
          </div>
          <span className="pb-time">5:55</span>
        </div>
      </div>

      {/* Right Section - Extra Controls */}
      <div className="pb-extra-controls">
        <button className="pb-btn" title="Efeitos (Safe Mode FX)">
          <Mic2 size={16} />
        </button>
        <button className="pb-btn" title="Dispositivos">
          <MonitorSpeaker size={16} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <button className="pb-btn">
            <Volume2 size={16} />
          </button>
          <div className="pb-volume-bar">
            <div className="pb-volume-fill"></div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default PlaybackBar;
