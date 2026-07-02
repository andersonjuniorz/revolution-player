import React, { useState } from "react";
import { Input } from "../ui/Input/Input";
import { Button } from "../ui/Button/Button";

export type UIComponentType =
  "text" | "input" | "button" | "toggle-group" | "icon-wrapper" | "container";

export interface UIComponent {
  id: string;
  type: UIComponentType;
  props?: Record<string, any>;
  children?: UIComponent[];
}

export interface PluginUIRenderProps {
  schema: UIComponent[];
  onAction: (action: string, payload: any) => void;
}

export const PluginRenderer: React.FC<PluginUIRenderProps> = ({ schema, onAction }) => {
  const [state, setState] = useState<Record<string, any>>({});

  const handleStateChange = (id: string, value: any) => {
    setState((prev) => ({ ...prev, [id]: value }));
  };

  const renderComponent = (comp: UIComponent) => {
    switch (comp.type) {
      case "container":
        return (
          <div
            key={comp.id}
            style={{
              display: "flex",
              flexDirection: comp.props?.direction || "column",
              gap: comp.props?.gap || "16px",
              ...comp.props?.style
            }}
          >
            {comp.children?.map(renderComponent)}
          </div>
        );

      case "text":
        const Tag =
          comp.props?.variant === "title" ? "h2" : comp.props?.variant === "subtitle" ? "h3" : "p";
        return (
          <Tag key={comp.id} style={{ margin: 0, color: comp.props?.color, ...comp.props?.style }}>
            {comp.props?.text}
          </Tag>
        );

      case "input":
        return (
          <Input
            key={comp.id}
            type={comp.props?.inputType || "text"}
            placeholder={comp.props?.placeholder}
            value={state[comp.id] || ""}
            onChange={(e) => handleStateChange(comp.id, e.target.value)}
            disabled={comp.props?.disabled}
            label={comp.props?.label}
          />
        );

      case "toggle-group":
        const options = comp.props?.options || [];
        const activeOption = state[comp.id] || options[0]?.value;
        return (
          <div key={comp.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {comp.props?.label && (
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase"
                }}
              >
                {comp.props.label}
              </label>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${options.length}, 1fr)`,
                gap: "16px"
              }}
            >
              {options.map((opt: any) => (
                <button
                  key={opt.value}
                  onClick={() => handleStateChange(comp.id, opt.value)}
                  style={{
                    padding: "12px",
                    borderRadius: "12px",
                    background:
                      activeOption === opt.value ? "rgba(0,0,0,0.2)" : "var(--color-bg-surface)",
                    border: `2px solid ${activeOption === opt.value ? "var(--color-accent)" : "transparent"}`,
                    color:
                      activeOption === opt.value
                        ? "var(--color-text-primary)"
                        : "var(--color-text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                    outline: "none"
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>{opt.label}</span>
                  {opt.description && (
                    <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{opt.description}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case "button":
        return (
          <Button
            key={comp.id}
            variant={comp.props?.variant || "primary"}
            onClick={() => onAction(comp.props?.action, { ...state })}
            disabled={comp.props?.disabled}
            style={{ width: "100%" }}
          >
            {comp.props?.label}
          </Button>
        );

      default:
        return <div key={comp.id}>Unsupported Component: {comp.type}</div>;
    }
  };

  return (
    <div
      className="plugin-ui-renderer"
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
    >
      {schema.map(renderComponent)}
    </div>
  );
};
