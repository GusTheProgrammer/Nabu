use tauri::AppHandle;

#[cfg(not(target_os = "macos"))]
use tauri::Manager;

pub fn hide_panel(app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    #[cfg(target_os = "macos")]
    {
        use tauri_nspanel::ManagerExt;
        let panel = app_handle
            .get_webview_panel("main")
            .map_err(|e| Box::<dyn std::error::Error>::from(format!("Panel error: {:?}", e)))?;
        panel.hide();
    }

    #[cfg(not(target_os = "macos"))]
    {
        if let Some(window) = app_handle.get_webview_window("main") {
            window.hide()?;
        }
    }

    Ok(())
}

pub fn show_panel(app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    #[cfg(target_os = "macos")]
    {
        use tauri_nspanel::ManagerExt;
        let panel = app_handle
            .get_webview_panel("main")
            .map_err(|e| Box::<dyn std::error::Error>::from(format!("Panel error: {:?}", e)))?;
        panel.show_and_make_key();
    }

    #[cfg(not(target_os = "macos"))]
    {
        if let Some(window) = app_handle.get_webview_window("main") {
            window.show()?;
            window.set_focus()?;
        }
    }

    Ok(())
}

pub fn toggle_visibility(app_handle: &AppHandle) -> Result<bool, Box<dyn std::error::Error>> {
    #[cfg(target_os = "macos")]
    {
        use tauri_nspanel::ManagerExt;
        let panel = app_handle
            .get_webview_panel("main")
            .map_err(|e| Box::<dyn std::error::Error>::from(format!("Panel error: {:?}", e)))?;
        if panel.is_visible() {
            hide_panel(app_handle)?;
            Ok(false)
        } else {
            show_panel(app_handle)?;
            Ok(true)
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        if let Some(window) = app_handle.get_webview_window("main") {
            let is_visible = window.is_visible().unwrap_or(false);
            let is_focused = window.is_focused().unwrap_or(false);

            match (is_visible, is_focused) {
                (true, true) => {
                    hide_panel(app_handle)?;
                    Ok(false)
                }
                (true, false) | (false, _) => {
                    show_panel(app_handle)?;
                    Ok(true)
                }
            }
        } else {
            Ok(false)
        }
    }
}