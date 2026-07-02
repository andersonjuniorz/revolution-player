use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::{BufReader, Read};
use std::path::{Path, PathBuf};
use tauri::Manager;
use zip::ZipArchive;

fn find_file_recursively(dir: &Path, filename: &str) -> Option<PathBuf> {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() && path.file_name().unwrap_or_default() == filename {
                return Some(path);
            } else if path.is_dir() {
                if let Some(found) = find_file_recursively(&path, filename) {
                    return Some(found);
                }
            }
        }
    }
    None
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PluginSetting {
    pub r#type: String, // "toggle", "select", "text", "number"
    pub key: String,
    pub label: String,
    pub value: serde_json::Value,
    pub options: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Plugin {
    #[serde(default)]
    pub id: String,
    pub name: String,
    pub author: String,
    pub version: String,
    pub api_version: u32,
    pub r#type: String,
    pub entrypoint: String,
    pub signed: bool,
    pub permissions: Vec<String>,
    pub resources: Option<String>,
    #[serde(default, rename = "settingsSchema")]
    pub settings_schema: Vec<PluginSetting>,
}

#[tauri::command]
pub fn read_plugin_manifest(zip_path: String) -> Result<Plugin, String> {
    let file = File::open(&zip_path).map_err(|e| format!("Falha ao abrir arquivo zip: {}", e))?;
    let reader = BufReader::new(file);
    let mut archive =
        ZipArchive::new(reader).map_err(|e| format!("Arquivo zip inválido: {}", e))?;

    // Procura pelo manifest.json em qualquer nível de diretório dentro do zip
    let mut manifest_index = None;
    for i in 0..archive.len() {
        let file = archive.by_index(i).unwrap();
        if file.name().ends_with("manifest.json") {
            manifest_index = Some(i);
            break;
        }
    }

    let index = manifest_index.ok_or_else(|| "manifest.json não encontrado no zip".to_string())?;
    let mut manifest_file = archive.by_index(index).unwrap();

    let mut contents = String::new();
    manifest_file
        .read_to_string(&mut contents)
        .map_err(|e| format!("Erro ao ler manifest.json: {}", e))?;

    let mut plugin: Plugin =
        serde_json::from_str(&contents).map_err(|e| format!("manifest.json inválido: {}", e))?;

    // Gera um ID a partir do nome se não estiver presente
    if plugin.id.is_empty() {
        plugin.id = plugin.name.to_lowercase().replace(" ", "-");
    }

    Ok(plugin)
}

#[tauri::command]
pub fn extract_plugin(
    zip_path: String,
    plugin_id: String,
    app: tauri::AppHandle,
) -> Result<(), String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|_| "Não foi possível obter diretório de dados".to_string())?;
    let plugins_dir = app_dir.join("plugins").join(&plugin_id);

    if plugins_dir.exists() {
        fs::remove_dir_all(&plugins_dir)
            .map_err(|e| format!("Erro ao remover plugin existente: {}", e))?;
    }

    fs::create_dir_all(&plugins_dir)
        .map_err(|e| format!("Erro ao criar pasta do plugin: {}", e))?;

    let file = File::open(&zip_path).map_err(|e| format!("Falha ao abrir arquivo zip: {}", e))?;
    let reader = BufReader::new(file);
    let mut archive =
        ZipArchive::new(reader).map_err(|e| format!("Arquivo zip inválido: {}", e))?;

    // Determina o prefixo base (onde o manifest.json está localizado)
    let mut base_prefix = String::new();
    for i in 0..archive.len() {
        let file = archive.by_index(i).unwrap();
        if file.name().ends_with("manifest.json") {
            if let Some(pos) = file.name().rfind("manifest.json") {
                base_prefix = file.name()[..pos].to_string();
            }
            break;
        }
    }

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        let name = file.name().to_string();

        // Só extrai se o arquivo estiver dentro do mesmo diretório base do manifest
        if !name.starts_with(&base_prefix) {
            continue;
        }

        // Remove o prefixo base para extrair na raiz do plugins_dir
        let relative_name = &name[base_prefix.len()..];
        if relative_name.is_empty() {
            continue; // ignora a própria pasta base
        }

        let target_path = plugins_dir.join(relative_name);

        if file.is_dir() {
            fs::create_dir_all(&target_path).unwrap_or_default();
        } else {
            if let Some(parent) = target_path.parent() {
                fs::create_dir_all(parent).unwrap_or_default();
            }
            let mut outfile = File::create(&target_path)
                .map_err(|e| format!("Falha ao extrair arquivo {}: {}", relative_name, e))?;
            std::io::copy(&mut file, &mut outfile).unwrap();
        }
    }

    Ok(())
}

#[tauri::command]
pub fn get_installed_plugins(app: tauri::AppHandle) -> Result<Vec<serde_json::Value>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|_| "Não foi possível obter diretório de dados".to_string())?;
    let plugins_dir = app_dir.join("plugins");

    let mut plugins = Vec::new();

    if !plugins_dir.exists() {
        let _ = fs::create_dir_all(&plugins_dir);
        return Ok(plugins);
    }

    let entries = fs::read_dir(plugins_dir)
        .map_err(|e| format!("Erro ao ler diretório de plugins: {}", e))?;

    for entry in entries.filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_dir() {
            let manifest_path = path.join("manifest.json");
            if manifest_path.exists() {
                if let Ok(contents) = fs::read_to_string(manifest_path) {
                    if let Ok(mut plugin_json) =
                        serde_json::from_str::<serde_json::Value>(&contents)
                    {
                        // Injeta o ID baseado no nome da pasta para facilitar o frontend
                        let id = path
                            .file_name()
                            .unwrap_or_default()
                            .to_string_lossy()
                            .to_string();
                        if let Some(obj) = plugin_json.as_object_mut() {
                            obj.insert("id".to_string(), serde_json::Value::String(id));
                            if !obj.contains_key("settingsSchema") {
                                obj.insert(
                                    "settingsSchema".to_string(),
                                    serde_json::Value::Array(Vec::new()),
                                );
                            }
                        }
                        plugins.push(plugin_json);
                    }
                }
            }
        }
    }

    Ok(plugins)
}

#[tauri::command]
pub fn get_plugin_ui_schema(plugin_id: String, app: tauri::AppHandle) -> Result<String, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|_| "Erro de diretório".to_string())?;
    let ui_path = app_dir.join("plugins").join(&plugin_id).join("ui.json");

    if ui_path.exists() {
        fs::read_to_string(ui_path).map_err(|e| format!("Erro ao ler ui.json: {}", e))
    } else {
        Err("O plugin não forneceu um ui.json".to_string())
    }
}

#[tauri::command]
pub fn trigger_plugin_action(
    plugin_id: String,
    action: String,
    payload: serde_json::Value,
    app: tauri::AppHandle,
) -> Result<(), String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|_| "Erro de diretório".to_string())?;
    let plugin_dir = app_dir.join("plugins").join(&plugin_id);

    let manifest_path = plugin_dir.join("manifest.json");
    if !manifest_path.exists() {
        return Err("Manifest do plugin não encontrado.".to_string());
    }
    let manifest_str = fs::read_to_string(&manifest_path).map_err(|e| e.to_string())?;
    let manifest: Plugin = serde_json::from_str(&manifest_str).map_err(|e| e.to_string())?;

    let request = serde_json::json!({
        "jsonrpc": "2.0",
        "id": "1",
        "method": action,
        "params": payload
    });

    let entrypoint_path =
        find_file_recursively(&plugin_dir, &manifest.entrypoint).ok_or_else(|| {
            format!(
                "O executável '{}' não foi encontrado em nenhum lugar da pasta do plugin.",
                manifest.entrypoint
            )
        })?;

    let mut cmd = std::process::Command::new(&entrypoint_path);

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }

    let mut child = cmd
        .current_dir(&plugin_dir)
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Falha ao iniciar processo do plugin: {}", e))?;

    if let Some(mut stdin) = child.stdin.take() {
        use std::io::Write;
        stdin
            .write_all(request.to_string().as_bytes())
            .map_err(|e| e.to_string())?;
        stdin.write_all(b"\n").map_err(|e| e.to_string())?;
    }

    let plugin_id_clone = plugin_id.clone();
    let app_clone = app.clone();

    // Ler stdout em tempo real
    if let Some(stdout) = child.stdout.take() {
        let app_c = app_clone.clone();
        let pid_c = plugin_id_clone.clone();
        std::thread::spawn(move || {
            use std::io::{BufRead, BufReader};
            use tauri::Emitter;
            let reader = BufReader::new(stdout);
            for line in reader.lines().map_while(Result::ok) {
                let _ = app_c.emit(
                    "plugin-message",
                    serde_json::json!({
                        "pluginId": pid_c,
                        "message": line
                    }),
                );
            }
        });
    }

    std::thread::spawn(move || {
        use std::io::Read;
        use tauri::Emitter;

        let mut stderr_string = String::new();
        if let Some(mut stderr) = child.stderr.take() {
            let _ = stderr.read_to_string(&mut stderr_string);
        }

        match child.wait() {
            Ok(status) => {
                if !status.success() {
                    let err_msg = if stderr_string.trim().is_empty() {
                        format!("Processo finalizou com erro ({})", status)
                    } else {
                        stderr_string
                    };

                    let _ = app_clone.emit(
                        "plugin-error",
                        serde_json::json!({
                            "pluginId": plugin_id_clone,
                            "error": err_msg
                        }),
                    );
                }
            }
            Err(e) => {
                let _ = app_clone.emit(
                    "plugin-error",
                    serde_json::json!({
                        "pluginId": plugin_id_clone,
                        "error": format!("Falha ao aguardar processo: {}", e)
                    }),
                );
            }
        }
    });

    Ok(())
}
