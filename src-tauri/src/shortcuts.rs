use tauri::{command, AppHandle, State};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};
use std::sync::Mutex;

pub struct AppState {
    pub current_shortcut: Mutex<Shortcut>,
}

pub fn default_shortcut() -> Shortcut {
    Shortcut::new(Some(Modifiers::CONTROL), Code::KeyT)
}

#[command]
pub fn get_current_shortcut(state: State<AppState>) -> (String, String) {
    let shortcut = state.current_shortcut.lock().unwrap();

    let modifiers_str = {
        let mut parts = Vec::new();
        if shortcut.mods.contains(Modifiers::CONTROL) { parts.push("ctrl"); }
        if shortcut.mods.contains(Modifiers::ALT) { parts.push("alt"); }
        if shortcut.mods.contains(Modifiers::SHIFT) { parts.push("shift"); }
        if shortcut.mods.contains(Modifiers::META) { parts.push("meta"); }

        if parts.is_empty() {
            "none".to_string()
        } else {
            parts.join("+")
        }
    };

    let code_str = format!("{:?}", shortcut.key);

    (modifiers_str, code_str)
}

#[command]
pub fn change_shortcut(app_handle: AppHandle, modifiers: Vec<String>, key: String, state: State<AppState>) -> Result<(), String> {
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

    let modifiers = if modifier_flags.is_empty() { None } else { Some(modifier_flags) };

    let code = match key.as_str() {
        "KeyA" => Code::KeyA,
        "KeyB" => Code::KeyB,
        "KeyC" => Code::KeyC,
        "KeyD" => Code::KeyD,
        "KeyE" => Code::KeyE,
        "KeyF" => Code::KeyF,
        "KeyG" => Code::KeyG,
        "KeyH" => Code::KeyH,
        "KeyI" => Code::KeyI,
        "KeyJ" => Code::KeyJ,
        "KeyK" => Code::KeyK,
        "KeyL" => Code::KeyL,
        "KeyM" => Code::KeyM,
        "KeyN" => Code::KeyN,
        "KeyO" => Code::KeyO,
        "KeyP" => Code::KeyP,
        "KeyQ" => Code::KeyQ,
        "KeyR" => Code::KeyR,
        "KeyS" => Code::KeyS,
        "KeyT" => Code::KeyT,
        "KeyU" => Code::KeyU,
        "KeyV" => Code::KeyV,
        "KeyW" => Code::KeyW,
        "KeyX" => Code::KeyX,
        "KeyY" => Code::KeyY,
        "KeyZ" => Code::KeyZ,

        "Digit0" => Code::Digit0,
        "Digit1" => Code::Digit1,
        "Digit2" => Code::Digit2,
        "Digit3" => Code::Digit3,
        "Digit4" => Code::Digit4,
        "Digit5" => Code::Digit5,
        "Digit6" => Code::Digit6,
        "Digit7" => Code::Digit7,
        "Digit8" => Code::Digit8,
        "Digit9" => Code::Digit9,

        "F1" => Code::F1,
        "F2" => Code::F2,
        "F3" => Code::F3,
        "F4" => Code::F4,
        "F5" => Code::F5,
        "F6" => Code::F6,
        "F7" => Code::F7,
        "F8" => Code::F8,
        "F9" => Code::F9,
        "F10" => Code::F10,
        "F11" => Code::F11,
        "F12" => Code::F12,

        "Space" => Code::Space,
        "Tab" => Code::Tab,
        "Escape" => Code::Escape,
        "Enter" => Code::Enter,
        "Backspace" => Code::Backspace,

        "ArrowUp" => Code::ArrowUp,
        "ArrowDown" => Code::ArrowDown,
        "ArrowLeft" => Code::ArrowLeft,
        "ArrowRight" => Code::ArrowRight,

        _ => return Err(format!("Unsupported key: {}", key)),
    };

    let new_shortcut = Shortcut::new(modifiers, code);

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
