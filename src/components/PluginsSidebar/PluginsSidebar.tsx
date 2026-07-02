import React from "react";
import { Puzzle } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const PluginsSidebar: React.FC = () => {
  const { installedPlugins, pluginStates, activeTab, setActiveTab } = useApp();

  const enabledPlugins = installedPlugins.filter((p) => pluginStates[p.id]);

  return (
    <div
      style={{
        gridArea: "plugins",
        backgroundColor: "var(--bg-card)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 0",
        gap: "16px",
        overflowY: "auto",
        zIndex: 50
      }}
    >
      {enabledPlugins.map((plugin) => (
        <button
          key={plugin.id}
          className="btn-transport"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            background:
              activeTab === `plugin-${plugin.id}`
                ? "var(--accent-primary)"
                : "rgba(255,255,255,0.05)",
            color: activeTab === `plugin-${plugin.id}` ? "white" : "inherit"
          }}
          title={plugin.name}
          onClick={() => setActiveTab(`plugin-${plugin.id}`)}
        >
          {plugin.name.toLowerCase().includes("downloader") ? (
            <DownloadIcon size={20} />
          ) : (
            <Puzzle size={20} />
          )}
        </button>
      ))}
    </div>
  );
};

// Um icone de download para o music downloader
const DownloadIcon = ({ size }: { size: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);
