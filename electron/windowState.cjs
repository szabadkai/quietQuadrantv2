const { app } = require("electron");
const path = require("path");
const fs = require("fs");

const STATE_FILE = "window-state.json";

function getStatePath() {
    return path.join(app.getPath("userData"), STATE_FILE);
}

function loadWindowState() {
    try {
        const data = fs.readFileSync(getStatePath(), "utf-8");
        const state = JSON.parse(data);
        // Validate the state has expected shape
        if (
            typeof state.width === "number" &&
            typeof state.height === "number" &&
            state.width >= 960 &&
            state.height >= 600
        ) {
            return state;
        }
    } catch (e) {
        // File doesn't exist or invalid JSON — use defaults
    }
    return null;
}

function saveWindowState(win) {
    try {
        const isMaximized = win.isMaximized();
        const isFullScreen = win.isFullScreen();

        // Only save bounds when in normal windowed mode
        const bounds = !isMaximized && !isFullScreen ? win.getBounds() : null;

        const state = {
            ...(bounds || {}),
            isMaximized,
            isFullScreen,
        };

        // If maximized/fullscreen, preserve previous windowed bounds
        if (isMaximized || isFullScreen) {
            const prev = loadWindowState();
            if (prev) {
                state.width = prev.width;
                state.height = prev.height;
                state.x = prev.x;
                state.y = prev.y;
            }
        }

        fs.writeFileSync(getStatePath(), JSON.stringify(state, null, 2));
    } catch (e) {
        // Silently fail — window state is non-critical
    }
}

module.exports = { loadWindowState, saveWindowState };
