import { app, BrowserWindow, dialog, ipcMain, net } from 'electron';
import { hostname, port, protocol } from "./constant/env";
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
let mainWindow: BrowserWindow;

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): BrowserWindow => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  //mainWindow.setMenu(null);
  mainWindow.webContents.openDevTools();
  return mainWindow;
};

app.on('ready', () => {
  mainWindow = createWindow();

  ipcMain.on("goto login page", () => {
    mainWindow.setSize(300, 600);
    mainWindow.setResizable(false);
  })

  ipcMain.on("goto home page", () => {
    mainWindow.setSize(1200, 900);
    mainWindow.setResizable(true);
  })

  ipcMain.on("show message-box", (event, arg) => {
    dialog.showMessageBox({
      type: "info",
      title: "提示",
      message: arg,
      buttons: ["ok"]
    })
  })

  ipcMain.handle("post", async (event, path, body, token) => {
    return new Promise((resolve, reject) => {
      const request = net.request({
        method: "POST",
        protocol,
        hostname,
        port,
        path,
      })
      request.on("response", (response) => {
        response.on('data', (chunk) => {
          resolve(JSON.parse(chunk.toString()));
        })
      })
      request.setHeader("Content-Type", "application/json");
      token && request.setHeader("Authorization", `Bearer ${token}`);
      request.write(JSON.stringify(body));
      request.end();
    })
  })
});

ipcMain.handle("get", async (event, path, token) => {
  return new Promise((resolve, reject) => {
    const request = net.request({
      method: "Get",
      protocol,
      hostname,
      port,
      path,
    })
    request.on("response", (response) => {
      response.on('data', (chunk) => {
        resolve(JSON.parse(chunk.toString()));
      })
    })
    token && request.setHeader("Authorization", `Bearer ${token}`);
    request.end();
  })
});

ipcMain.handle("patch", async (event, path, body, token) => {
  return new Promise((resolve, reject) => {
    const request = net.request({
      method: "PATCH",
      protocol,
      hostname,
      port,
      path,
    })
    request.on("response", (response) => {
      response.on('data', (chunk) => {
        resolve(JSON.parse(chunk.toString()));
      })
    })
    request.setHeader("Content-Type", "application/json");
    token && request.setHeader("Authorization", `Bearer ${token}`);
    request.write(JSON.stringify(body));
    request.end();
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
  }
});
