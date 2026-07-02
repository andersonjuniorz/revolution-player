import React, { useRef, useState, useEffect } from "react";
import { Layers, PanelRightClose } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LoopSection } from "./LoopSection";
import { SpeedSection } from "./SpeedSection";
import { PitchSection } from "./PitchSection";
import { PresetsSection } from "./PresetsSection";
import "./PracticePanel.css";

interface PracticePanelProps {
  practiceWidth: number;
  setPracticeWidth: (width: number) => void;
  setShowPractice: (show: boolean) => void;
}

export const PracticePanel: React.FC<PracticePanelProps> = ({
  practiceWidth,
  setPracticeWidth,
  setShowPractice
}) => {
  const { t } = useTranslation();
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Estados para reordenação
  const [isEditing, setIsEditing] = useState(false);
  const defaultOrder = ["loop", "speed", "pitch", "presets"];
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem("practice_panel_order");
    return saved ? JSON.parse(saved) : defaultOrder;
  });

  // Referências para o Drag and Drop
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = practiceWidth;

    document.querySelector(".app-layout")?.classList.add("is-dragging");
    e.preventDefault(); // prevent text selection
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const diff = startXRef.current - e.clientX;
      let newWidth = startWidthRef.current + diff;

      if (newWidth < 220) newWidth = 220;
      if (newWidth > 450) newWidth = 450;

      setPracticeWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.querySelector(".app-layout")?.classList.remove("is-dragging");
      }
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, setPracticeWidth]);

  // Drag and Drop Logic
  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;

    const _sectionOrder = [...sectionOrder];
    const draggedItemContent = _sectionOrder.splice(dragItem.current, 1)[0];
    _sectionOrder.splice(dragOverItem.current, 0, draggedItemContent);

    dragItem.current = null;
    dragOverItem.current = null;

    setSectionOrder(_sectionOrder);
    localStorage.setItem("practice_panel_order", JSON.stringify(_sectionOrder));
  };

  // Mapeamento dos componentes
  const renderSection = (id: string) => {
    switch (id) {
      case "loop":
        return <LoopSection key="loop" />;
      case "speed":
        return <SpeedSection key="speed" />;
      case "pitch":
        return <PitchSection key="pitch" />;
      case "presets":
        return <PresetsSection key="presets" />;
      default:
        return null;
    }
  };

  return (
    <aside className="practice-panel" style={{ position: "relative" }}>
      {/* Alça de Resizer */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          top: 0,
          left: -2,
          width: "6px",
          height: "100%",
          cursor: "col-resize",
          zIndex: 10,
          backgroundColor: isResizing ? "var(--accent-primary)" : "transparent",
          transition: "background-color 0.2s"
        }}
        onMouseEnter={(e) => {
          if (!isResizing) e.currentTarget.style.backgroundColor = "rgba(6, 182, 212, 0.5)";
        }}
        onMouseLeave={(e) => {
          if (!isResizing) e.currentTarget.style.backgroundColor = "transparent";
        }}
      />

      {/* Cabeçalho */}
      <div className="practice-header">
        <h3 className="practice-title">
          <Layers size={18} className="logo-text" />
          <span>{t("practice.title")}</span>
        </h3>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn-transport"
            onClick={() => setIsEditing(!isEditing)}
            title={t("practice.editMenus")}
            style={{
              padding: "4px 8px",
              background: isEditing ? "var(--accent-primary)" : "rgba(255,255,255,0.05)",
              borderRadius: "6px",
              fontSize: "0.75rem",
              color: isEditing ? "var(--text-light)" : "var(--text-main)"
            }}
          >
            {isEditing ? t("practice.done") : t("practice.edit")}
          </button>

          <button
            className="btn-transport"
            onClick={() => setShowPractice(false)}
            title={t("practice.hidePanel")}
            style={{ padding: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "6px" }}
          >
            <PanelRightClose size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {sectionOrder.map((sectionId, index) => (
          <div
            key={sectionId}
            draggable={isEditing}
            onDragStart={() => (dragItem.current = index)}
            onDragEnter={() => (dragOverItem.current = index)}
            onDragEnd={handleSort}
            onDragOver={(e) => e.preventDefault()}
            style={{
              cursor: isEditing ? "grab" : "default",
              opacity: isEditing ? 0.9 : 1,
              border: isEditing ? "1px dashed var(--accent-primary)" : "none",
              padding: isEditing ? "8px" : "0",
              borderRadius: "8px",
              position: "relative",
              backgroundColor: isEditing ? "rgba(6, 182, 212, 0.05)" : "transparent"
            }}
          >
            {renderSection(sectionId)}
          </div>
        ))}
      </div>
    </aside>
  );
};
