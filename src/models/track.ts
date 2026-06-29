export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  url: string;
  coverUrl: string;
  bpm?: number;     // Beats Per Minute for musicians
  key?: string;     // Musical Key (e.g., "Am", "C#", "G") for musicians
}
