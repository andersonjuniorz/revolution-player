import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { Track } from "../models/track";
import { Playlist } from "../models/playlist";
import { IPlaybackService, PlaybackState } from "../services/IPlaybackService";
import { ILibraryService, LibraryState } from "../services/ILibraryService";
import { MockPlaybackService } from "../services/MockPlaybackService";
import { MockLibraryService } from "../services/MockLibraryService";
import { configService } from "../services/ConfigService";
import nebulaManifest from "../themes/Nebula-Purple/manifest.json";
import pinkManifest from "../themes/Pink/manifest.json";
import lightManifest from "../themes/Light/manifest.json";
import darkNeonManifest from "../themes/Dark-Neon/manifest.json";
import { BUILT_IN_THEME_IDS } from "../constants/themes";

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
  activeTab:
    "home" | "search" | "playlists" | "scanner" | "settings" | "plugins" | "themes" | string;
  selectedPlaylistId: string | null;

  // Navigation Actions
  setActiveTab: (
    tab: "home" | "search" | "playlists" | "scanner" | "settings" | "plugins" | "themes" | string
  ) => void;
  setSelectedPlaylistId: (id: string | null) => void;

  // Plugins and Themes States
  installedPlugins: Plugin[];
  pluginStates: Record<string, boolean>;
  installedThemes: Theme[];
  activeThemeId: string;

  // Plugins and Themes Actions
  installPlugin: (plugin: Plugin) => void;
  installPluginFromZip: (path: string) => Promise<void>;
  uninstallPlugin: (id: string) => void;
  togglePlugin: (id: string, enabled: boolean) => void;
  uninstallTheme: (id: string) => Promise<void>;
  setActiveTheme: (id: string) => void;
  updatePluginSetting: (pluginId: string, settingKey: string, value: any) => void;
  installThemeFromZip: (path: string) => Promise<void>;

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
  refreshLocalDirectory: () => Promise<Track[]>;
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
  const [activeTab, setActiveTab] = useState<
    "home" | "search" | "playlists" | "scanner" | "settings" | "plugins" | "themes" | string
  >("home");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const [installedPlugins, setInstalledPlugins] = useState<Plugin[]>([]);
  const [pluginStates, setPluginStates] = useState<Record<string, boolean>>(() => {
    const states: Record<string, boolean> = {};
    configService.getPlugins().forEach((p) => {
      states[p.id] = p.enabled;
    });
    return states;
  });

  const [installedThemes, setInstalledThemes] = useState<Theme[]>([
    darkNeonManifest,
    nebulaManifest,
    pinkManifest,
    lightManifest
  ]);

  const [activeThemeId, setActiveThemeState] = useState<string>(() =>
    configService.getActiveTheme()
  );

  const setActiveTheme = (id: string) => {
    setActiveThemeState(id);
    configService.setActiveTheme(id);
  };

  const installPluginFromZip = async (path: string) => {
    try {
      const { ask, message } = await import("@tauri-apps/plugin-dialog");

      const manifest: Plugin = await invoke("read_plugin_manifest", { zipPath: path });

      const pluginExists = installedPlugins.some((p) => p.id === manifest.id);
      if (pluginExists) {
        const confirmed = await ask(
          `O plugin "${manifest.name}" já está instalado. Deseja substituí-lo?`,
          {
            title: "Plugin já existe",
            kind: "warning"
          }
        );
        if (!confirmed) return;
      }

      await invoke("extract_plugin", { zipPath: path, pluginId: manifest.id });

      setInstalledPlugins((prev) => {
        const filtered = prev.filter((p) => p.id !== manifest.id);
        return [...filtered, manifest];
      });

      setActiveTab(`plugin-${manifest.id}`);
      await message("Plugin importado e carregado com sucesso!", {
        title: "Sucesso",
        kind: "info"
      });
    } catch (err: any) {
      console.error("Erro na importação de plugin", err);
      const { message } = await import("@tauri-apps/plugin-dialog");
      await message(err.toString(), { title: "Erro na importação", kind: "error" });
    }
  };

  const installPlugin = (plugin: Plugin) => {
    setInstalledPlugins((prev) => {
      if (prev.find((p) => p.id === plugin.id)) return prev;
      return [...prev, plugin];
    });
  };

  const uninstallPlugin = (id: string) => {
    setInstalledPlugins((prev) => prev.filter((p) => p.id !== id));
  };

  const togglePlugin = (id: string, enabled: boolean) => {
    configService.setPluginEnabled(id, enabled);
    setPluginStates((prev) => ({ ...prev, [id]: enabled }));
  };

  const uninstallTheme = async (id: string) => {
    try {
      if (BUILT_IN_THEME_IDS.includes(id)) {
        console.warn("Não é possível desinstalar temas nativos do sistema.");
        return;
      }
      await invoke("uninstall_theme", { themeId: id });
      setInstalledThemes((prev) => prev.filter((t) => t.id !== id));
      if (activeThemeId === id) {
        setActiveTheme(darkNeonManifest.id);
      }
    } catch (err) {
      console.error("Erro ao desinstalar tema:", err);
    }
  };

  const installThemeFromZip = async (path: string) => {
    try {
      const { ask, message } = await import("@tauri-apps/plugin-dialog");

      const manifest: Theme = await invoke("read_theme_manifest", { zipPath: path });

      const themeExists = installedThemes.some((t) => t.id === manifest.id);
      if (themeExists) {
        const confirmed = await ask(
          `O tema "${manifest.name}" já está instalado. Deseja substituí-lo?`,
          {
            title: "Tema já existe",
            kind: "warning"
          }
        );
        if (!confirmed) return;
      }

      await invoke("extract_theme", { zipPath: path, themeId: manifest.id });

      setInstalledThemes((prev) => {
        const filtered = prev.filter((t) => t.id !== manifest.id);
        return [...filtered, manifest];
      });

      setActiveTheme(manifest.id);

      await message("Tema importado e aplicado com sucesso!", { title: "Sucesso", kind: "info" });
    } catch (err: any) {
      console.error("Erro na importação de tema", err);
      const { message } = await import("@tauri-apps/plugin-dialog");
      await message(err.toString(), { title: "Erro na importação", kind: "error" });
    }
  };

  const updatePluginSetting = (pluginId: string, settingKey: string, value: any) => {
    setInstalledPlugins((prev) =>
      prev.map((plugin) => {
        if (plugin.id === pluginId) {
          return {
            ...plugin,
            settingsSchema: plugin.settingsSchema.map((setting) =>
              setting.key === settingKey ? { ...setting, value } : setting
            )
          };
        }
        return plugin;
      })
    );
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

  useEffect(() => {
    const loadThemes = async () => {
      try {
        const backendThemes: Theme[] = await invoke("get_installed_themes");
        setInstalledThemes(() => {
          const builtinThemes = [darkNeonManifest, nebulaManifest, pinkManifest, lightManifest];
          const builtinIds = builtinThemes.map((t) => t.id);
          return [...builtinThemes, ...backendThemes.filter((t) => !builtinIds.includes(t.id))];
        });
      } catch (err) {
        console.error("Falha ao carregar temas:", err);
      }
    };

    const loadPlugins = async () => {
      try {
        const backendPlugins: Plugin[] = await invoke("get_installed_plugins");
        setInstalledPlugins(backendPlugins);
      } catch (err) {
        console.error("Falha ao carregar plugins:", err);
      }
    };

    loadThemes();
    loadPlugins();
  }, []);

  useEffect(() => {
    const applyThemeCSS = async () => {
      const existingLink = document.getElementById("dynamic-theme-css");
      if (existingLink) existingLink.remove();

      if (BUILT_IN_THEME_IDS.includes(activeThemeId)) return;

      try {
        const cssPath: string = await invoke("get_theme_css_path", { themeId: activeThemeId });
        const assetUrl = convertFileSrc(cssPath);

        const link = document.createElement("link");
        link.id = "dynamic-theme-css";
        link.rel = "stylesheet";
        link.href = assetUrl;
        document.head.appendChild(link);
      } catch (err) {
        console.error("Erro ao aplicar css do tema:", err);
      }
    };
    applyThemeCSS();
  }, [activeThemeId]);

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
  const setABLoop = (start: number | null, end: number | null) =>
    playbackService.setABLoop(start, end);
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

  const refreshLocalDirectory = async () => {
    return await libraryService.refreshLocalDirectory();
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
        pluginStates,
        installedThemes,
        activeThemeId,

        // Navigation Actions
        setActiveTab,
        setSelectedPlaylistId,

        // Plugins and Themes Actions
        installPlugin,
        installPluginFromZip,
        uninstallPlugin,
        togglePlugin,
        uninstallTheme,
        setActiveTheme,
        updatePluginSetting,
        installThemeFromZip,

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
        refreshLocalDirectory,
        fetchTracksMetadata
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
