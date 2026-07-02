import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Settings, Search, FolderOpen } from "lucide-react";
import { open, message } from "@tauri-apps/plugin-dialog";
import { useTranslation } from "react-i18next";
import { configService } from "../services/ConfigService";

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    isScanning,
    localDirectoryPath,
    setLocalDirectoryPath,

    installedPlugins,
    installedThemes,
    activeThemeId,
    setActiveTheme,
    updatePluginSetting,
    installThemeFromZip
  } = useApp();
  const [tempPath, setTempPath] = useState(localDirectoryPath);
  const [settingsSearchQuery, setSettingsSearchQuery] = useState("");

  useEffect(() => {
    setTempPath(localDirectoryPath);
  }, [localDirectoryPath]);

  const handleBrowseFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Selecionar Pasta de Músicas"
      });

      if (selected) {
        const path =
          typeof selected === "string" ? selected : Array.isArray(selected) ? selected[0] : null;
        if (path) {
          setTempPath(path);
          await setLocalDirectoryPath(path);
          await message(t("settings.alerts.pathUpdated"), {
            title: t("settings.title"),
            kind: "info"
          });
        }
      }
    } catch (err) {
      console.error("Erro ao selecionar diretório via Tauri Dialog:", err);
    }
  };

  const handleResetPath = async () => {
    const defaultPath = "Songs";
    setTempPath(defaultPath);
    await setLocalDirectoryPath(defaultPath);
    await message(t("settings.alerts.pathReset"), { title: t("settings.title"), kind: "info" });
  };

  const handleImportTheme = async () => {
    try {
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
      console.error("Erro ao selecionar tema via Tauri Dialog:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header das Configurações */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
          <Settings size={28} />
          {t("settings.title")}
        </h1>

        <div style={{ position: "relative", width: "250px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)"
            }}
          />
          <input
            type="text"
            className="scanner-input"
            placeholder={t("ui.searchSettings")}
            value={settingsSearchQuery}
            onChange={(e) => setSettingsSearchQuery(e.target.value)}
            style={{
              width: "100%",
              paddingLeft: "36px",
              paddingRight: "12px",
              paddingTop: "8px",
              paddingBottom: "8px",
              boxSizing: "border-box"
            }}
          />
        </div>
      </div>

      <div className="scanner-container">
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {(!settingsSearchQuery ||
            "idioma language".includes(settingsSearchQuery.toLowerCase())) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {t("settings.language")}
              </label>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {t("settings.languageDescription")}
              </span>
              <div style={{ marginTop: "4px" }}>
                <select
                  className="scanner-input"
                  value={i18n.language}
                  onChange={(e) => {
                    i18n.changeLanguage(e.target.value);
                    configService.setLanguage(e.target.value);
                  }}
                  style={{ width: "100%", maxWidth: "300px" }}
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
            </div>
          )}

          {(!settingsSearchQuery ||
            "caminho da pasta de músicas local performance segurança".includes(
              settingsSearchQuery.toLowerCase()
            )) && (
            <>
              {/* Opção 1: Pasta de Música */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}
              >
                <label style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  {t("settings.localLibrary")}
                </label>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {t("settings.localLibraryDescription")}
                </span>

                <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                  <input
                    type="text"
                    className="scanner-input"
                    value={tempPath}
                    readOnly
                    placeholder="Nenhuma pasta selecionada. Clique em Procurar..."
                    disabled={isScanning}
                    style={{
                      backgroundColor: "rgba(0,0,0,0.25)",
                      color: "var(--text-muted)",
                      cursor: "not-allowed"
                    }}
                  />
                  <button
                    onClick={handleBrowseFolder}
                    className="btn-primary"
                    disabled={isScanning}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {t("settings.selectFolder")}
                  </button>
                  <button onClick={handleResetPath} className="btn-secondary" disabled={isScanning}>
                    {t("settings.resetDefault")}
                  </button>
                </div>
              </div>

              {/* Informação sobre Performance/Segurança */}
              <div
                style={{
                  background: "rgba(6, 182, 212, 0.05)",
                  border: "1px solid rgba(6, 182, 212, 0.15)",
                  padding: "16px",
                  borderRadius: "8px",
                  marginTop: "8px",
                  fontSize: "0.9rem",
                  color: "var(--text-main)",
                  lineHeight: "1.4"
                }}
              >
                <strong style={{ color: "var(--accent-primary)" }}>
                  {t("ui.performanceTitle")}
                </strong>
                <p
                  style={{ marginTop: "4px", fontSize: "0.85rem", opacity: 0.8, lineHeight: "1.4" }}
                >
                  {t("ui.performanceDesc")}
                </p>
              </div>
            </>
          )}

          {/* Opção 2: Temas */}
          {(!settingsSearchQuery ||
            "tema ativo themes revolution".includes(settingsSearchQuery.toLowerCase())) && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}
            >
              <label
                style={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                {t("ui.activeTheme")}
              </label>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {t("ui.activeThemeDesc")}
              </span>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}
              >
                <select
                  className="scanner-input"
                  value={activeThemeId}
                  onChange={(e) => setActiveTheme(e.target.value)}
                  style={{ width: "100%", maxWidth: "300px" }}
                >
                  {installedThemes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name} (v{theme.version})
                    </option>
                  ))}
                </select>
                <button
                  className="btn-primary"
                  onClick={handleImportTheme}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "8px",
                    padding: "6px 12px",
                    width: "fit-content"
                  }}
                >
                  <FolderOpen size={16} />
                  {t("ui.importTheme")}
                </button>
              </div>
            </div>
          )}

          {/* Configurações Injetadas de Plugins */}
          {installedPlugins.length > 0 &&
            installedPlugins.some((p) => p.settingsSchema && p.settingsSchema.length > 0) && (
              <div style={{ marginTop: "24px" }}>
                {(!settingsSearchQuery ||
                  "plugins configurações extensões".includes(
                    settingsSearchQuery.toLowerCase()
                  )) && (
                  <h4
                    style={{
                      margin: "0 0 16px 0",
                      paddingBottom: "8px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      color: "var(--text-light)"
                    }}
                  >
                    Configurações de Plugins
                  </h4>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {installedPlugins.map((plugin) => {
                    if (!plugin.settingsSchema || plugin.settingsSchema.length === 0) return null;

                    // Filtra os schemas baseando na query
                    const filteredSettings = plugin.settingsSchema.filter(
                      (setting) =>
                        !settingsSearchQuery ||
                        setting.label.toLowerCase().includes(settingsSearchQuery.toLowerCase()) ||
                        plugin.name.toLowerCase().includes(settingsSearchQuery.toLowerCase())
                    );

                    if (filteredSettings.length === 0) return null;

                    return (
                      <div
                        key={plugin.id}
                        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--accent-primary)",
                            fontSize: "0.9rem"
                          }}
                        >
                          {plugin.name}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            background: "rgba(0,0,0,0.15)",
                            padding: "16px",
                            borderRadius: "8px"
                          }}
                        >
                          {filteredSettings.map((setting) => (
                            <div
                              key={setting.key}
                              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
                            >
                              <label style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                                {setting.label}
                              </label>

                              {setting.type === "toggle" && (
                                <label
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    cursor: "pointer",
                                    width: "fit-content"
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={setting.value}
                                    onChange={(e) =>
                                      updatePluginSetting(plugin.id, setting.key, e.target.checked)
                                    }
                                  />
                                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                    {setting.value ? "Ativado" : "Desativado"}
                                  </span>
                                </label>
                              )}

                              {setting.type === "select" && setting.options && (
                                <select
                                  className="scanner-input"
                                  value={setting.value}
                                  onChange={(e) =>
                                    updatePluginSetting(plugin.id, setting.key, e.target.value)
                                  }
                                  style={{ width: "100%", maxWidth: "300px" }}
                                >
                                  {setting.options.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              )}

                              {setting.type === "text" && (
                                <input
                                  type="text"
                                  className="scanner-input"
                                  value={setting.value}
                                  onChange={(e) =>
                                    updatePluginSetting(plugin.id, setting.key, e.target.value)
                                  }
                                  style={{ width: "100%", maxWidth: "300px" }}
                                />
                              )}

                              {setting.type === "number" && (
                                <input
                                  type="number"
                                  className="scanner-input"
                                  value={setting.value}
                                  onChange={(e) =>
                                    updatePluginSetting(
                                      plugin.id,
                                      setting.key,
                                      Number(e.target.value)
                                    )
                                  }
                                  style={{ width: "100%", maxWidth: "150px" }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
