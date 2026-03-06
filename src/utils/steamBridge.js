/**
 * Renderer-side Steam abstraction layer.
 * Calls Electron IPC when available, gracefully no-ops on web/non-Steam builds.
 * All methods are safe to call from any platform — they never throw.
 */

let ipcRenderer = null;

try {
    if (typeof window !== "undefined" && window.require) {
        const electron = window.require("electron");
        ipcRenderer = electron.ipcRenderer;
    }
} catch (e) {
    // Not in Electron — ipcRenderer stays null
}

function invoke(channel, ...args) {
    if (!ipcRenderer) return Promise.resolve(null);
    try {
        return ipcRenderer.invoke(channel, ...args);
    } catch (e) {
        return Promise.resolve(null);
    }
}

export const steamBridge = {
    /** Check if Steam SDK initialized successfully */
    async isInitialized() {
        const result = await invoke("steam:is-initialized");
        return result === true;
    },

    /** Unlock a Steam achievement by API name */
    async activateAchievement(id) {
        return invoke("steam:activate-achievement", id);
    },

    /** Get all Steam achievement states */
    async getAchievements() {
        const result = await invoke("steam:get-achievements");
        return result || [];
    },

    /** Write a file to Steam Cloud */
    async cloudWrite(filename, data) {
        return invoke("steam:cloud-write", { filename, data });
    },

    /** Read a file from Steam Cloud */
    async cloudRead(filename) {
        return invoke("steam:cloud-read", { filename });
    },

    /** Check if Steam Cloud is enabled */
    async isCloudEnabled() {
        const result = await invoke("steam:cloud-enabled");
        return result === true;
    },

    /** Get Steam display name */
    async getPlayerName() {
        return invoke("steam:get-player-name");
    },

    // --- Window management (works in Electron even without Steam) ---

    /** Toggle fullscreen mode */
    async toggleFullscreen() {
        return invoke("window:toggle-fullscreen");
    },

    /** Get current fullscreen state */
    async getFullscreen() {
        const result = await invoke("window:get-fullscreen");
        return result === true;
    },

    /** Set window bounds (width, height, x, y) */
    async setBounds(bounds) {
        return invoke("window:set-bounds", bounds);
    },

    /** Get current window bounds */
    async getBounds() {
        return invoke("window:get-bounds");
    },

    /** Check if running in Electron (IPC available) */
    get isElectron() {
        return ipcRenderer !== null;
    },
};
