const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

ipcMain.on("app-exit", () => {
    app.quit();
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    const startURL = !app.isPackaged
        ? "http://localhost:5173"
        : `file://${path.join(__dirname, "../dist/index.html")}`;

    win.loadURL(startURL);

    if (!app.isPackaged) {
        win.webContents.openDevTools();
    }
}

app.whenReady().then(createWindow);

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
