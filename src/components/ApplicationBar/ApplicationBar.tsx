import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { configService } from "../../services/ConfigService";
import { X, Square, Minus, Folder, FileAudio, LogOut, RotateCcw, RotateCw, Scissors, Copy, Clipboard, Monitor, LayoutGrid, Info } from "lucide-react";
import "./ApplicationBar.css";

interface ApplicationBarProps {
  showPractice: boolean;
  setShowPractice: (show: boolean) => void;
}

interface MenuItem {
  label: string;
  action: () => void;
  shortcut?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  divider?: boolean;
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

export const ApplicationBar: React.FC<ApplicationBarProps> = ({
  showPractice,
  setShowPractice,
}) => {
  const { setLocalDirectoryPath, setActiveTab } = useApp();
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const config = configService.getConfig();

  // Dialog / Tauri operations
  const handleOpenFile = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        filters: [{
          name: "Áudio",
          extensions: ["mp3", "wav", "ogg", "flac", "m4a"]
        }],
        multiple: false,
        title: "Selecionar Arquivo de Áudio"
      });
      if (selected) {
        const path = typeof selected === "string" ? selected : Array.isArray(selected) ? selected[0] : null;
        if (path) {
          alert(`Arquivo selecionado: ${path}\nFila de reprodução será atualizada em breve.`);
        }
      }
    } catch (err) {
      console.warn("Tauri dialog unsupported in this environment:", err);
      alert("Abertura de arquivo local disponível somente no Desktop (Tauri).");
    }
  };

  const handleOpenFolder = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Selecionar Pasta de Músicas",
      });

      if (selected) {
        const path = typeof selected === "string" ? selected : Array.isArray(selected) ? selected[0] : null;
        if (path) {
          await setLocalDirectoryPath(path);
          setActiveTab("scanner");
        }
      }
    } catch (err) {
      console.warn("Tauri folder dialog unsupported in this environment:", err);
      alert("Abertura de pasta local disponível somente no Desktop (Tauri).");
    }
  };

  const handleExit = () => {
    console.log("[UI Action] Exit app triggered");
  };

  const handleMinimize = () => {
    console.log("[UI Action] Minimize window triggered");
  };

  const handleMaximize = () => {
    console.log("[UI Action] Maximize window triggered");
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Erro ao ativar tela cheia: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Menu structure configuration (Open/Closed Principle)
  const menus: MenuSection[] = [
    {
      label: "Arquivo",
      items: [
        { label: "Abrir Arquivo...", action: handleOpenFile, shortcut: "Ctrl+O", icon: <FileAudio size={14} /> },
        { label: "Abrir Pasta...", action: handleOpenFolder, shortcut: "Ctrl+Shift+O", icon: <Folder size={14} /> },
        { label: "", action: () => {}, divider: true },
        { label: "Sair", action: handleExit, shortcut: "Alt+F4", icon: <LogOut size={14} /> }
      ]
    },
    {
      label: "Editar",
      items: [
        { label: "Desfazer", action: () => alert("Desfazer"), shortcut: "Ctrl+Z", icon: <RotateCcw size={14} />, disabled: true },
        { label: "Refazer", action: () => alert("Refazer"), shortcut: "Ctrl+Y", icon: <RotateCw size={14} />, disabled: true },
        { label: "", action: () => {}, divider: true },
        { label: "Recortar", action: () => alert("Recortar"), shortcut: "Ctrl+X", icon: <Scissors size={14} />, disabled: true },
        { label: "Copiar", action: () => alert("Copiar"), shortcut: "Ctrl+C", icon: <Copy size={14} />, disabled: true },
        { label: "Colar", action: () => alert("Colar"), shortcut: "Ctrl+V", icon: <Clipboard size={14} />, disabled: true }
      ]
    },
    {
      label: "Janela",
      items: [
        { label: "Minimizar", action: handleMinimize, icon: <Minus size={14} /> },
        { label: "Maximizar", action: handleMaximize, icon: <Square size={14} /> },
        { label: "Tela Cheia", action: handleFullscreen, shortcut: "F11", icon: <Monitor size={14} /> },
        { label: "", action: () => {}, divider: true },
        { 
          label: showPractice ? "Esconder Painel de Treino" : "Mostrar Painel de Treino", 
          action: () => setShowPractice(!showPractice), 
          shortcut: "Ctrl+T", 
          icon: <LayoutGrid size={14} /> 
        }
      ]
    },
    {
      label: "Sobre",
      items: [
        { label: "Version", action: () => setIsAboutOpen(true), icon: <Info size={14} /> }
      ]
    }
  ];

  const handleMenuHeaderClick = (index: number) => {
    if (openMenuIndex === index) {
      setOpenMenuIndex(null);
    } else {
      setOpenMenuIndex(index);
    }
  };

  const handleMenuHeaderMouseEnter = (index: number) => {
    if (openMenuIndex !== null) {
      setOpenMenuIndex(index);
    }
  };

  const handleItemClick = (action: () => void) => {
    setOpenMenuIndex(null);
    action();
  };

  return (
    <header className="application-bar" data-tauri-drag-region>

      {/* Left Menu Side */}
      <div className="app-menu-list">
        <div className="app-menu-btn" style={{ pointerEvents: "none", cursor: "default" }}>
          <span className="app-menu-logo">{config.icons.app}</span>
        </div>
        {menus.map((menu, menuIdx) => (
          <div key={menu.label} className="app-menu-item">
            <button
              className={`app-menu-btn ${openMenuIndex === menuIdx ? "active" : ""}`}
              onClick={() => handleMenuHeaderClick(menuIdx)}
              onMouseEnter={() => handleMenuHeaderMouseEnter(menuIdx)}
            >
              {menu.label}
            </button>

            {openMenuIndex === menuIdx && (
              <>
                {/* Backdrop to capture outer clicks */}
                <div className="menu-backdrop" onClick={() => setOpenMenuIndex(null)} />
                
                <div className="app-dropdown">
                  {menu.items.map((item, itemIdx) => {
                    if (item.divider) {
                      return <div key={`div-${itemIdx}`} className="app-dropdown-divider" />;
                    }
                    return (
                      <button
                        key={item.label}
                        className={`app-dropdown-item ${item.disabled ? "disabled" : ""}`}
                        disabled={item.disabled}
                        onClick={() => handleItemClick(item.action)}
                      >
                        <span className="app-dropdown-item-label">
                          {item.icon}
                          {item.label}
                        </span>
                        {item.shortcut && (
                          <span className="app-dropdown-shortcut">{item.shortcut}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ))}
      </div>


      {/* Right Native-like Window Controls */}
      <div className="app-window-controls">
        <button className="app-window-btn" onClick={handleMinimize} title="Minimizar">
          <Minus size={14} />
        </button>
        <button className="app-window-btn" onClick={handleMaximize} title="Maximizar / Restaurar">
          <Square size={12} />
        </button>
        <button className="app-window-btn close" onClick={handleExit} title="Fechar">
          <X size={14} />
        </button>
      </div>

      {/* About Dialog (Modal Window) */}
      {isAboutOpen && (
        <div className="about-modal-backdrop" onClick={() => setIsAboutOpen(false)}>
          <div className="about-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="about-modal-header">
              <span>Sobre o Player</span>
              <button className="about-modal-close" onClick={() => setIsAboutOpen(false)}>
                <X size={16} />
              </button>
            </div>
            
            <div className="about-modal-body">
              <h1 className="about-title">{config.name}</h1>
              <p className="about-version">Version: {config.version}</p>
              <p className="about-desc">{config.description}</p>
              
              <div className="about-icon-container">
                <div className="about-logo">{config.icons.app}</div>
              </div>
              
              <button className="btn-primary about-ok-btn" onClick={() => setIsAboutOpen(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
