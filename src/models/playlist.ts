import { Track } from "./track";

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  tracks: Track[];
}
