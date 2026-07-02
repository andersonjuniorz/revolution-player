import React from "react";
import { Trash2, Puzzle, FolderOpen } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Plugin } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import "./PluginsPage.css";

interface PluginItemProps {
  plugin: Plugin;
  enabled: boolean;
  onToggle: (id: string, enabled: boolean) => void;
  onUninstall: (id: string) => void;
}

const PluginItem: React.FC<PluginItemProps> = ({ plugin, enabled, onToggle, onUninstall }) => {
  return (
    <div
      className={`plugin-card ${!enabled ? "plugin-disabled" : ""}`}
      style={{ opacity: enabled ? 1 : 0.6, transition: "opacity 0.2s" }}
    >
      <div className="plugin-info">
        <h3 className="plugin-name">{plugin.name}</h3>
        <span className="plugin-author">
          By {plugin.author} • v{plugin.version}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Toggle Switch Moderno */}
        <label
          className="plugin-toggle-switch"
          title={enabled ? "Desativar Plugin" : "Ativar Plugin"}
        >
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(plugin.id, e.target.checked)}
          />
          <span className="toggle-slider">
            <span className="toggle-knob"></span>
          </span>
        </label>

        <button
          className="btn-uninstall"
          onClick={() => onUninstall(plugin.id)}
          title="Desinstalar Plugin"
        >
          <Trash2 size={18} />
          Desinstalar
        </button>
      </div>
    </div>
  );
};

export const PluginsPage: React.FC = () => {
  const { installedPlugins, pluginStates, togglePlugin, uninstallPlugin, installPluginFromZip } =
    useApp();
  const { t } = useTranslation();

  const handleImport = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Plugin",
            extensions: ["zip"]
          }
        ]
      });

      if (selected && typeof selected === "string") {
        await installPluginFromZip(selected);
      }
    } catch (err) {
      console.error("Falha ao abrir seletor de arquivos", err);
    }
  };

  const handleUninstall = (id: string) => {
    uninstallPlugin(id);
  };

  return (
    <div className="plugins-page-container">
      <div className="plugins-header">
        <h1 className="plugins-title">
          <Puzzle size={28} />
          Plugins
        </h1>
        <button
          className="btn-primary"
          onClick={handleImport}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <FolderOpen size={16} />
          {t("ui.importPlugin")}
        </button>
      </div>

      <div className="plugins-list-container">
        {installedPlugins.length === 0 ? (
          <p className="empty-message">{t("ui.noPluginInstalled")}</p>
        ) : (
          <div className="plugins-list">
            {installedPlugins.map((plugin) => (
              <PluginItem
                key={plugin.id}
                plugin={plugin}
                enabled={pluginStates[plugin.id] || false}
                onToggle={togglePlugin}
                onUninstall={handleUninstall}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
