import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Search } from "lucide-react";
import { TrackTable } from "../components/TrackTable/TrackTable";
import { useTranslation } from "react-i18next";

export const SearchPage: React.FC = () => {
  const { tracks } = useApp();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTracks =
    searchQuery.trim() === ""
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
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            margin: 0,
            color: "var(--text-light)",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}
        >
          <Search size={28} />
          {t("ui.searchTitle")}
        </h1>

        <div style={{ position: "relative", width: "300px" }}>
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
            placeholder={t("ui.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      <div>
        {searchQuery ? (
          <>
            <div className="section-title">
              {t("ui.resultsFor")}: "{searchQuery}"
            </div>
            {filteredTracks.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>{t("ui.noResults")}</p>
            ) : (
              <TrackTable tracks={filteredTracks} />
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Search
              size={48}
              style={{ color: "var(--text-muted)", opacity: 0.5, marginBottom: "16px" }}
            />
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>{t("ui.typeToSearch")}</p>
          </div>
        )}
      </div>
    </div>
  );
};
