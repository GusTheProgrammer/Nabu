use tauri::command;

#[cfg(target_os = "windows")]
use {
    windows_sys::Win32::{
        Foundation::CloseHandle,
        Security::{GetTokenInformation, TokenElevation, TOKEN_ELEVATION, TOKEN_QUERY},
        System::Threading::{GetCurrentProcess, OpenProcessToken},
    },
    winreg::{enums::HKEY_LOCAL_MACHINE, RegKey},
};

#[cfg(target_os = "windows")]
const POLICY_PATH: &str = r"SOFTWARE\Policies\Microsoft\Windows\System";
#[cfg(target_os = "windows")]
const POLICY_VALUE: &str = "AllowClipboardHistory";

#[command]
pub fn is_admin() -> bool {
    #[cfg(target_os = "windows")]
    {
        check_windows_elevation()
    }

    #[cfg(not(target_os = "windows"))]
    {
        false
    }
}

#[command]
pub fn toggle_windows_shortcut(disable: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        if !check_windows_elevation() {
            return Err("Administrator privileges required".into());
        }
        set_clipboard_policy(disable)
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = disable;
        Err("This feature is only available on Windows".into())
    }
}

#[command]
pub fn get_windows_shortcut_status() -> Result<bool, String> {
    #[cfg(target_os = "windows")]
    {
        get_clipboard_policy_status()
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(false)
    }
}

#[cfg(target_os = "windows")]
fn check_windows_elevation() -> bool {
    unsafe {
        let mut token = 0isize;

        if OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &mut token) == 0 {
            return false;
        }

        let mut elevation = TOKEN_ELEVATION { TokenIsElevated: 0 };
        let mut size = 0u32;

        let success = GetTokenInformation(
            token,
            TokenElevation,
            &mut elevation as *mut _ as *mut _,
            std::mem::size_of::<TOKEN_ELEVATION>() as u32,
            &mut size,
        );

        CloseHandle(token);

        success != 0 && elevation.TokenIsElevated != 0
    }
}

#[cfg(target_os = "windows")]
fn set_clipboard_policy(disable: bool) -> Result<(), String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);

    let (policy_key, _) = hklm
        .create_subkey(POLICY_PATH)
        .map_err(|e| format!("Failed to create policy key: {}", e))?;

    let value = if disable { 0u32 } else { 1u32 };

    policy_key
        .set_value(POLICY_VALUE, &value)
        .map_err(|e| format!("Failed to set {}: {}", POLICY_VALUE, e))?;

    Ok(())
}

#[cfg(target_os = "windows")]
fn get_clipboard_policy_status() -> Result<bool, String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);

    match hklm.open_subkey(POLICY_PATH) {
        Ok(policy_key) => match policy_key.get_value::<u32, _>(POLICY_VALUE) {
            Ok(value) => Ok(value == 0),
            Err(_) => Ok(false),
        },
        Err(_) => Ok(false),
    }
}