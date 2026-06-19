import { app, BrowserWindow, desktopCapturer, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;
let studio: BrowserWindow | null;
let floatingWebCam: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 600,
    minHeight: 600,
    minWidth: 300,
    hasShadow: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    focusable: true,
    icon: path.join(process.env.VITE_PUBLIC, "reco-d-logo.svg"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  studio = new BrowserWindow({
    width: 400,
    minHeight: 70,
    minWidth: 300,
    maxWidth: 400,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    focusable: false,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  floatingWebCam = new BrowserWindow({
    width: 200,
    height: 200,
    minHeight: 20,
    maxHeight: 200,
    minWidth: 200,
    maxWidth: 200,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    focusable: false,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
      preload: path.join(__dirname, "preload.mjs"),
    },
  });


  // Ensure the windows are visible on all workspaces(desktops), including full-screen ones
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  studio.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  floatingWebCam.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

 // set the windows to be always on top of other windows, even in full-screen mode, and give them a higher priority than the default "always on top" windows
  win.setAlwaysOnTop(true, "screen-saver", 1);
  studio.setAlwaysOnTop(true, "screen-saver", 1);
  floatingWebCam.setAlwaysOnTop(true, "screen-saver", 1);


  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  studio.webContents.on("did-finish-load", () => {
    studio?.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    studio.loadURL(`${VITE_DEV_SERVER_URL}/studio.html`);
    floatingWebCam.loadURL(`${VITE_DEV_SERVER_URL}/webcam.html`);
  } else {
    win.loadURL(`file://${path.join(RENDERER_DIST, "index.html")}`);
    studio.loadURL(`file://${path.join(RENDERER_DIST, "studio.html")}`);
    floatingWebCam.loadURL(`file://${path.join(RENDERER_DIST, "webcam.html")}`);
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
    studio = null;
    floatingWebCam = null;
  }
});

ipcMain.on("closeApp", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
    studio = null;
    floatingWebCam = null;
  }
});

ipcMain.handle("getSources", async () => {
  const data = await desktopCapturer.getSources({
    thumbnailSize: { height: 100, width: 150 },
    fetchWindowIcons: true,
    types: ["window", "screen"],
  });
  return data;
});

ipcMain.on("media-sources", (event, payload) => {
  console.log(event);
  studio?.webContents.send("profile-received", payload);
});

ipcMain.on("resize-studio", (event, payload) => {
  console.log(event);
  if (payload.shrink) {
    studio?.setSize(400, 100);
  }
  if (!payload.shrink) {
    studio?.setSize(400, 250);
  }
});

ipcMain.on("hide-plugin", (event, payload) => {
  console.log(event);
  win?.webContents.send("hide-plugin", payload);
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);