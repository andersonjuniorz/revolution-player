import React from "react";
import { Download, Trash2, Puzzle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { configService } from "../services/ConfigService";
import { Plugin } from "../context/AppContext";
import "./PluginsPage.css";

interface PluginItemProps {
  plugin: Plugin;
  onUninstall: (id: string) => void;
}

const PluginItem: React.FC<PluginItemProps> = ({ plugin, onUninstall }) => {
  const [enabled, setEnabled] = React.useState(() => configService.isPluginEnabled(plugin.id));

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setEnabled(checked);
    configService.setPluginEnabled(plugin.id, checked);
  };

  return (
    <div className="plugin-card">
      <div className="plugin-info">
        <h3 className="plugin-name">{plugin.name}</h3>
        <span className="plugin-author">por {plugin.author} • v{plugin.version}</span>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)", cursor: "pointer" }}>
          <input 
            type="checkbox" 
            checked={enabled} 
            onChange={handleToggle}
            style={{ 
              accentColor: "var(--accent-primary)", 
              width: "16px", 
              height: "16px", 
              cursor: "pointer",
              borderRadius: "4px"
            }}
          />
          Ativo
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
  const { installedPlugins, uninstallPlugin } = useApp();

  const handleImport = () => {
    alert("Funcionalidade de importar .zip será integrada via Rust em breve!");
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
        <button className="btn-primary" onClick={handleImport} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Download size={18} />
          Importar (.zip)
        </button>
      </div>

      <div className="plugins-list-container">
        {installedPlugins.length === 0 ? (
          <p className="empty-message">Nenhum plugin instalado.</p>
        ) : (
          <div className="plugins-list">
            {installedPlugins.map((plugin) => (
              <PluginItem 
                key={plugin.id} 
                plugin={plugin} 
                onUninstall={handleUninstall} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
