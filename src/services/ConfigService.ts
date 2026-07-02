import appConfig from "../config/application.json";

export interface ApplicationConfig {
  name: string;
  version: string;
  description: string;
  icons: {
    app: string;
    [key: string]: string;
  };
  activeTheme: string;
  language: string;
  plugins: { id: string; enabled: boolean }[];
}

export interface IConfigService {
  getConfig(): ApplicationConfig;
  getActiveTheme(): string;
  setActiveTheme(themeId: string): void;
  getPlugins(): { id: string; enabled: boolean }[];
  isPluginEnabled(pluginId: string): boolean;
  setPluginEnabled(pluginId: string, enabled: boolean): void;
  getLanguage(): string;
  setLanguage(lang: string): void;
}

export class ConfigService implements IConfigService {
  private config: ApplicationConfig;

  constructor() {
    // Load default configuration from JSON
    this.config = { ...(appConfig as ApplicationConfig) };

    // Restore active theme from localStorage if it exists
    const savedTheme = localStorage.getItem("app_active_theme");
    if (savedTheme) {
      this.config.activeTheme = savedTheme;
    }

    // Restore language from localStorage if it exists
    const savedLanguage = localStorage.getItem("app_language");
    if (savedLanguage) {
      this.config.language = savedLanguage;
    } else {
      this.config.language = "pt-BR"; // Default language
    }

    // Restore plugins state from localStorage if it exists
    const savedPlugins = localStorage.getItem("app_plugins_state");
    if (savedPlugins) {
      try {
        this.config.plugins = JSON.parse(savedPlugins);
      } catch (e) {
        console.error("Failed to parse saved plugins state from localStorage:", e);
      }
    }
  }

  public getConfig(): ApplicationConfig {
    return { ...this.config };
  }

  public getActiveTheme(): string {
    return this.config.activeTheme;
  }

  public setActiveTheme(themeId: string): void {
    this.config.activeTheme = themeId;
    localStorage.setItem("app_active_theme", themeId);
  }

  public getPlugins(): { id: string; enabled: boolean }[] {
    return [...this.config.plugins];
  }

  public isPluginEnabled(pluginId: string): boolean {
    const plugin = this.config.plugins.find((p) => p.id === pluginId);
    return plugin ? plugin.enabled : false;
  }

  public setPluginEnabled(pluginId: string, enabled: boolean): void {
    const updatedPlugins = this.config.plugins.map((p) =>
      p.id === pluginId ? { ...p, enabled } : p
    );

    if (!this.config.plugins.some((p) => p.id === pluginId)) {
      updatedPlugins.push({ id: pluginId, enabled });
    }

    this.config.plugins = updatedPlugins;
    localStorage.setItem("app_plugins_state", JSON.stringify(updatedPlugins));
  }

  public getLanguage(): string {
    return this.config.language;
  }

  public setLanguage(lang: string): void {
    this.config.language = lang;
    localStorage.setItem("app_language", lang);
  }
}

// Export a singleton instance of the config service
export const configService: IConfigService = new ConfigService();
