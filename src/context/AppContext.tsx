import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Track } from "../models/track";
import { Playlist } from "../models/playlist";
import { IPlaybackService, PlaybackState } from "../services/IPlaybackService";
import { ILibraryService, LibraryState } from "../services/ILibraryService";
import { MockPlaybackService } from "../services/MockPlaybackService";
import { MockLibraryService } from "../services/MockLibraryService";
import { configService } from "../services/ConfigService";

export interface PluginSetting {
  type: "toggle" | "select" | "text" | "number";
  key: string;
  label: string;
  value: any;
  options?: string[]; // Para selects
}

export interface Plugin {
  id: string;
  name: string;
  author: string;
  version: string;
  settingsSchema: PluginSetting[];
}

export interface Theme {
  id: string;
  name: string;
  author: string;
  version: string;
}

interface AppContextType {
  // Playback States
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  pitch: number;
  loopABStart: number | null;
  loopABEnd: number | null;
  isLoopABActive: boolean;
  repeatMode: "none" | "one" | "all";
  isShuffle: boolean;
  queue: Track[];

  // Library States
  tracks: Track[];
  playlists: Playlist[];
  scannedFolders: string[];
  isScanning: boolean;
  scanProgress: number;
  localDirectoryName: string;
  localDirectoryPath: string;

  // Navigation States
  activeTab: "home" | "search" | "playlists" | "scanner" | "settings" | "plugins" | "themes";
  selectedPlaylistId: string | null;

  // Navigation Actions
  setActiveTab: (tab: "home" | "search" | "playlists" | "scanner" | "settings" | "plugins" | "themes") => void;
  setSelectedPlaylistId: (id: string | null) => void;

  // Plugins and Themes States
  installedPlugins: Plugin[];
  installedThemes: Theme[];
  activeThemeId: string;

  // Plugins and Themes Actions
  uninstallPlugin: (id: string) => void;
  uninstallTheme: (id: string) => void;
  setActiveTheme: (id: string) => void;
  updatePluginSetting: (pluginId: string, settingKey: string, value: any) => void;

  // Playback Actions
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  setPitch: (semitones: number) => void;
  setABLoop: (start: number | null, end: number | null) => void;
  clearABLoop: () => void;
  toggleRepeatMode: () => void;
  toggleShuffle: () => void;
  next: () => void;
  previous: () => void;
  addToQueue: (track: Track) => void;

  // Library Actions
  createPlaylist: (name: string, description?: string) => Promise<Playlist>;
  updatePlaylist: (playlistId: string, name: string, description?: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  addScannedFolder: (path: string) => Promise<void>;
  removeScannedFolder: (path: string) => Promise<void>;
  scanLocalFiles: (files: File[], folderName: string) => Promise<Track[]>;
  setLocalDirectoryPath: (path: string) => Promise<Track[]>;
  fetchTracksMetadata: (trackIds: string[]) => Promise<Track[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializa os serviços usando refs para persistir as instâncias dos serviços de forma única
  const playbackServiceRef = useRef<IPlaybackService>(new MockPlaybackService());
  const libraryServiceRef = useRef<ILibraryService>(new MockLibraryService());

  const playbackService = playbackServiceRef.current;
  const libraryService = libraryServiceRef.current;

  // Estados locais sincronizados reativamente com os serviços
  const [playbackState, setPlaybackState] = useState<PlaybackState>(playbackService.getState());
  const [libraryState, setLibraryState] = useState<LibraryState>(libraryService.getState());

  // Estados extras de navegação do frontend
  const [activeTab, setActiveTab] = useState<"home" | "search" | "playlists" | "scanner" | "settings" | "plugins" | "themes">("home");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Estados de Plugins e Temas (Mock)
  const [installedPlugins, setInstalledPlugins] = useState<Plugin[]>([
    {
      id: "plugin-1",
      name: "Advanced Equalizer",
      author: "SoundHelix Team",
      version: "1.0.2",
      settingsSchema: [
        { type: "toggle", key: "enableEq", label: "Habilitar Equalizador", value: true },
        { type: "select", key: "preset", label: "Preset Padrão", options: ["Flat", "Pop", "Rock", "Jazz", "Classical"], value: "Pop" }
      ]
    },
    {
      id: "plugin-2",
      name: "Spotify Integration (BETA)",
      author: "Revolution Community",
      version: "0.9.1",
      settingsSchema: [
        { type: "text", key: "apiKey", label: "API Key", value: "" },
        { type: "toggle", key: "syncPlaylists", label: "Sincronizar Playlists", value: false }
      ]
    }
  ]);

  const [installedThemes, setInstalledThemes] = useState<Theme[]>([
    { id: "theme-default", name: "Revolution Default", author: "Core Team", version: "1.0.0" },
    { id: "theme-1", name: "Midnight Neon", author: "Revolution Community", version: "1.2.0" },
    { id: "theme-2", name: "Classic Studio", author: "SoundHelix Team", version: "1.0.0" }
  ]);

  const [activeThemeId, setActiveThemeState] = useState<string>(() => configService.getActiveTheme());

  const setActiveTheme = (id: string) => {
    setActiveThemeState(id);
    configService.setActiveTheme(id);
  };

  const uninstallPlugin = (id: string) => {
    setInstalledPlugins(prev => prev.filter(p => p.id !== id));
  };

  const uninstallTheme = (id: string) => {
    setInstalledThemes(prev => prev.filter(t => t.id !== id));
    if (activeThemeId === id) {
      setActiveTheme("theme-default");
    }
  };

  const updatePluginSetting = (pluginId: string, settingKey: string, value: any) => {
    setInstalledPlugins(prev => prev.map(plugin => {
      if (plugin.id === pluginId) {
        return {
          ...plugin,
          settingsSchema: plugin.settingsSchema.map(setting => 
            setting.key === settingKey ? { ...setting, value } : setting
          )
        };
      }
      return plugin;
    }));
  };

  useEffect(() => {
    // Inscreve no Observer de mudanças de estado de reprodução
    const unsubscribePlayback = playbackService.onStateChange((state) => {
      setPlaybackState(state);
    });

    // Inscreve no Observer de mudanças de estado da biblioteca
    const unsubscribeLibrary = libraryService.onStateChange((state) => {
      setLibraryState(state);
    });

    return () => {
      unsubscribePlayback();
      unsubscribeLibrary();
      playbackService.cleanup();
    };
  }, [playbackService, libraryService]);

  // Wrappers de ações de reprodução
  const play = (track: Track, queue?: Track[]) => playbackService.play(track, queue);
  const pause = () => playbackService.pause();
  const resume = () => playbackService.resume();
  const stop = () => playbackService.stop();
  const seek = (seconds: number) => playbackService.seek(seconds);
  const setVolume = (vol: number) => playbackService.setVolume(vol);
  const toggleMute = () => playbackService.toggleMute();
  const setPlaybackRate = (rate: number) => playbackService.setPlaybackRate(rate);
  const setPitch = (semitones: number) => playbackService.setPitch(semitones);
  const setABLoop = (start: number | null, end: number | null) => playbackService.setABLoop(start, end);
  const clearABLoop = () => playbackService.clearABLoop();
  const toggleRepeatMode = () => playbackService.toggleRepeatMode();
  const toggleShuffle = () => playbackService.toggleShuffle();
  const next = () => playbackService.next();
  const previous = () => playbackService.previous();
  const addToQueue = (track: Track) => playbackService.addToQueue(track);

  // Wrappers de ações da biblioteca
  const createPlaylist = async (name: string, description?: string) => {
    return await libraryService.createPlaylist(name, description);
  };

  const updatePlaylist = async (playlistId: string, name: string, description?: string) => {
    await libraryService.updatePlaylist(playlistId, name, description);
  };

  const deletePlaylist = async (playlistId: string) => {
    await libraryService.deletePlaylist(playlistId);
  };

  const addTrackToPlaylist = async (playlistId: string, track: Track) => {
    await libraryService.addTrackToPlaylist(playlistId, track);
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    await libraryService.removeTrackFromPlaylist(playlistId, trackId);
  };

  const addScannedFolder = async (path: string) => {
    await libraryService.addScannedFolder(path);
  };

  const removeScannedFolder = async (path: string) => {
    await libraryService.removeScannedFolder(path);
  };

  const scanLocalFiles = async (files: File[], folderName: string) => {
    return await libraryService.scanLocalFiles(files, folderName);
  };

  const setLocalDirectoryPath = async (path: string) => {
    return await libraryService.setLocalDirectoryPath(path);
  };

  const fetchTracksMetadata = async (trackIds: string[]) => {
    return await libraryService.fetchTracksMetadata(trackIds);
  };

  return (
    <AppContext.Provider
      value={{
        // Estados
        ...playbackState,
        ...libraryState,
        // Navigation States
        activeTab,
        selectedPlaylistId,

        // Plugins and Themes States
        installedPlugins,
        installedThemes,
        activeThemeId,

        // Navigation Actions
        setActiveTab,
        setSelectedPlaylistId,
        
        // Plugins and Themes Actions
        uninstallPlugin,
        uninstallTheme,
        setActiveTheme,
        updatePluginSetting,

        // Ações de Reprodução
        play,
        pause,
        resume,
        stop,
        seek,
        setVolume,
        toggleMute,
        setPlaybackRate,
        setPitch,
        setABLoop,
        clearABLoop,
        toggleRepeatMode,
        toggleShuffle,
        next,
        previous,
        addToQueue,

        // Ações de Biblioteca
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        addScannedFolder,
        removeScannedFolder,
        scanLocalFiles,
        setLocalDirectoryPath,
        fetchTracksMetadata,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp deve ser usado dentro de um AppProvider");
  }
  return context;
};
