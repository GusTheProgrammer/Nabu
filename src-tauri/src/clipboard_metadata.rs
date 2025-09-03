#[cfg(target_os = "windows")]
#[tauri::command]
pub fn get_foreground_window_title() -> Option<String> {
    use windows_sys::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowTextW};

    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd == 0 {
            return None;
        }

        let mut buffer = [0u16; 512];
        let len = GetWindowTextW(hwnd as _, buffer.as_mut_ptr(), buffer.len() as i32);
        if len > 0 {
            Some(String::from_utf16_lossy(&buffer[..len as usize]))
        } else {
            None
        }
    }
}

#[cfg(target_os = "windows")]
#[tauri::command]
pub fn get_clipboard_source_url() -> Option<String> {
    use std::ffi::c_void;
    use windows_sys::Win32::System::DataExchange::*;
    use windows_sys::Win32::System::Memory::*;

    unsafe {
        if OpenClipboard(0) != 0 {
            let format = RegisterClipboardFormatA(b"HTML Format\0".as_ptr());
            if IsClipboardFormatAvailable(format) != 0 {
                let handle = GetClipboardData(format);
                if handle != 0 {
                    // Cast handle (isize) to *mut c_void
                    let handle_ptr = handle as *mut c_void;
                    let ptr_data = GlobalLock(handle_ptr) as *const u8;
                    if !ptr_data.is_null() {
                        let size = GlobalSize(handle_ptr) as usize;
                        let slice = std::slice::from_raw_parts(ptr_data, size);
                        let html = String::from_utf8_lossy(slice).to_string();
                        GlobalUnlock(handle_ptr);

                        // Extract SourceURL
                        for line in html.lines() {
                            if line.starts_with("SourceURL:") {
                                return Some(line.trim_start_matches("SourceURL:").to_string());
                            }
                        }
                        return Some("No URL found".to_string());
                    }
                }
            }
            CloseClipboard();
        }
    }
    None
}

// Non-Windows platforms need stub implementations
#[cfg(not(target_os = "windows"))]
#[tauri::command]
pub fn get_foreground_window_title() -> Option<String> {
    None
}

#[cfg(not(target_os = "windows"))]
#[tauri::command]
pub fn get_clipboard_source_url() -> Option<String> {
    None
}