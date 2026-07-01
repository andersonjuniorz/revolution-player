import React from "react";
import { Bug } from "lucide-react";

export const PluginsSidebar: React.FC = () => {
  return (
    <div style={{
      gridArea: "plugins",
      backgroundColor: "var(--bg-card)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px 0",
      gap: "16px",
      overflowY: "auto",
      zIndex: 50
    }}>
      {/* Plugin Icons */}
      <button 
        className="btn-transport" 
        style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(255,255,255,0.05)" }}
        title="Debug Plugin"
      >
        <Bug size={20} />
      </button>
    </div>
  );
};
