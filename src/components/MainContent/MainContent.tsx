import React from "react";
import { useApp } from "../../context/AppContext";
import { HomePage } from "../../pages/HomePage";
import { SearchPage } from "../../pages/SearchPage";
import { PlaylistPage } from "../../pages/PlaylistPage";
import { LibraryPage } from "../../pages/LibraryPage";
import { SettingsPage } from "../../pages/SettingsPage";
import { PluginsPage } from "../../pages/PluginsPage";
import { ThemesPage } from "../../pages/ThemesPage";
import { PluginViewPage } from "../../pages/PluginViewPage";
import "./MainContent.css";

export const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  // Render the appropriate page content
  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return <HomePage />;
      case "search":
        return <SearchPage />;
      case "playlists":
        return <PlaylistPage />;
      case "scanner":
        return <LibraryPage />;
      case "settings":
        return <SettingsPage />;
      case "plugins":
        return <PluginsPage />;
      case "themes":
        return <ThemesPage />;
      default:
        if (activeTab.startsWith("plugin-")) {
          return <PluginViewPage pluginId={activeTab.replace("plugin-", "")} />;
        }
        return <div>Página não encontrada</div>;
    }
  };

  return (
    <main className="main-content">
      {/* RENDERIZADOR DE ABAS */}
      {renderPage()}
    </main>
  );
};
