use std::path::Path;
use lofty::prelude::*;
use crate::models::Track;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

pub trait MetadataExtractor {
    fn extract(&self, file_path: &Path) -> Track;
}

pub struct LoftyMetadataExtractor;

impl MetadataExtractor for LoftyMetadataExtractor {
    fn extract(&self, file_path: &Path) -> Track {
        let url = file_path.to_string_lossy().to_string();
        
        let mut hasher = DefaultHasher::new();
        url.hash(&mut hasher);
        let id = format!("local-{}", hasher.finish());

        let filename = file_path.file_stem().unwrap_or_default().to_string_lossy().to_string();
        
        // Defaults
        let mut title = filename.clone();
        let mut artist = "Artista Desconhecido".to_string();
        let mut album = "Álbum Desconhecido".to_string();
        let mut duration = 0.0;
        
        // Tentativa de leitura com lofty
        if let Ok(tagged_file) = lofty::read_from_path(file_path) {
            duration = tagged_file.properties().duration().as_secs_f64();
            
            if let Some(tag) = tagged_file.primary_tag() {
                if let Some(t) = tag.title() {
                    title = t.to_string();
                }
                if let Some(a) = tag.artist() {
                    artist = a.to_string();
                }
                if let Some(al) = tag.album() {
                    album = al.to_string();
                }
            }
        }

        // Se o título ainda for o nome do arquivo, tentar extrair "Artista - Titulo"
        if title == filename && filename.contains('-') {
            let parts: Vec<&str> = filename.splitn(2, '-').collect();
            if parts.len() == 2 {
                artist = parts[0].trim().to_string();
                title = parts[1].trim().to_string();
            }
        }

        Track {
            id,
            title,
            artist,
            album,
            duration,
            url,
            cover_url: "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=300&auto=format&fit=crop&q=60".to_string(),
            bpm: None,
            key: None,
        }
    }
}
