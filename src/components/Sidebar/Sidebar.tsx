import React from "react";
import { useApp } from "../../context/AppContext";
import {
  Home,
  Search,
  FolderClosed,
  Settings,
  ChevronLeft,
  ChevronRight,
  Puzzle,
  Palette,
  ListMusic
} from "lucide-react";
import { useTranslation } from "react-i18next";
import "./Sidebar.css";

interface SidebarProps {
  isCompact: boolean;
  setIsCompact: (compact: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCompact, setIsCompact }) => {
  const { activeTab, setActiveTab, setSelectedPlaylistId } = useApp();
  const { t } = useTranslation();

  const handleTabClick = (
    tab: "home" | "search" | "scanner" | "settings" | "plugins" | "themes" | "playlists"
  ) => {
    setActiveTab(tab);
    setSelectedPlaylistId(null);
  };

  return (
    <aside
      className="sidebar"
      style={{ padding: isCompact ? "20px 8px" : "20px 16px", overflowX: "hidden" }}
    >
      {/* Seção de Logo e Toggle */}
      <div
        className="logo-section"
        style={{ justifyContent: isCompact ? "center" : "space-between" }}
      >
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
          style={{
            justifyContent: isCompact ? "center" : "flex-start",
            padding: isCompact ? "10px 0" : "10px 12px"
          }}
          title={t("sidebar.home")}
        >
          <Home size={18} />
          {!isCompact && <span>{t("sidebar.home")}</span>}
        </div>
        <div
          className={`nav-item ${activeTab === "search" ? "active" : ""}`}
          onClick={() => handleTabClick("search")}
          style={{
            justifyContent: isCompact ? "center" : "flex-start",
            padding: isCompact ? "10px 0" : "10px 12px"
          }}
          title={t("sidebar.search")}
        >
          <Search size={18} />
          {!isCompact && <span>{t("sidebar.search")}</span>}
        </div>
        <div
          className={`nav-item ${activeTab === "playlists" ? "active" : ""}`}
          onClick={() => handleTabClick("playlists")}
          style={{
            justifyContent: isCompact ? "center" : "flex-start",
            padding: isCompact ? "10px 0" : "10px 12px"
          }}
          title={t("sidebar.playlists")}
        >
          <ListMusic size={18} />
          {!isCompact && <span>{t("sidebar.playlists")}</span>}
        </div>
        <div
          className={`nav-item ${activeTab === "scanner" ? "active" : ""}`}
          onClick={() => handleTabClick("scanner")}
          style={{
            justifyContent: isCompact ? "center" : "flex-start",
            padding: isCompact ? "10px 0" : "10px 12px"
          }}
          title={t("sidebar.myLibrary")}
        >
          <FolderClosed size={18} />
          {!isCompact && <span>{t("sidebar.myLibrary")}</span>}
        </div>
        <div
          className={`nav-item ${activeTab === "plugins" ? "active" : ""}`}
          onClick={() => handleTabClick("plugins")}
          style={{
            justifyContent: isCompact ? "center" : "flex-start",
            padding: isCompact ? "10px 0" : "10px 12px"
          }}
          title={t("sidebar.plugins")}
        >
          <Puzzle size={18} />
          {!isCompact && <span>{t("sidebar.plugins")}</span>}
        </div>
        <div
          className={`nav-item ${activeTab === "themes" ? "active" : ""}`}
          onClick={() => handleTabClick("themes")}
          style={{
            justifyContent: isCompact ? "center" : "flex-start",
            padding: isCompact ? "10px 0" : "10px 12px"
          }}
          title={t("sidebar.themes")}
        >
          <Palette size={18} />
          {!isCompact && <span>{t("sidebar.themes")}</span>}
        </div>
      </nav>

      {/* Botão de Configurações no rodapé */}
      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid var(--border-color)",
          paddingTop: "12px"
        }}
      >
        <div
          className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => handleTabClick("settings")}
          style={{
            justifyContent: isCompact ? "center" : "flex-start",
            padding: isCompact ? "10px 0" : "10px 12px"
          }}
          title={t("sidebar.settings")}
        >
          <Settings size={18} />
          {!isCompact && <span>{t("sidebar.settings")}</span>}
        </div>
      </div>
    </aside>
  );
};
