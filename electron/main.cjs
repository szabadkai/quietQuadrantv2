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


    // Remove the menu for all windows (Windows/Linux)
    win.removeMenu();

    win.loadURL(startURL);

    if (!app.isPackaged) {
        win.webContents.openDevTools();
    }
    
    // Ensure window is focused
    win.on('ready-to-show', () => {
        win.show();
        win.focus();
    });
}

app.whenReady().then(() => {
    createWindow();

    // Set up a minimal menu for Mac to allow Quitting, but avoid interfering with game keys
    if (process.platform === 'darwin') {
        const { Menu } = require('electron');
        const template = [
            {
                label: app.name,
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    { role: 'services' },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'hideOthers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            }
        ];
        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    } else {
        const { Menu } = require('electron');
        Menu.setApplicationMenu(null);
    }
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

