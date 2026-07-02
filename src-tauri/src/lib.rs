pub mod db;
pub mod library;
pub mod models;

use library::DbState;
use std::sync::Mutex;
use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn show_main_window(window: tauri::Window) {
    let _ = window.show();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Carrega variáveis de ambiente do arquivo .env
    dotenvy::dotenv().ok();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Inicializa o banco de dados
            let app_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("."));
            std::fs::create_dir_all(&app_dir).unwrap_or_default();

            let conn = db::init_db(&app_dir).expect("Falha ao inicializar o banco de dados");

            // Gerencia o estado do DB
            app.manage(DbState {
                conn: Mutex::new(conn),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            show_main_window,
            library::scan_directory,
            library::theme::read_theme_manifest,
            library::theme::extract_theme,
            library::theme::get_installed_themes,
            library::theme::get_theme_css_path,
            library::theme::uninstall_theme,
            library::plugin::read_plugin_manifest,
            library::plugin::extract_plugin,
            library::plugin::get_installed_plugins,
            library::plugin::get_plugin_ui_schema,
            library::plugin::trigger_plugin_action
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
