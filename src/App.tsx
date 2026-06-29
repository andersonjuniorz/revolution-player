import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { MainContent } from "./components/MainContent/MainContent";
import { PluginsSidebar } from "./components/PluginsSidebar/PluginsSidebar";
import { PracticePanel } from "./components/Practice/PracticePanel";
import { PlayerBar } from "./components/PlayerBar/PlayerBar";
import { ApplicationBar } from "./components/ApplicationBar/ApplicationBar";
import { applyTheme } from "./utils/ThemeManager";
import { configService } from "./services/ConfigService";
import defaultTheme from "./theme.json";
import "./App.css";

function AppContent() {
  const { activeThemeId } = useApp();
  const [ready, setReady] = useState(false);
  const [showPractice, setShowPractice] = useState(true);
  const [isSidebarCompact, setIsSidebarCompact] = useState(false);
  const [practiceWidth, setPracticeWidth] = useState(280);
  const config = configService.getConfig();

  // Safely initialize plugins during boot (Safe Mode concept)
  useEffect(() => {
    const initializePluginsSafely = () => {
      const plugins = configService.getPlugins();
      plugins.forEach((p) => {
        if (p.enabled) {
          try {
            console.log(`[Safe Loader] Initializing plugin: ${p.id}...`);
            // Custom plugin load script can execute here
            // If a crash happens, it is isolated to prevent UI freezing
            if (p.id === "plugin-crash-test") {
              throw new Error("Simulated plugin startup crash!");
            }
          } catch (err) {
            console.error(`[Safe Loader] Fatal crash caught in plugin "${p.id}":`, err);
            // Disable plugin in the configuration registry so it doesn't try to load again next boot
            configService.setPluginEnabled(p.id, false);
            alert(`O plugin "${p.id}" falhou na inicialização e foi desativado automaticamente.`);
          }
        }
      });
    };

    initializePluginsSafely();

    const timer = setTimeout(() => {
      setReady(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Dynamically apply selected theme properties
  useEffect(() => {
    const applyActiveTheme = () => {
      console.log(`[Theme Manager] Applying theme active ID: ${activeThemeId}`);
      if (activeThemeId === "theme-1") {
        applyTheme({
          "--bg-base": "#0b0813",
          "--bg-sidebar": "#030207",
          "--bg-card": "rgba(30, 20, 50, 0.4)",
          "--bg-card-hover": "rgba(50, 30, 80, 0.6)",
          "--bg-active": "rgba(90, 40, 140, 0.4)",
          "--border-color": "rgba(90, 40, 140, 0.3)",
          "--accent-primary": "#d946ef",
          "--accent-secondary": "#8b5cf6",
          "--text-main": "#fdfaff",
          "--text-muted": "#c084fc",
          "--text-light": "#ffffff"
        });
      } else if (activeThemeId === "theme-2") {
        applyTheme({
          "--bg-base": "#1c1917",
          "--bg-sidebar": "#0c0a09",
          "--bg-card": "rgba(44, 40, 36, 0.6)",
          "--bg-card-hover": "rgba(68, 64, 60, 0.8)",
          "--bg-active": "rgba(120, 113, 108, 0.4)",
          "--border-color": "rgba(120, 113, 108, 0.3)",
          "--accent-primary": "#f59e0b",
          "--accent-secondary": "#d97706",
          "--text-main": "#fafaf9",
          "--text-muted": "#a8a29e",
          "--text-light": "#ffffff"
        });
      } else {
        // Fallback to default
        applyTheme(defaultTheme);
      }
    };

    applyActiveTheme();
  }, [activeThemeId]);

  if (!ready) {
    return (
      <div className="boot-screen">
        <div className="boot-logo">{config.icons.app}</div>
        <h1 className="boot-title">{config.name}</h1>
        <div className="boot-spinner-container">
          <div className="boot-spinner"></div>
        </div>
        <p className="boot-subtitle">Carregando biblioteca de áudio local...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <ApplicationBar showPractice={showPractice} setShowPractice={setShowPractice} />
      
      <div 
        className={`app-layout ${showPractice ? "" : "hide-practice"}`}
        style={{
          "--sidebar-width": isSidebarCompact ? "72px" : "260px",
          "--practice-width": `${practiceWidth}px`,
        } as React.CSSProperties}
      >
        <Sidebar isCompact={isSidebarCompact} setIsCompact={setIsSidebarCompact} />
        <PluginsSidebar />
        <MainContent />
        {showPractice ? (
          <PracticePanel practiceWidth={practiceWidth} setPracticeWidth={setPracticeWidth} setShowPractice={setShowPractice} />
        ) : (
          <div 
             onMouseEnter={() => setShowPractice(true)}
             style={{
               position: "fixed",
               right: 0,
               top: "32px",
               bottom: "90px",
               width: "16px",
               cursor: "w-resize",
               zIndex: 100,
               display: "flex",
               alignItems: "center",
               justifyContent: "flex-end",
               paddingRight: "2px"
             }}
             title="Puxar Modo de Treino"
          >
            <div style={{
              width: "4px",
              height: "40px",
              backgroundColor: "var(--accent-primary)",
              borderRadius: "4px",
              opacity: 0.6
            }} />
          </div>
        )}
        <PlayerBar showPractice={showPractice} setShowPractice={setShowPractice} />
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
