use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, AppHandle, Manager,
};

pub fn setup_tray(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&quit_i])?;

    TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app_handle, event| {
            if event.id() == "quit" {
                app_handle.exit(0);
            }
        })
        .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } => {
                toggle_window_visibility(&tray.app_handle());
            }
            _ => {}
        })
        .build(app)?;

    Ok(())
}

pub fn toggle_window_visibility(app_handle: &AppHandle) {
    let Some(window) = app_handle.get_webview_window("main") else {
        return;
    };

    let is_visible = window.is_visible().unwrap_or(false);
    let is_focused = window.is_focused().unwrap_or(false);

    match (is_visible, is_focused) {
        (true, true) => {
            let _ = window.hide();
        }
        (true, false) => {
            let _ = window.set_focus();
        }
        (false, _) => {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}
