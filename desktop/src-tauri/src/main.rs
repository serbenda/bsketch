// sketch for the desktop: it only opens the window with the web app. It exposes no command to the
// JavaScript (no IPC of its own, no plugins), so the page cannot touch the system beyond what it could
// in a browser.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("could not open sketch");
}
