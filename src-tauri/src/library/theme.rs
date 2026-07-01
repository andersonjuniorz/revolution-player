use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::{Read, BufReader};
use tauri::Manager;
use zip::ZipArchive;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Theme {
    pub id: String,
    pub name: String,
    pub author: String,
    pub version: String,
    pub description: Option<String>,
}

#[tauri::command]
pub fn read_theme_manifest(zip_path: String) -> Result<Theme, String> {
    let file = File::open(&zip_path).map_err(|e| format!("Falha ao abrir arquivo zip: {}", e))?;
    let reader = BufReader::new(file);
    let mut archive = ZipArchive::new(reader).map_err(|e| format!("Arquivo zip inválido: {}", e))?;

    let mut manifest_file = archive.by_name("manifest.json").map_err(|_| "manifest.json não encontrado no zip".to_string())?;
    
    let mut contents = String::new();
    manifest_file.read_to_string(&mut contents).map_err(|e| format!("Erro ao ler manifest.json: {}", e))?;

    let theme: Theme = serde_json::from_str(&contents).map_err(|e| format!("manifest.json inválido: {}", e))?;
    Ok(theme)
}

#[tauri::command]
pub fn extract_theme(zip_path: String, theme_id: String, app: tauri::AppHandle) -> Result<(), String> {
    let app_dir = app.path().app_data_dir().map_err(|_| "Não foi possível obter diretório de dados".to_string())?;
    let themes_dir = app_dir.join("themes").join(&theme_id);

    // Se o diretório já existe, vamos limpá-lo (sobrescrever)
    if themes_dir.exists() {
        fs::remove_dir_all(&themes_dir).map_err(|e| format!("Erro ao remover tema existente: {}", e))?;
    }
    
    fs::create_dir_all(&themes_dir).map_err(|e| format!("Erro ao criar pasta do tema: {}", e))?;

    let file = File::open(&zip_path).map_err(|e| format!("Falha ao abrir arquivo zip: {}", e))?;
    let reader = BufReader::new(file);
    let mut archive = ZipArchive::new(reader).map_err(|e| format!("Arquivo zip inválido: {}", e))?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        let outpath = match file.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };

        // Queremos apenas manifest.json e theme.css na raiz
        if outpath.to_string_lossy() == "manifest.json" || outpath.to_string_lossy() == "theme.css" {
            let mut outfile = File::create(themes_dir.join(outpath)).unwrap();
            std::io::copy(&mut file, &mut outfile).unwrap();
        }
    }

    Ok(())
}

#[tauri::command]
pub fn get_installed_themes(app: tauri::AppHandle) -> Result<Vec<Theme>, String> {
    let app_dir = app.path().app_data_dir().map_err(|_| "Não foi possível obter diretório de dados".to_string())?;
    let themes_dir = app_dir.join("themes");

    let mut themes = Vec::new();

    // Se a pasta não existe, cria vazia e retorna vazio
    if !themes_dir.exists() {
        let _ = fs::create_dir_all(&themes_dir);
        // Podemos inserir o tema default aqui para o frontend saber?
        // O frontend já tem o "theme-default" mockado.
        return Ok(themes);
    }

    let entries = fs::read_dir(themes_dir).map_err(|e| format!("Erro ao ler diretório de temas: {}", e))?;

    for entry in entries.filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_dir() {
            let manifest_path = path.join("manifest.json");
            if manifest_path.exists() {
                if let Ok(contents) = fs::read_to_string(manifest_path) {
                    if let Ok(theme) = serde_json::from_str::<Theme>(&contents) {
                        themes.push(theme);
                    }
                }
            }
        }
    }

    Ok(themes)
}

#[tauri::command]
pub fn get_theme_css_path(theme_id: String, app: tauri::AppHandle) -> Result<String, String> {
    let app_dir = app.path().app_data_dir().map_err(|_| "Não foi possível obter diretório de dados".to_string())?;
    let css_path = app_dir.join("themes").join(&theme_id).join("theme.css");
    
    if css_path.exists() {
        Ok(css_path.to_string_lossy().to_string())
    } else {
        Err("Arquivo theme.css não encontrado para este tema".to_string())
    }
}
