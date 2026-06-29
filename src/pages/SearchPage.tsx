import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Search } from "lucide-react";
import { TrackTable } from "../components/TrackTable/TrackTable";

export const SearchPage: React.FC = () => {
  const { tracks } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTracks = searchQuery.trim() === "" 
    ? [] 
    : tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.album.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Buscar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0, color: "var(--text-light)", display: "flex", alignItems: "center", gap: "12px" }}>
          <Search size={28} />
          Buscar
        </h1>

        <div style={{ position: "relative", width: "300px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="scanner-input"
            placeholder="Buscar por músicas, artistas ou álbuns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", paddingLeft: "36px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px", boxSizing: "border-box" }}
          />
        </div>
      </div>

      <div>
        {searchQuery ? (
          <>
            <div className="section-title">Resultados para: "{searchQuery}"</div>
            {filteredTracks.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>Nenhum resultado corresponde à busca.</p>
            ) : (
              <TrackTable tracks={filteredTracks} />
            )}
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "30vh", color: "var(--text-muted)" }}>
            <Search size={48} style={{ opacity: 0.2, marginBottom: "16px" }} />
            <p>Digite algo para buscar músicas, artistas ou álbuns na sua biblioteca.</p>
          </div>
        )}
      </div>
    </div>
  );
};
