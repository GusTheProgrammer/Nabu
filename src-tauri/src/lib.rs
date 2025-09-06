// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{Manager};
use tauri_plugin_global_shortcut::{ShortcutState, GlobalShortcutExt};
mod shortcuts;
mod clipboard_metadata;
mod tray;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            let default_shortcut = shortcuts::default_shortcut();

            app.manage(shortcuts::AppState {
                current_shortcut: std::sync::Mutex::new(default_shortcut),
            });

            tray::setup_tray(app)?;

            #[cfg(desktop)]
            {
                let shortcut_app_handle = app_handle.clone();

                app_handle.plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |_app, _shortcut, event| {
                            if let ShortcutState::Pressed = event.state() {
                                tray::toggle_window_visibility(&shortcut_app_handle);
                            }
                        })
                        .build(),
                )?;

                app_handle.global_shortcut().register(default_shortcut)?;
            }

            Ok(())
        })
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_clipboard::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            shortcuts::get_current_shortcut,
            shortcuts::change_shortcut,
            clipboard_metadata::get_foreground_window_title,
            clipboard_metadata::get_clipboard_source_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}