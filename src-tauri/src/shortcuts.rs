use std::sync::Mutex;
use tauri::{command, AppHandle, State};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, ShortcutState, Modifiers, Shortcut};
use crate::tray;

pub struct AppState {
    pub current_shortcut: Mutex<Shortcut>,
}

pub fn default_shortcut() -> Shortcut {
    Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space)
}

pub fn init_shortcut_state() -> AppState {
    AppState {
        current_shortcut: Mutex::new(default_shortcut()),
    }
}

#[cfg(desktop)]
pub fn setup_shortcut_handler(app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
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

    app_handle.global_shortcut().register(default_shortcut())?;
    Ok(())
}

#[command]
pub fn change_shortcut(
    app_handle: AppHandle,
    modifiers: Vec<String>,
    key: String,
    state: State<AppState>,
) -> Result<(), String> {
    let mut modifier_flags = Modifiers::empty();

    for modifier in modifiers {
        match modifier.as_str() {
            "ctrl" => modifier_flags = modifier_flags | Modifiers::CONTROL,
            "shift" => modifier_flags = modifier_flags | Modifiers::SHIFT,
            "alt" => modifier_flags = modifier_flags | Modifiers::ALT,
            "meta" => modifier_flags = modifier_flags | Modifiers::META,
            _ => return Err(format!("Unsupported modifier: {}", modifier)),
        }
    }

    let code = parse_key_code(&key)?;
    let new_shortcut = Shortcut::new(
        if modifier_flags.is_empty() { None } else { Some(modifier_flags) },
        code
    );

    let mut current = state.current_shortcut.lock().unwrap();

    if let Err(e) = app_handle.global_shortcut().unregister(*current) {
        return Err(format!("Failed to unregister old shortcut: {}", e));
    }

    if let Err(e) = app_handle.global_shortcut().register(new_shortcut) {
        let _ = app_handle.global_shortcut().register(*current);
        return Err(format!("Failed to register new shortcut: {}", e));
    }

    *current = new_shortcut;
    Ok(())
}

fn parse_key_code(key: &str) -> Result<Code, String> {
    match key {
        "KeyA" => Ok(Code::KeyA), "KeyB" => Ok(Code::KeyB), "KeyC" => Ok(Code::KeyC),
        "KeyD" => Ok(Code::KeyD), "KeyE" => Ok(Code::KeyE), "KeyF" => Ok(Code::KeyF),
        "KeyG" => Ok(Code::KeyG), "KeyH" => Ok(Code::KeyH), "KeyI" => Ok(Code::KeyI),
        "KeyJ" => Ok(Code::KeyJ), "KeyK" => Ok(Code::KeyK), "KeyL" => Ok(Code::KeyL),
        "KeyM" => Ok(Code::KeyM), "KeyN" => Ok(Code::KeyN), "KeyO" => Ok(Code::KeyO),
        "KeyP" => Ok(Code::KeyP), "KeyQ" => Ok(Code::KeyQ), "KeyR" => Ok(Code::KeyR),
        "KeyS" => Ok(Code::KeyS), "KeyT" => Ok(Code::KeyT), "KeyU" => Ok(Code::KeyU),
        "KeyV" => Ok(Code::KeyV), "KeyW" => Ok(Code::KeyW), "KeyX" => Ok(Code::KeyX),
        "KeyY" => Ok(Code::KeyY), "KeyZ" => Ok(Code::KeyZ),
        "Digit0" => Ok(Code::Digit0), "Digit1" => Ok(Code::Digit1), "Digit2" => Ok(Code::Digit2),
        "Digit3" => Ok(Code::Digit3), "Digit4" => Ok(Code::Digit4), "Digit5" => Ok(Code::Digit5),
        "Digit6" => Ok(Code::Digit6), "Digit7" => Ok(Code::Digit7), "Digit8" => Ok(Code::Digit8),
        "Digit9" => Ok(Code::Digit9),
        "F1" => Ok(Code::F1), "F2" => Ok(Code::F2), "F3" => Ok(Code::F3), "F4" => Ok(Code::F4),
        "F5" => Ok(Code::F5), "F6" => Ok(Code::F6), "F7" => Ok(Code::F7), "F8" => Ok(Code::F8),
        "F9" => Ok(Code::F9), "F10" => Ok(Code::F10), "F11" => Ok(Code::F11), "F12" => Ok(Code::F12),
        "Space" => Ok(Code::Space), "Tab" => Ok(Code::Tab), "Escape" => Ok(Code::Escape),
        "Enter" => Ok(Code::Enter), "Backspace" => Ok(Code::Backspace),
        "ArrowUp" => Ok(Code::ArrowUp), "ArrowDown" => Ok(Code::ArrowDown),
        "ArrowLeft" => Ok(Code::ArrowLeft), "ArrowRight" => Ok(Code::ArrowRight),
        "Delete" => Ok(Code::Delete), "Insert" => Ok(Code::Insert),
        "Home" => Ok(Code::Home), "End" => Ok(Code::End),
        "PageUp" => Ok(Code::PageUp), "PageDown" => Ok(Code::PageDown),
        "CapsLock" => Ok(Code::CapsLock), "ScrollLock" => Ok(Code::ScrollLock),
        "NumLock" => Ok(Code::NumLock), "PrintScreen" => Ok(Code::PrintScreen),
        "Pause" => Ok(Code::Pause),
        "Numpad0" => Ok(Code::Numpad0), "Numpad1" => Ok(Code::Numpad1), "Numpad2" => Ok(Code::Numpad2),
        "Numpad3" => Ok(Code::Numpad3), "Numpad4" => Ok(Code::Numpad4), "Numpad5" => Ok(Code::Numpad5),
        "Numpad6" => Ok(Code::Numpad6), "Numpad7" => Ok(Code::Numpad7), "Numpad8" => Ok(Code::Numpad8),
        "Numpad9" => Ok(Code::Numpad9),
        "NumpadAdd" => Ok(Code::NumpadAdd), "NumpadSubtract" => Ok(Code::NumpadSubtract),
        "NumpadMultiply" => Ok(Code::NumpadMultiply), "NumpadDivide" => Ok(Code::NumpadDivide),
        "NumpadDecimal" => Ok(Code::NumpadDecimal), "NumpadEnter" => Ok(Code::NumpadEnter),
        "NumpadEqual" => Ok(Code::NumpadEqual),
        "Semicolon" => Ok(Code::Semicolon), "Equal" => Ok(Code::Equal),
        "Comma" => Ok(Code::Comma), "Minus" => Ok(Code::Minus),
        "Period" => Ok(Code::Period), "Slash" => Ok(Code::Slash),
        "Backquote" => Ok(Code::Backquote), "BracketLeft" => Ok(Code::BracketLeft),
        "Backslash" => Ok(Code::Backslash), "BracketRight" => Ok(Code::BracketRight),
        "Quote" => Ok(Code::Quote),
        _ => Err(format!("Unsupported key: {}", key)),
    }
}