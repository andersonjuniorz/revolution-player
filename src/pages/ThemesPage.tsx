import React from "react";
import { Download, Trash2, Palette } from "lucide-react";
import { useApp } from "../context/AppContext";
// Usando o mesmo CSS da página de plugins já que a estrutura é idêntica
import "./PluginsPage.css";

export const ThemesPage: React.FC = () => {
  const { installedThemes, uninstallTheme } = useApp();

  const handleImport = () => {
    alert("Funcionalidade de importar tema (.zip) será integrada via Rust em breve!");
  };

  const handleUninstall = (id: string) => {
    uninstallTheme(id);
  };

  return (
    <div className="plugins-page-container">
      <div className="plugins-header">
        <h1 className="plugins-title">
          <Palette size={28} />
          Temas
        </h1>
        <button className="btn-primary" onClick={handleImport} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Download size={18} />
          Importar (.zip)
        </button>
      </div>

      <div className="plugins-list-container">
        {installedThemes.length === 0 ? (
          <p className="empty-message">Nenhum tema instalado.</p>
        ) : (
          <div className="plugins-list">
            {installedThemes.map((theme) => (
              <div key={theme.id} className="plugin-card">
                <div className="plugin-info">
                  <h3 className="plugin-name">{theme.name}</h3>
                  <span className="plugin-author">por {theme.author} • v{theme.version}</span>
                </div>
                <button 
                  className="btn-uninstall" 
                  onClick={() => handleUninstall(theme.id)}
                  title="Desinstalar Tema"
                >
                  <Trash2 size={18} />
                  Desinstalar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
