import React from "react";
import { useApp } from "../../context/AppContext";
import { Home, Search, FolderClosed, Settings, ChevronLeft, ChevronRight, Puzzle, Palette, ListMusic } from "lucide-react";
import "./Sidebar.css";

interface SidebarProps {
  isCompact: boolean;
  setIsCompact: (compact: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCompact, setIsCompact }) => {
  const { activeTab, setActiveTab, setSelectedPlaylistId } = useApp();

  const handleTabClick = (tab: "home" | "search" | "scanner" | "settings" | "plugins" | "themes" | "playlists") => {
    setActiveTab(tab);
    setSelectedPlaylistId(null);
  };

  return (
    <aside className="sidebar" style={{ padding: isCompact ? "20px 8px" : "20px 16px", overflowX: "hidden" }}>
      {/* Seção de Logo e Toggle */}
      <div className="logo-section" style={{ justifyContent: isCompact ? "center" : "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="logo-icon">R</div>
          {!isCompact && <span className="logo-text">Revolution</span>}
        </div>
        
        <button 
          className="btn-transport" 
          onClick={() => setIsCompact(!isCompact)}
          style={{ padding: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "6px" }}
          title={isCompact ? "Expandir Menu" : "Recolher Menu"}
        >
          {isCompact ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Menu de Navegação */}
      <nav className="nav-menu">
        <div
          className={`nav-item ${activeTab === "home" ? "active" : ""}`}
          onClick={() => handleTabClick("home")}
          style={{ justifyContent: isCompact ? "center" : "flex-start", padding: isCompact ? "10px 0" : "10px 12px" }}
          title="Início"
        >
          <Home size={18} />
          {!isCompact && <span>Início</span>}
        </div>
        <div
          className={`nav-item ${activeTab === "search" ? "active" : ""}`}
          onClick={() => handleTabClick("search")}
          style={{ justifyContent: isCompact ? "center" : "flex-start", padding: isCompact ? "10px 0" : "10px 12px" }}
          title="Buscar"
        >
          <Search size={18} />
          {!isCompact && <span>Buscar</span>}
        </div>
        <div
          className={`nav-item ${activeTab === "playlists" ? "active" : ""}`}
          onClick={() => handleTabClick("playlists")}
          style={{ justifyContent: isCompact ? "center" : "flex-start", padding: isCompact ? "10px 0" : "10px 12px" }}
          title="Playlists"
        >
          <ListMusic size={18} />
          {!isCompact && <span>Playlists</span>}
        </div>
        <div
          className={`nav-item ${activeTab === "scanner" ? "active" : ""}`}
          onClick={() => handleTabClick("scanner")}
          style={{ justifyContent: isCompact ? "center" : "flex-start", padding: isCompact ? "10px 0" : "10px 12px" }}
          title="My Library"
        >
          <FolderClosed size={18} />
          {!isCompact && <span>My Library</span>}
        </div>
        <div
          className={`nav-item ${activeTab === "plugins" ? "active" : ""}`}
          onClick={() => handleTabClick("plugins")}
          style={{ justifyContent: isCompact ? "center" : "flex-start", padding: isCompact ? "10px 0" : "10px 12px" }}
          title="Plugins"
        >
          <Puzzle size={18} />
          {!isCompact && <span>Plugins</span>}
        </div>
        <div
          className={`nav-item ${activeTab === "themes" ? "active" : ""}`}
          onClick={() => handleTabClick("themes")}
          style={{ justifyContent: isCompact ? "center" : "flex-start", padding: isCompact ? "10px 0" : "10px 12px" }}
          title="Themes"
        >
          <Palette size={18} />
          {!isCompact && <span>Themes</span>}
        </div>
      </nav>



      {/* Botão de Configurações no rodapé */}
      <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
        <div
          className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => handleTabClick("settings")}
          style={{ justifyContent: isCompact ? "center" : "flex-start", padding: isCompact ? "10px 0" : "10px 12px" }}
          title="Configurações"
        >
          <Settings size={18} />
          {!isCompact && <span>Configurações</span>}
        </div>
      </div>


    </aside>
  );
};
