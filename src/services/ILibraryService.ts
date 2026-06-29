import { Track } from "../models/track";
import { Playlist } from "../models/playlist";

export interface LibraryState {
  tracks: Track[];
  playlists: Playlist[];
  scannedFolders: string[];
  isScanning: boolean;
  scanProgress: number; // 0 to 100
  localDirectoryName: string; // Nome da pasta local de músicas selecionada
  localDirectoryPath: string; // Caminho absoluto da pasta de músicas locais
}

export interface ILibraryService {
  getTracks(): Promise<Track[]>;
  getPlaylists(): Promise<Playlist[]>;
  createPlaylist(name: string, description?: string): Promise<Playlist>;
  updatePlaylist(playlistId: string, name: string, description?: string): Promise<void>;
  deletePlaylist(playlistId: string): Promise<void>;
  addTrackToPlaylist(playlistId: string, track: Track): Promise<void>;
  removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void>;
  getScannedFolders(): Promise<string[]>;
  addScannedFolder(path: string): Promise<Track[]>;
  removeScannedFolder(path: string): Promise<void>;
  scanLocalFiles(files: File[], folderName: string): Promise<Track[]>;
  setLocalDirectoryPath(path: string): Promise<Track[]>;
  fetchTracksMetadata(trackIds: string[]): Promise<Track[]>;
  onStateChange(listener: (state: LibraryState) => void): () => void;
  getState(): LibraryState;
}
