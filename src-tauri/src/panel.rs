use tauri::{App, Manager};
use tauri_nspanel::{tauri_panel, CollectionBehavior, PanelLevel, StyleMask, WebviewWindowExt};

tauri_panel! {
    panel!(ClipboardPanel {
        config: {
            can_become_key_window: true,
            can_become_main_window: false,
            is_floating_panel: true
        }
    })

    panel_event!(ClipboardPanelEventHandler {
        window_did_resign_key(notification: &NSNotification) -> ()
    })
}

pub fn setup_panel(app: &App) {
    if let Some(window) = app.get_webview_window("main") {
        if let Ok(panel) = window.to_panel::<ClipboardPanel>() {
            panel.set_level(PanelLevel::Normal.value());
            panel.set_style_mask(StyleMask::empty().nonactivating_panel().resizable().into());
            panel.set_collection_behavior(
                CollectionBehavior::new()
                    .full_screen_auxiliary()
                    .can_join_all_spaces()
                    .into(),
            );

            let handler = ClipboardPanelEventHandler::new();
            let app_handle = app.app_handle().clone();

            handler.window_did_resign_key(move |_| {
                let _ = crate::visibility::hide_panel(&app_handle);
            });

            panel.set_event_handler(Some(handler.as_ref()));
        }
    }
}
