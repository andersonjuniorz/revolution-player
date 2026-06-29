import { Track } from "../models/track";
import { IPlaybackService, PlaybackState } from "./IPlaybackService";
import { convertFileSrc } from "@tauri-apps/api/core";

export class MockPlaybackService implements IPlaybackService {
  private state: PlaybackState;
  private listeners: Set<(state: PlaybackState) => void> = new Set();
  private audio: HTMLAudioElement | null = null;
  private updateInterval: any = null;

  constructor() {
    this.state = {
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      playbackRate: 1.0,
      pitch: 0,
      loopABStart: null,
      loopABEnd: null,
      isLoopABActive: false,
      repeatMode: "none",
      isShuffle: false,
      queue: [],
      queueIndex: -1,
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  private initAudio(url: string) {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeEventListener("ended", this.handleTrackEnded);
      this.audio.removeEventListener("loadedmetadata", this.handleLoadedMetadata);
    }

    let resolvedUrl = url;
    const isWindowsAbsolute = /^[a-zA-Z]:[\\/]/.test(url);
    const isUnixAbsolute = url.startsWith("/");
    const isHttp = url.startsWith("http://") || url.startsWith("https://");

    if ((isWindowsAbsolute || isUnixAbsolute) && !isHttp) {
      try {
        resolvedUrl = convertFileSrc(url);
      } catch (err) {
        console.error("Failed to convert file src:", err);
      }
    }

    this.audio = new Audio(resolvedUrl);
    this.audio.volume = this.state.isMuted ? 0 : this.state.volume;
    this.audio.playbackRate = this.state.playbackRate;
    
    this.audio.addEventListener("ended", this.handleTrackEnded);
    this.audio.addEventListener("loadedmetadata", this.handleLoadedMetadata);
  }

  private handleLoadedMetadata = () => {
    if (this.audio) {
      this.state.duration = Math.round(this.audio.duration) || this.state.currentTrack?.duration || 0;
      this.notify();
    }
  };

  private handleTrackEnded = () => {
    this.handleNextOrRepeat();
  };

  private handleNextOrRepeat() {
    if (this.state.repeatMode === "one") {
      this.seek(0);
      this.resume();
    } else {
      this.next();
    }
  }

  private startTicker() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.updateInterval = setInterval(() => {
      if (this.audio && this.state.isPlaying) {
        const time = this.audio.currentTime;
        this.state.currentTime = Math.floor(time);

        // Verifica o Loop A/B
        if (
          this.state.isLoopABActive &&
          this.state.loopABStart !== null &&
          this.state.loopABEnd !== null
        ) {
          if (time >= this.state.loopABEnd) {
            this.audio.currentTime = this.state.loopABStart;
            this.state.currentTime = Math.floor(this.state.loopABStart);
          }
        }

        this.notify();
      }
    }, 250);
  }

  private stopTicker() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  public play(track: Track, queue: Track[] = []): void {
    if (queue.length > 0) {
      this.state.queue = [...queue];
      const index = queue.findIndex((t) => t.id === track.id);
      this.state.queueIndex = index !== -1 ? index : 0;
    } else {
      if (!this.state.queue.some((t) => t.id === track.id)) {
        this.state.queue.push(track);
        this.state.queueIndex = this.state.queue.length - 1;
      } else {
        this.state.queueIndex = this.state.queue.findIndex((t) => t.id === track.id);
      }
    }

    this.state.currentTrack = track;
    this.state.isPlaying = true;
    this.state.currentTime = 0;
    this.state.duration = track.duration;

    this.initAudio(track.url);
    
    if (this.audio) {
      this.audio.play()
        .then(() => {
          this.startTicker();
          this.notify();
        })
        .catch((err) => {
          console.error("Audio playback error:", err);
          // Fallback para simulação em caso de bloqueio ou erro de rede
          this.startTicker();
          this.notify();
        });
    }
  }

  public pause(): void {
    this.state.isPlaying = false;
    if (this.audio) {
      this.audio.pause();
    }
    this.stopTicker();
    this.notify();
  }

  public resume(): void {
    if (!this.state.currentTrack && this.state.queue.length > 0) {
      this.play(this.state.queue[0]);
      return;
    }

    if (this.state.currentTrack) {
      this.state.isPlaying = true;
      if (this.audio) {
        this.audio.play()
          .then(() => {
            this.startTicker();
            this.notify();
          })
          .catch((err) => {
            console.error("Audio resume error:", err);
            this.startTicker();
            this.notify();
          });
      } else {
        this.startTicker();
        this.notify();
      }
    }
  }

  public stop(): void {
    this.state.isPlaying = false;
    this.state.currentTime = 0;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.stopTicker();
    this.notify();
  }

  public seek(seconds: number): void {
    this.state.currentTime = seconds;
    if (this.audio) {
      this.audio.currentTime = seconds;
    }
    this.notify();
  }

  public setVolume(volume: number): void {
    const vol = Math.max(0, Math.min(1, volume));
    this.state.volume = vol;
    if (this.audio) {
      this.audio.volume = this.state.isMuted ? 0 : vol;
    }
    this.notify();
  }

  public toggleMute(): void {
    this.state.isMuted = !this.state.isMuted;
    if (this.audio) {
      this.audio.volume = this.state.isMuted ? 0 : this.state.volume;
    }
    this.notify();
  }

  public setPlaybackRate(rate: number): void {
    const speed = Math.max(0.5, Math.min(2.0, rate));
    this.state.playbackRate = speed;
    if (this.audio) {
      this.audio.playbackRate = speed;
    }
    this.notify();
  }

  public setPitch(semitones: number): void {
    // Tom mockado na UI no frontend MVP.
    // No backend real em Rust, usaremos um processador DSP (ex: SoundTouch ou Rubber Band)
    // para mudar o Pitch independentemente da velocidade.
    const pitchVal = Math.max(-12, Math.min(12, semitones));
    this.state.pitch = pitchVal;
    this.notify();
  }

  public setABLoop(start: number | null, end: number | null): void {
    this.state.loopABStart = start;
    this.state.loopABEnd = end;
    this.state.isLoopABActive = start !== null && end !== null;
    
    // Se o cursor estiver fora do loop, direciona para o início do loop
    if (this.state.isLoopABActive && start !== null && this.audio) {
      if (this.audio.currentTime < start || this.audio.currentTime > (end || 0)) {
        this.audio.currentTime = start;
        this.state.currentTime = Math.floor(start);
      }
    }
    this.notify();
  }

  public clearABLoop(): void {
    this.state.loopABStart = null;
    this.state.loopABEnd = null;
    this.state.isLoopABActive = false;
    this.notify();
  }

  public toggleRepeatMode(): void {
    const modes: ("none" | "one" | "all")[] = ["none", "one", "all"];
    const currentIndex = modes.indexOf(this.state.repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.state.repeatMode = modes[nextIndex];
    this.notify();
  }

  public toggleShuffle(): void {
    this.state.isShuffle = !this.state.isShuffle;
    this.notify();
  }

  public next(): void {
    if (this.state.queue.length === 0) return;

    if (this.state.isShuffle) {
      const randomIndex = Math.floor(Math.random() * this.state.queue.length);
      this.state.queueIndex = randomIndex;
    } else {
      if (this.state.queueIndex < this.state.queue.length - 1) {
        this.state.queueIndex++;
      } else {
        if (this.state.repeatMode === "all") {
          this.state.queueIndex = 0;
        } else {
          this.stop();
          return;
        }
      }
    }

    const nextTrack = this.state.queue[this.state.queueIndex];
    this.play(nextTrack);
  }

  public previous(): void {
    if (this.state.queue.length === 0) return;

    // Se a música está tocando há mais de 3 segundos, reinicia a faixa ao invés de voltar
    if (this.state.currentTime > 3) {
      this.seek(0);
      return;
    }

    if (this.state.queueIndex > 0) {
      this.state.queueIndex--;
    } else {
      if (this.state.repeatMode === "all") {
        this.state.queueIndex = this.state.queue.length - 1;
      } else {
        this.seek(0);
        return;
      }
    }

    const prevTrack = this.state.queue[this.state.queueIndex];
    this.play(prevTrack);
  }

  public addToQueue(track: Track): void {
    if (!this.state.queue.some((t) => t.id === track.id)) {
      this.state.queue.push(track);
      this.notify();
    }
  }

  public onStateChange(listener: (state: PlaybackState) => void): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): PlaybackState {
    return { ...this.state };
  }

  public cleanup(): void {
    this.stopTicker();
    if (this.audio) {
      this.audio.pause();
      this.audio.removeEventListener("ended", this.handleTrackEnded);
      this.audio.removeEventListener("loadedmetadata", this.handleLoadedMetadata);
      this.audio = null;
    }
    this.listeners.clear();
  }
}
