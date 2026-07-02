import React from "react";
import { Download, Trash2, Palette } from "lucide-react";
import { useApp } from "../context/AppContext";
import { BUILT_IN_THEME_IDS } from "../constants/themes";
import { useTranslation } from "react-i18next";
// Usando o mesmo CSS da página de plugins já que a estrutura é idêntica
import "./PluginsPage.css";

export const ThemesPage: React.FC = () => {
  const { installedThemes, uninstallTheme, installThemeFromZip } = useApp();
  const { t } = useTranslation();

  const handleImport = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        filters: [{ name: "Temas", extensions: ["zip"] }],
        multiple: false,
        title: "Selecionar Tema (.zip)"
      });
      if (selected) {
        const path =
          typeof selected === "string" ? selected : Array.isArray(selected) ? selected[0] : null;
        if (path) {
          await installThemeFromZip(path);
        }
      }
    } catch (err) {
      console.error("Erro ao selecionar tema:", err);
    }
  };

  const handleUninstall = (id: string) => {
    uninstallTheme(id);
  };

  return (
    <div className="plugins-page-container">
      <div className="plugins-header">
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            margin: 0,
            color: "var(--text-main)",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}
        >
          <Palette size={28} />
          {t("ui.themesTitle")}
        </h1>
        <button
          className="btn-primary"
          onClick={handleImport}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Download size={18} />
          {t("ui.importTheme")}
        </button>
      </div>

      <div className="plugins-list-container">
        {installedThemes.length === 0 ? (
          <p className="empty-message">{t("ui.noThemeInstalled")}</p>
        ) : (
          <div className="plugins-list">
            {installedThemes.map((theme) => (
              <div key={theme.id} className="plugin-card">
                <div className="plugin-info">
                  <h3 className="plugin-name">{theme.name}</h3>
                  <span className="plugin-author">
                    By {theme.author} • v{theme.version}
                  </span>
                </div>
                {!BUILT_IN_THEME_IDS.includes(theme.id) && (
                  <button
                    className="btn-uninstall"
                    onClick={() => handleUninstall(theme.id)}
                    title={t("ui.uninstallTheme")}
                  >
                    <Trash2 size={18} />
                    {t("ui.uninstall")}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
