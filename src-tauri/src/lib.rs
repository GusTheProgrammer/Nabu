use tauri::Manager;
use tauri_plugin_autostart::MacosLauncher;
use url_preview::PreviewService;

mod clipboard_metadata;
mod shortcuts;
mod tray;
mod visibility;

#[cfg(target_os = "macos")]
mod panel;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--flag1", "--flag2"]),
        ))
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_prevent_default::debug());

    #[cfg(target_os = "macos")]
    {
        builder = builder.plugin(tauri_nspanel::init());
    }

    builder
        .setup(|app| {
            let app_handle = app.handle();

            app.manage(shortcuts::init_shortcut_state());
            tray::setup_tray(app)?;
            shortcuts::setup_shortcut_handler(&app_handle)?;
            app.manage(PreviewService::new());

            #[cfg(target_os = "macos")] // Hide app icon in Dock
            {
                use tauri::ActivationPolicy;
                app.set_activation_policy(ActivationPolicy::Accessory);
                panel::setup_panel(app);
            }

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
            clipboard_metadata::paste,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
