import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Trash, ListMusic, Plus, Edit2, ChevronLeft } from "lucide-react";
import { TrackTable } from "../components/TrackTable/TrackTable";
import "./PlaylistPage.css";

export const PlaylistPage: React.FC = () => {
  const { 
    playlists, 
    selectedPlaylistId, 
    setSelectedPlaylistId,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    removeTrackFromPlaylist
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");

  const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId);

  const openCreateModal = () => {
    setModalMode("create");
    setPlaylistName("");
    setPlaylistDescription("");
    setIsModalOpen(true);
  };

  const openEditModal = (id: string, name: string, description: string = "") => {
    setModalMode("edit");
    setEditingPlaylistId(id);
    setPlaylistName(name);
    setPlaylistDescription(description);
    setIsModalOpen(true);
  };

  const handleSavePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playlistName.trim()) {
      if (modalMode === "create") {
        await createPlaylist(playlistName.trim(), playlistDescription.trim());
      } else if (modalMode === "edit" && editingPlaylistId) {
        await updatePlaylist(editingPlaylistId, playlistName.trim(), playlistDescription.trim());
      }
      setIsModalOpen(false);
    }
  };

  const handleDeletePlaylist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir esta playlist?")) {
      await deletePlaylist(id);
      if (selectedPlaylistId === id) {
        setSelectedPlaylistId(null);
      }
    }
  };

  const handlePlaylistClick = (id: string) => {
    setSelectedPlaylistId(id);
  };

  const handleBackToDashboard = () => {
    setSelectedPlaylistId(null);
  };

  // Se NÃO houver playlist selecionada, renderiza o Dashboard
  if (!activePlaylist) {
    return (
      <div className="playlists-dashboard">
        <div className="playlists-header">
          <h1 className="playlists-title">
            <ListMusic size={28} />
            Playlists
          </h1>
          <button className="btn-primary" onClick={openCreateModal} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus size={18} />
            Nova Playlist
          </button>
        </div>

        {playlists.length === 0 ? (
          <p className="empty-message">Você ainda não tem nenhuma playlist criada.</p>
        ) : (
          <div className="playlists-grid">
            {playlists.map((playlist) => (
              <div 
                key={playlist.id} 
                className="playlist-card-dash"
                onClick={() => handlePlaylistClick(playlist.id)}
              >
                <img src={playlist.coverUrl} alt={playlist.name} className="playlist-card-cover" />
                <div className="playlist-card-info">
                  <h3 className="playlist-card-name">{playlist.name}</h3>
                  <p className="playlist-card-desc">{playlist.description}</p>
                  <span className="playlist-card-count">{playlist.tracks.length} músicas</span>
                </div>
                
                <div className="playlist-card-actions">
                  <button 
                    className="btn-action edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(playlist.id, playlist.name, playlist.description);
                    }}
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="btn-action delete"
                    onClick={(e) => handleDeletePlaylist(playlist.id, e)}
                    title="Excluir"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal para Criar/Editar */}
        {isModalOpen && (
          <div className="modal-backdrop">
            <form className="modal-content" onSubmit={handleSavePlaylist}>
              <h3 className="modal-title">{modalMode === "create" ? "Nova Playlist" : "Editar Playlist"}</h3>
              <input
                type="text"
                className="scanner-input"
                placeholder="Nome da playlist"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                autoFocus
              />
              <input
                type="text"
                className="scanner-input"
                placeholder="Descrição (Opcional)"
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
                style={{ marginTop: "12px" }}
              />
              <div className="modal-actions" style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {modalMode === "create" ? "Criar" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Se houver uma playlist selecionada, renderiza os detalhes dela
  return (
    <div>
      <button 
        className="btn-back" 
        onClick={handleBackToDashboard}
      >
        <ChevronLeft size={16} /> Voltar para Playlists
      </button>

      {/* Header da Playlist */}
      <div className="hero-banner" style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--accent-primary) 15%, transparent) 0%, color-mix(in srgb, var(--bg-active) 50%, transparent) 100%)", marginTop: "16px" }}>
        <img
          src={activePlaylist.coverUrl}
          alt={activePlaylist.name}
          className="hero-cover"
        />
        <div className="hero-info">
          <span className="hero-tag">Playlist</span>
          <h1 className="hero-title">{activePlaylist.name}</h1>
          <p className="hero-subtitle">{activePlaylist.description}</p>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {activePlaylist.tracks.length} músicas salvas
          </span>
        </div>
      </div>

      {/* Faixas da Playlist */}
      <div style={{ marginTop: "24px" }}>
        {activePlaylist.tracks.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>Esta playlist está vazia. Adicione músicas a ela pela Biblioteca.</p>
        ) : (
          <TrackTable 
            tracks={activePlaylist.tracks} 
            renderExtraActions={(track) => (
              <button
                className="btn-transport"
                onClick={() => removeTrackFromPlaylist(activePlaylist.id, track.id)}
                title="Remover da Playlist"
              >
                <Trash size={16} style={{ color: "#f87171" }} />
              </button>
            )}
          />
        )}
      </div>
    </div>
  );
};
