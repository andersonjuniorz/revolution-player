use crate::db::repository::TrackRepository;
use crate::library::metadata::{LoftyMetadataExtractor, MetadataExtractor};
use crate::models::Track;
use rusqlite::Connection;
use std::path::Path;
use walkdir::WalkDir;

pub trait LibraryScanner {
    fn scan(&self, dir_path: &str, conn: &Connection) -> Result<Vec<Track>, String>;
}

pub struct LocalLibraryScanner<E: MetadataExtractor> {
    extractor: E,
}

impl LocalLibraryScanner<LoftyMetadataExtractor> {
    pub fn new() -> Self {
        Self {
            extractor: LoftyMetadataExtractor,
        }
    }
}

impl Default for LocalLibraryScanner<LoftyMetadataExtractor> {
    fn default() -> Self {
        Self::new()
    }
}

impl<E: MetadataExtractor> LibraryScanner for LocalLibraryScanner<E> {
    fn scan(&self, dir_path: &str, conn: &Connection) -> Result<Vec<Track>, String> {
        let repo = TrackRepository::new(conn);
        let mut tracks = Vec::new();

        // Verifica se o diretório existe
        if !Path::new(dir_path).exists() {
            return Ok(tracks); // Retorna vazio se o caminho não for válido/existente
        }

        let valid_extensions = ["mp3", "wav", "flac", "ogg", "m4a"];

        for entry in WalkDir::new(dir_path).into_iter().filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() {
                if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                    if valid_extensions.contains(&ext.to_lowercase().as_str()) {
                        let url = path.to_string_lossy().to_string();

                        // Verifica no banco de dados primeiro
                        match repo.get_track_by_url(&url) {
                            Ok(Some(track)) => {
                                // Encontrado no banco, usa esse
                                tracks.push(track);
                            }
                            Ok(None) | Err(_) => {
                                // Não encontrado, extrair os dados e salvar no banco
                                let track = self.extractor.extract(path);
                                let _ = repo.insert_track(&track); // Ignoramos erros de insert por enquanto
                                tracks.push(track);
                            }
                        }
                    }
                }
            }
        }

        Ok(tracks)
    }
}
