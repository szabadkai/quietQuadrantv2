const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const { loadWindowState, saveWindowState } = require("./windowState.cjs");

let mainWindow = null;
let saveBoundsTimeout = null;

ipcMain.on("app-exit", () => {
    app.quit();
});

// --- Window management IPC handlers ---

ipcMain.handle("window:toggle-fullscreen", () => {
    if (!mainWindow) return false;
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
    return mainWindow.isFullScreen();
});

ipcMain.handle("window:get-fullscreen", () => {
    if (!mainWindow) return false;
    return mainWindow.isFullScreen();
});

ipcMain.handle("window:set-bounds", (_event, bounds) => {
    if (!mainWindow || mainWindow.isFullScreen()) return;
    if (bounds.width && bounds.height) {
        mainWindow.setSize(bounds.width, bounds.height, true);
    }
    if (typeof bounds.x === "number" && typeof bounds.y === "number") {
        mainWindow.setPosition(bounds.x, bounds.y, true);
    }
});

ipcMain.handle("window:get-bounds", () => {
    if (!mainWindow) return null;
    return mainWindow.getBounds();
});

function createWindow() {
    const savedState = loadWindowState();

    mainWindow = new BrowserWindow({
        width: savedState?.width ?? 1200,
        height: savedState?.height ?? 800,
        x: savedState?.x,
        y: savedState?.y,
        minWidth: 960,
        minHeight: 600,
        resizable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    const startURL = !app.isPackaged
        ? "http://localhost:5173"
        : `file://${path.join(__dirname, "../dist/index.html")}`;

    // Remove the menu for all windows (Windows/Linux)
    mainWindow.removeMenu();

    mainWindow.loadURL(startURL);

    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }

    // Ensure window is focused
    mainWindow.on("ready-to-show", () => {
        mainWindow.show();
        mainWindow.focus();
    });

    // Restore maximized/fullscreen state
    if (savedState?.isMaximized) {
        mainWindow.maximize();
    }
    if (savedState?.isFullScreen) {
        mainWindow.setFullScreen(true);
    }

    // Persist window bounds on resize/move (debounced)
    const debouncedSave = () => {
        clearTimeout(saveBoundsTimeout);
        saveBoundsTimeout = setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                saveWindowState(mainWindow);
            }
        }, 500);
    };

    mainWindow.on("resize", debouncedSave);
    mainWindow.on("move", debouncedSave);
    mainWindow.on("maximize", debouncedSave);
    mainWindow.on("unmaximize", debouncedSave);
    mainWindow.on("enter-full-screen", debouncedSave);
    mainWindow.on("leave-full-screen", debouncedSave);

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    // Register F11 for fullscreen toggle
    globalShortcut.register("F11", () => {
        if (mainWindow) {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
    });

    // Set up a minimal menu for Mac to allow Quitting, but avoid interfering with game keys
    if (process.platform === "darwin") {
        const { Menu } = require("electron");
        const template = [
            {
                label: app.name,
                submenu: [
                    { role: "about" },
                    { type: "separator" },
                    { role: "services" },
                    { type: "separator" },
                    { role: "hide" },
                    { role: "hideOthers" },
                    { role: "unhide" },
                    { type: "separator" },
                    { role: "quit" },
                ],
            },
        ];
        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    } else {
        const { Menu } = require("electron");
        Menu.setApplicationMenu(null);
    }
});

app.on("will-quit", () => {
    globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

