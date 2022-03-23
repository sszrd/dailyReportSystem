import { app, BrowserWindow, ipcMain, net } from 'electron';
import { hostname, port, protocol } from "./constant/env";
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
let mainWindow: BrowserWindow;

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): BrowserWindow => {
  const mainWindow = new BrowserWindow({
    height: 720,
    width: 960,
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
    mainWindow.setSize(720, 960);
    mainWindow.setResizable(true);
  })

  ipcMain.handle("post", async (event, ...args) => {
    let body = {};
    args.forEach(arg => {
      Object.assign(body, arg);
    })
    return new Promise((resolve, reject) => {
      const request = net.request({
        method: "POST",
        protocol,
        hostname,
        port,
        path: '/users/login',
      })

      request.on("response", (response) => {
        response.on('data', (chunk) => {
          resolve(JSON.parse(chunk.toString()))
        })
      })

      request.setHeader("Content-Type", "application/json");
      request.write(JSON.stringify(body));
      request.end();
    })
  })
});

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
