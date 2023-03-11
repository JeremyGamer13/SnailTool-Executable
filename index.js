const { app, BrowserWindow, dialog, ipcMain, Tray } = require('electron')
const path = require('path')

const IsDeveloperMode = true

function createWindow() {
    const win = new BrowserWindow({
        title: "SnailTool",
        icon: "wrench.png",
        width: 1280,
        height: 720,
        backgroundColor: "#F0F0F0",
        webPreferences: {
            devTools: IsDeveloperMode,
            sandbox: false,
            spellcheck: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html')
    if (!IsDeveloperMode) win.removeMenu()
    return win
}

let window = null
app.whenReady().then(() => {
    window = createWindow()
    app.___createdWindowForUse = window
    app.setName('SnailTool')
    app.setAppUserModelId('com.jeremygamer13.snailtool')

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            window = createWindow()
            app.___createdWindowForUse = window
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

const MenuMemory = {}
ipcMain.handle("showDialog", (_, message) => {
    return dialog.showMessageBoxSync(null, JSON.parse(message))
})
ipcMain.handle("showOpenDialog", (_, data) => {
    return dialog.showOpenDialog(null, JSON.parse(data))
})
ipcMain.handle("showSaveDialog", (_, data) => {
    return dialog.showSaveDialog(null, JSON.parse(data))
})
ipcMain.handle("setProgress", (_, precentage) => {
    return window.setProgressBar(Number(precentage))
})
ipcMain.handle("quitApp", (_, __) => {
    app.quit()
})
ipcMain.handle("switchMenuFile", (_, file) => {
    window.loadFile(file)
})
// menu memory management
ipcMain.handle("saveToMemory", (_, data) => {
    const parsed = JSON.parse(data)
    MenuMemory[parsed.key] = parsed.value
})
ipcMain.handle("getFromMemory", (_, key) => {
    return MenuMemory[key]
})
ipcMain.handle("deleteFromMemory", (_, key) => {
    delete MenuMemory[key]
})
ipcMain.handle("existsInMemory", (_, key) => {
    return MenuMemory[key] != null || MenuMemory[key] != undefined
})