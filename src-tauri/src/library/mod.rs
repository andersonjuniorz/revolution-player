pub mod metadata;
pub mod plugin;
pub mod scanner;
pub mod theme;

use crate::library::scanner::{LibraryScanner, LocalLibraryScanner};
use crate::models::Track;
use rusqlite::Connection;
use std::sync::Mutex;
use tauri::State;

pub struct DbState {
    pub conn: Mutex<Connection>,
}

#[tauri::command]
pub async fn scan_directory(
    path: String,
    db_state: State<'_, DbState>,
) -> Result<Vec<Track>, String> {
    let conn = db_state
        .conn
        .lock()
        .map_err(|_| "Failed to lock database".to_string())?;

    let scanner = LocalLibraryScanner::new();

    // scanner.scan retorna as tracks encontradas naquela pasta,
    scanner.scan(&path, &conn)
}

pub use plugin::{extract_plugin, get_installed_plugins, read_plugin_manifest};
pub use theme::{extract_theme, get_installed_themes, get_theme_css_path, read_theme_manifest};
