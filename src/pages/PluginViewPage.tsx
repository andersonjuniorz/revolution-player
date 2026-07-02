import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { message } from "@tauri-apps/plugin-dialog";
import { PluginRenderer, UIComponent } from "../components/PluginSDK/PluginRenderer";

interface PluginViewPageProps {
  pluginId: string;
}

export const PluginViewPage: React.FC<PluginViewPageProps> = ({ pluginId }) => {
  const { installedPlugins, pluginStates, localDirectoryPath } = useApp();
  const plugin = installedPlugins.find((p) => p.id === pluginId);
  const [schema, setSchema] = useState<UIComponent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [pluginError, setPluginError] = useState<string | null>(null);
  const [pluginSuccess, setPluginSuccess] = useState<string | null>(null);
  const [pluginLog, setPluginLog] = useState<string | null>(null);

  useEffect(() => {
    if (!plugin) return;

    // Request UI schema from backend
    invoke<string>("get_plugin_ui_schema", { pluginId: plugin.id })
      .then((jsonString) => {
        try {
          const parsed = JSON.parse(jsonString);
          setSchema(parsed);
        } catch (e) {
          console.error("Failed to parse UI schema", e);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch UI schema for plugin", err);
      })
      .finally(() => setLoading(false));

    // Listen for plugin errors emitted by the Rust backend
    const unlistenErr = listen("plugin-error", (event: any) => {
      if (event.payload.pluginId === plugin.id) {
        setPluginError(event.payload.error);
      }
    });

    const unlistenMsg = listen("plugin-message", (event: any) => {
      if (event.payload.pluginId === plugin.id) {
        try {
          const msg = JSON.parse(event.payload.message);
          if (msg.error) {
            setPluginError(msg.error.message);
          } else if (msg.method === "log") {
            setPluginLog(msg.params.message);
          } else if (msg.result) {
            setPluginSuccess(`Ação concluída: ${JSON.stringify(msg.result)}`);
            setPluginLog(null);

            // Exibir Dialog nativo de sucesso
            message(
              "O plugin finalizou a ação com sucesso!\n\nArquivo: " +
                (msg.result.filepath || "Verifique a pasta do plugin."),
              {
                title: "Sucesso!",
                kind: "info"
              }
            );
          }
        } catch (e) {
          console.log("Raw plugin output:", event.payload.message);
          setPluginLog(event.payload.message);
        }
      }
    });

    return () => {
      unlistenErr.then((f) => f());
      unlistenMsg.then((f) => f());
    };
  }, [plugin]);

  if (!plugin) {
    return (
      <div style={{ padding: "40px", color: "var(--text-secondary)" }}>
        <h2>Plugin não encontrado</h2>
        <p>O plugin com ID '{pluginId}' não está instalado ou foi removido.</p>
      </div>
    );
  }

  const handleAction = async (action: string, payload: any) => {
    try {
      setPluginError(null);
      setPluginSuccess(null);
      setPluginLog("Iniciando ação...");

      // Injeta variáveis de ambiente/contexto do Player no payload do plugin
      const enrichedPayload = {
        ...payload,
        output_dir: localDirectoryPath
      };

      await invoke("trigger_plugin_action", {
        pluginId: plugin.id,
        action,
        payload: enrichedPayload
      });
    } catch (err: any) {
      console.error("Plugin action failed", err);
      setPluginError(err.toString());
    }
  };

  return (
    <div
      style={{
        boxSizing: "border-box",
        padding: "24px 32px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        color: "var(--color-text-primary)",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>{plugin.name}</h1>
        <span
          style={{
            padding: "4px 8px",
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-divider)",
            borderRadius: "8px",
            fontSize: "0.75rem",
            color: "var(--text-secondary)"
          }}
        >
          Plugin
        </span>
      </div>

      {!pluginStates[plugin.id] && (
        <div
          style={{
            padding: "16px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "8px",
            color: "#f87171"
          }}
        >
          ⚠️ Este plugin está desativado. Suas funcionalidades não estão ativas no momento.
        </div>
      )}

      {pluginLog && !pluginSuccess && !pluginError && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--color-divider)",
            borderRadius: "8px",
            color: "var(--text-secondary)",
            fontSize: "0.9rem"
          }}
        >
          ⏳ {pluginLog}
        </div>
      )}

      {pluginSuccess && (
        <div
          style={{
            padding: "16px",
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "8px",
            color: "#4ade80"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px"
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1rem", color: "#22c55e" }}>Sucesso</h3>
            <button
              onClick={() => setPluginSuccess(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#86efac",
                cursor: "pointer"
              }}
            >
              ✕
            </button>
          </div>
          <pre
            style={{
              margin: 0,
              padding: "12px",
              background: "rgba(0,0,0,0.2)",
              borderRadius: "4px",
              fontSize: "0.85rem",
              whiteSpace: "pre-wrap",
              overflowX: "auto"
            }}
          >
            {pluginSuccess}
          </pre>
        </div>
      )}

      {pluginError && (
        <div
          style={{
            padding: "16px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            color: "#fca5a5"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px"
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1rem", color: "#ef4444" }}>
              Erro de Execução do Plugin
            </h3>
            <button
              onClick={() => setPluginError(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fca5a5",
                cursor: "pointer"
              }}
            >
              ✕
            </button>
          </div>
          <pre
            style={{
              margin: 0,
              padding: "12px",
              background: "rgba(0,0,0,0.2)",
              borderRadius: "4px",
              fontSize: "0.85rem",
              whiteSpace: "pre-wrap",
              overflowX: "auto"
            }}
          >
            {pluginError}
          </pre>
        </div>
      )}

      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "200px",
            color: "var(--text-muted)"
          }}
        >
          <p>Carregando interface do plugin...</p>
        </div>
      ) : schema ? (
        <div
          style={{
            boxSizing: "border-box",
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-divider)",
            borderRadius: "16px",
            padding: "24px",
            maxWidth: "500px",
            margin: "16px auto",
            width: "100%"
          }}
        >
          <PluginRenderer schema={schema} onAction={handleAction} />
        </div>
      ) : (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center"
          }}
        >
          <p>Este plugin não forneceu nenhuma interface de usuário (UI Schema).</p>
        </div>
      )}
    </div>
  );
};
