import { Track } from "../models/track";

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number; // speed: 0.5 to 2.0
  pitch: number; // pitch shift in semitones: -12 to 12 (mocked or actual)
  loopABStart: number | null;
  loopABEnd: number | null;
  isLoopABActive: boolean;
  repeatMode: "none" | "one" | "all";
  isShuffle: boolean;
  queue: Track[];
  queueIndex: number;
}

export interface IPlaybackService {
  play(track: Track, queue?: Track[]): void;
  pause(): void;
  resume(): void;
  stop(): void;
  seek(seconds: number): void;
  setVolume(volume: number): void;
  toggleMute(): void;
  setPlaybackRate(rate: number): void;
  setPitch(semitones: number): void;
  setABLoop(start: number | null, end: number | null): void;
  clearABLoop(): void;
  toggleRepeatMode(): void;
  toggleShuffle(): void;
  next(): void;
  previous(): void;
  addToQueue(track: Track): void;
  onStateChange(listener: (state: PlaybackState) => void): () => void;
  getState(): PlaybackState;
  cleanup(): void;
}
