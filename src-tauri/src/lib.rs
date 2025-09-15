use tauri::Manager;
use tauri_plugin_autostart::MacosLauncher;
use url_preview::PreviewService;

mod clipboard_metadata;
mod shortcuts;
mod tray;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--flag1", "--flag2"]),
        ))
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_prevent_default::debug())
        .setup(|app| {
            let app_handle = app.handle();

            app.manage(shortcuts::init_shortcut_state());
            tray::setup_tray(app)?;
            shortcuts::setup_shortcut_handler(&app_handle)?;
            app.manage(PreviewService::new());

            Ok(())
        })
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_clipboard::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            shortcuts::change_shortcut,
            clipboard_metadata::get_foreground_window_title,
            clipboard_metadata::get_clipboard_source_url,
            clipboard_metadata::generate_url_preview,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}