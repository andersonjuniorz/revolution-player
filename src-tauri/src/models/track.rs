use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Track {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub duration: f64,
    pub url: String,
    #[serde(rename = "coverUrl")]
    pub cover_url: String,
    pub bpm: Option<u32>,
    pub key: Option<String>,
}
