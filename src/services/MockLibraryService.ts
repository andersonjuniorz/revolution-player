import { Track } from "../models/track";
import { Playlist } from "../models/playlist";
import { ILibraryService, LibraryState } from "./ILibraryService";

export class MockLibraryService implements ILibraryService {
  private state: LibraryState;
  private listeners: Set<(state: LibraryState) => void> = new Set();

  private defaultTracks: Track[] = [
    {
      id: "track-default-1",
      title: "SoundHelix Jam Session 1 (Local)",
      artist: "SoundHelix Band",
      album: "Local Songs Folder",
      duration: 372,
      url: "/Songs/soundhelix-1.mp3",
      coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=60",
      bpm: 110,
      key: "Am"
    },
    {
      id: "track-default-2",
      title: "Electronic Chill Vibes (Local)",
      artist: "SoundHelix Project",
      album: "Local Songs Folder",
      duration: 302,
      url: "/Songs/soundhelix-2.mp3",
      coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60",
      bpm: 95,
      key: "C"
    }
  ];

  constructor() {
    this.state = {
      tracks: [...this.defaultTracks],
      playlists: [
        {
          id: "playlist-1",
          name: "Favoritas de Prática",
          description: "Músicas para treinar guitarra, baixo e improvisação.",
          coverUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&auto=format&fit=crop&q=60",
          tracks: [this.defaultTracks[0], this.defaultTracks[1]]
        }
      ],
      scannedFolders: [
        "Songs"
      ],
      isScanning: false,
      scanProgress: 0,
      localDirectoryName: "Pasta Padrão: Songs/",
      localDirectoryPath: "Songs"
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  public async getTracks(): Promise<Track[]> {
    return this.state.tracks;
  }

  public async getPlaylists(): Promise<Playlist[]> {
    return this.state.playlists;
  }

  public async createPlaylist(name: string, description = ""): Promise<Playlist> {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      description,
      coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=60",
      tracks: []
    };

    this.state.playlists.push(newPlaylist);
    this.notify();
    return newPlaylist;
  }

  public async updatePlaylist(playlistId: string, name: string, description?: string): Promise<void> {
    const playlist = this.state.playlists.find((p) => p.id === playlistId);
    if (playlist) {
      playlist.name = name;
      if (description !== undefined) {
        playlist.description = description;
      }
      this.notify();
    }
  }

  public async deletePlaylist(playlistId: string): Promise<void> {
    this.state.playlists = this.state.playlists.filter(p => p.id !== playlistId);
    this.notify();
  }

  public async addTrackToPlaylist(playlistId: string, track: Track): Promise<void> {
    const playlist = this.state.playlists.find((p) => p.id === playlistId);
    if (playlist && !playlist.tracks.some((t) => t.id === track.id)) {
      playlist.tracks.push(track);
      this.notify();
    }
  }

  public async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
    const playlist = this.state.playlists.find((p) => p.id === playlistId);
    if (playlist) {
      playlist.tracks = playlist.tracks.filter((t) => t.id !== trackId);
      this.notify();
    }
  }

  public async getScannedFolders(): Promise<string[]> {
    return this.state.scannedFolders;
  }

  public async addScannedFolder(path: string): Promise<Track[]> {
    if (this.state.scannedFolders.includes(path)) {
      return this.state.tracks;
    }

    this.state.scannedFolders.push(path);
    this.state.isScanning = true;
    this.state.scanProgress = 0;
    this.notify();

    // Simula o escaneamento
    const step = 20;
    for (let progress = step; progress <= 100; progress += step) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      this.state.scanProgress = progress;
      this.notify();
    }

    const folderIndex = this.state.scannedFolders.length;
    const scannedTracks: Track[] = [
      {
        id: `track-scanned-${folderIndex}-1`,
        title: `Local Jam Track ${folderIndex}`,
        artist: "Garage Band",
        album: "Local Sessions",
        duration: 242,
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop&q=60",
        bpm: 120,
        key: "Em"
      }
    ];

    this.state.tracks.push(...scannedTracks);
    this.state.isScanning = false;
    this.state.scanProgress = 0;
    this.notify();

    return scannedTracks;
  }

  public async removeScannedFolder(path: string): Promise<void> {
    this.state.scannedFolders = this.state.scannedFolders.filter((f) => f !== path);
    this.notify();
  }

  public async scanLocalFiles(files: File[], folderName: string): Promise<Track[]> {
    this.state.isScanning = true;
    this.state.scanProgress = 0;
    this.state.localDirectoryName = folderName;
    this.notify();

    const audioFiles = files.filter(
      (file) =>
        file.type.startsWith("audio/") ||
        file.name.endsWith(".mp3") ||
        file.name.endsWith(".wav") ||
        file.name.endsWith(".ogg") ||
        file.name.endsWith(".m4a") ||
        file.name.endsWith(".flac")
    );

    const scannedTracks: Track[] = [];
    const totalFiles = audioFiles.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = audioFiles[i];
      let artist = "Arquivo Local";
      let title = file.name.replace(/\.[^/.]+$/, "");
      
      if (title.includes("-")) {
        const parts = title.split("-");
        artist = parts[0].trim();
        title = parts.slice(1).join("-").trim();
      }

      const bpmOptions = [80, 90, 100, 110, 120, 130, 140];
      const keyOptions = ["C", "G", "D", "Am", "Em", "Bm", "F", "Dm"];
      const randomBpm = bpmOptions[Math.floor(Math.random() * bpmOptions.length)];
      const randomKey = keyOptions[Math.floor(Math.random() * keyOptions.length)];

      scannedTracks.push({
        id: `local-file-${i}-${Date.now()}`,
        title,
        artist,
        album: folderName,
        duration: 180,
        url: URL.createObjectURL(file),
        coverUrl: "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=300&auto=format&fit=crop&q=60",
        bpm: randomBpm,
        key: randomKey
      });

      this.state.scanProgress = Math.round(((i + 1) / totalFiles) * 100);
      this.notify();
    }

    if (scannedTracks.length > 0) {
      this.state.tracks = scannedTracks;
    } else if (files.length > 0) {
      this.state.tracks = [];
    }

    this.state.isScanning = false;
    this.state.scanProgress = 0;
    this.notify();

    return this.state.tracks;
  }

  public async setLocalDirectoryPath(path: string): Promise<Track[]> {
    this.state.localDirectoryPath = path;
    this.state.isScanning = true;
    this.state.scanProgress = 0;
    this.notify();

    if (!path || path === "Songs") {
      this.state.localDirectoryPath = "Songs";
      this.state.localDirectoryName = "Pasta Padrão: Songs/";
      this.state.tracks = [...this.defaultTracks];
      this.state.isScanning = false;
      this.state.scanProgress = 0;
      this.notify();
      return this.state.tracks;
    }

    try {
      // Import dynamically or use standard import
      const { invoke } = await import("@tauri-apps/api/core");

      // Nice micro-animation progress step
      const step = 25;
      for (let progress = step; progress <= 75; progress += step) {
        await new Promise((resolve) => setTimeout(resolve, 80));
        this.state.scanProgress = progress;
        this.notify();
      }

      const scannedTracks = await invoke<Track[]>("scan_directory", { path });

      this.state.scanProgress = 100;
      this.notify();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const normalizedPath = path.replace(/\\/g, "/");
      const parts = normalizedPath.split("/");
      const folderName = parts[parts.length - 1] || parts[parts.length - 2] || "Pasta Customizada";
      this.state.localDirectoryName = `Pasta: ${folderName}`;
      this.state.tracks = scannedTracks;
    } catch (error) {
      console.error("Error scanning local directory via Tauri invoke:", error);
      this.state.tracks = [];
      this.state.localDirectoryName = "Erro ao ler a pasta";
    } finally {
      this.state.isScanning = false;
      this.state.scanProgress = 0;
      this.notify();
    }

    return this.state.tracks;
  }

  public async fetchTracksMetadata(trackIds: string[]): Promise<Track[]> {
    const selectedTracks = this.state.tracks.filter((t) => trackIds.includes(t.id));
    if (selectedTracks.length === 0) return this.state.tracks;

    this.state.isScanning = true;
    this.state.scanProgress = 0;
    this.notify();

    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const total = selectedTracks.length;

      for (let i = 0; i < total; i++) {
        // Aplica o delay de 2 segundos solicitado para evitar ser banido da API
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        const track = selectedTracks[i];
        try {
          const [updatedTrack] = await invoke<Track[]>("fetch_tracks_metadata", {
            tracks: [track],
          });
          if (updatedTrack) {
            // Atualiza a faixa correspondente no estado da biblioteca
            this.state.tracks = this.state.tracks.map((t) =>
              t.id === track.id ? updatedTrack : t
            );
            this.notify();
          }
        } catch (e) {
          console.error("Error fetching metadata for track ID:", track.id, e);
        }

        this.state.scanProgress = Math.round(((i + 1) / total) * 100);
        this.notify();
      }
    } catch (error) {
      console.error("Error during batch metadata fetch:", error);
    } finally {
      this.state.isScanning = false;
      this.state.scanProgress = 0;
      this.notify();
    }

    return this.state.tracks;
  }

  public onStateChange(listener: (state: LibraryState) => void): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): LibraryState {
    return { ...this.state };
  }
}

